-- green.: el pago con Mercado Pago (Checkout Pro).
--
-- Se corre una sola vez, entera, en el SQL Editor de Supabase, después de
-- 0001_esquema.sql. Va en una transacción: si algo falla, no queda nada a
-- medias.
--
-- Suma:
-- - pagos: cada pago de Mercado Pago que avisó el webhook, con su último
--   estado. Es lo que hace idempotente la conciliación;
-- - en pedidos: la preferencia de Checkout Pro, qué pago lo pagó, si hay un
--   pago en curso (entonces no vence) y por qué se canceló;
-- - pedido_revisiones: lo que la tienda tiene que mirar a mano, como un pago
--   aprobado que llega cuando el pedido ya venció;
-- - conciliar_pago y guardar_preferencia, que solo ejecuta service_role (el
--   servidor, con SUPABASE_SECRET_KEY);
-- - liberar_pedidos_vencidos, que ahora no cancela un pedido con un pago en
--   curso.
--
-- Ver docs/API.md: el webhook, el flujo de pago completo y por qué el stock se
-- reserva al crear el pedido y no al pagar.

begin;

-- ---------------------------------------------------------------------------
-- Pagos
-- ---------------------------------------------------------------------------

-- Una fila por pago de Mercado Pago, con lo último que dijo GET /v1/payments.
-- Un pedido puede tener varios: un rechazo y después el aprobado. Los montos
-- son los de Mercado Pago (numeric); los del pedido siguen en enteros.
create table public.pagos (
  id             bigint primary key,      -- el id del pago en Mercado Pago
  pedido_id      uuid not null references public.pedidos on delete cascade,
  estado         text not null,           -- status: approved, pending, in_process, rejected…
  estado_detalle text,                    -- status_detail: accredited, cc_rejected_…
  monto          numeric(12, 2) not null, -- transaction_amount
  moneda         text not null,           -- currency_id
  medio          text,                    -- payment_method_id: visa, master, account_money…
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index on public.pagos (pedido_id);

-- ---------------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------------

-- mp_init_point es el link a Checkout Pro: se reusa mientras el pedido se
-- pueda pagar (la preferencia vence junto con el pedido). pago_en_curso lo
-- mantiene conciliar_pago: true mientras algún pago está pending o in_process.
-- Va en la fila del pedido, y no solo en pagos, para que
-- liberar_pedidos_vencidos lo vuelva a mirar después de esperar el lock.
alter table public.pedidos
  add column mp_preferencia_id text,
  add column mp_init_point     text,
  add column pago_id           bigint references public.pagos,
  add column pagado_en         timestamptz,
  add column pago_en_curso     boolean not null default false,
  add column cancelado_por     text check (cancelado_por in ('vencimiento', 'devolucion')),
  add column cancelado_en      timestamptz;

-- Hasta ahora solo cancelaba liberar_pedidos_vencidos
update public.pedidos set cancelado_por = 'vencimiento' where estado = 'cancelado';

-- ---------------------------------------------------------------------------
-- Revisiones: lo que conciliar_pago no resuelve solo
-- ---------------------------------------------------------------------------

-- Motivos:
-- - pago_en_cancelado: llegó un approved de un pedido ya cancelado (casi
--   siempre, por vencido). El stock ya se devolvió y pudo venderse: el pedido
--   sigue cancelado y la tienda decide si lo reactiva (si hay stock) o
--   devuelve el pago desde Mercado Pago;
-- - pago_duplicado: un segundo approved de un pedido que ya se pagó con otro
--   pago. Hay que devolver uno;
-- - monto_distinto: el approved no es en ARS o no coincide con el total. El
--   pedido sigue pendiente;
-- - devolucion_tras_envio: se devolvió el pago de un pedido ya enviado. El
--   stock no vuelve solo: la mercadería no está en el depósito;
-- - contracargo: el comprador desconoció el pago con la tarjeta.
-- Se resuelve completando resuelta_en (y nota). unique (pago_id, motivo): el
-- mismo aviso dos veces no duplica la revisión.
create table public.pedido_revisiones (
  id          bigint generated always as identity primary key,
  pedido_id   uuid not null references public.pedidos on delete cascade,
  pago_id     bigint not null references public.pagos,
  motivo      text not null check (motivo in (
                'pago_en_cancelado', 'pago_duplicado', 'monto_distinto',
                'devolucion_tras_envio', 'contracargo')),
  creada_en   timestamptz not null default now(),
  resuelta_en timestamptz,
  nota        text,
  unique (pago_id, motivo)
);
create index on public.pedido_revisiones (pedido_id);
create index on public.pedido_revisiones (creada_en) where resuelta_en is null;

-- ---------------------------------------------------------------------------
-- Funciones
-- ---------------------------------------------------------------------------

-- Como en 0001, más dos cosas: no cancela un pedido con un pago en curso
-- (pending o in_process), y anota que lo canceló por vencido. Si
-- conciliar_pago marca el pago en curso mientras esta espera el lock de la
-- fila, al volver a evaluarla ve pago_en_curso y la deja.
create or replace function public.liberar_pedidos_vencidos()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  cancelados integer;
begin
  with vencidos as (
    update public.pedidos
    set estado = 'cancelado', cancelado_por = 'vencimiento', cancelado_en = now()
    where estado = 'pendiente_pago'
      and not pago_en_curso
      and creado_en < now() - interval '30 minutes'
    returning id
  ),
  devueltos as (
    update public.variantes v
    set stock = v.stock + d.cantidad
    from (
      select i.variante_id, sum(i.cantidad) as cantidad
      from public.pedido_items i
      where i.pedido_id in (select id from vencidos)
      group by i.variante_id
    ) d
    where v.id = d.variante_id and v.stock is not null
    returning v.id
  )
  select count(*) into cancelados from vencidos;

  return cancelados;
end;
$$;

-- Guarda la preferencia de Checkout Pro de un pedido pendiente, para reusarla.
-- La llama el servidor después de crearla en Mercado Pago. Devuelve false si
-- el pedido no existe o ya no está pendiente.
create function public.guardar_preferencia(pedido uuid, preferencia text, init_point text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.pedidos p
  set mp_preferencia_id = guardar_preferencia.preferencia,
      mp_init_point = guardar_preferencia.init_point
  where p.id = guardar_preferencia.pedido and p.estado = 'pendiente_pago';
  return found;
end;
$$;

-- Concilia un pago con su pedido. Recibe el pago tal como lo devuelve
-- GET /v1/payments/:id (lo consulta el webhook; nunca el cuerpo del aviso):
--
--   { "id": 123, "status": "approved", "status_detail": "accredited",
--     "external_reference": "<id del pedido>", "transaction_amount": 150000,
--     "currency_id": "ARS", "payment_method_id": "visa" }
--
-- Según el estado del pago:
-- - approved: si el pedido está pendiente y el monto es el total en ARS, pasa
--   a pagado. Aunque hayan pasado los 30 minutos: mientras no se canceló, el
--   stock sigue reservado. Si ya estaba cancelado, pagado con otro pago o el
--   monto no coincide, va a revisión;
-- - pending, in_process (y authorized): el pedido queda pendiente y no vence
--   mientras tanto (pago_en_curso);
-- - rejected (y cancelled): el pedido sigue pendiente para reintentar, hasta
--   que venza;
-- - refunded: si es el pago que pagó el pedido, lo cancela y devuelve el
--   stock; si el pedido ya se envió, va a revisión;
-- - charged_back: revisión. El resto solo se registra.
--
-- Es idempotente: con el pedido bloqueado, si el pago ya está registrado con
-- el mismo estado, no cambia nada. Dos avisos del mismo pago, o un aviso y
-- liberar_pedidos_vencidos, pasan de a uno.
--
-- Devuelve qué hizo: pagado, en_curso, rechazado, cancelado, revision,
-- registrado, sin_cambios o ajeno (el pago no es de un pedido de la tienda).
create function public.conciliar_pago(pago jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id        bigint;
  v_estado    text;
  v_detalle   text;
  v_monto     numeric;
  v_moneda    text;
  v_pedido    public.pedidos%rowtype;
  v_previo    public.pagos%rowtype;
  v_resultado text;
  v_motivo    text;
begin
  if jsonb_typeof(conciliar_pago.pago) is distinct from 'object' then
    raise exception 'El pago no tiene el formato esperado';
  end if;

  v_id      := (conciliar_pago.pago ->> 'id')::bigint;
  v_estado  := conciliar_pago.pago ->> 'status';
  v_detalle := conciliar_pago.pago ->> 'status_detail';
  v_monto   := (conciliar_pago.pago ->> 'transaction_amount')::numeric;
  v_moneda  := conciliar_pago.pago ->> 'currency_id';
  if v_id is null or v_estado is null or v_monto is null or v_moneda is null then
    raise exception 'Al pago le falta el id, el estado, el monto o la moneda';
  end if;

  -- external_reference es el id del pedido. Si no es un uuid, el pago no salió
  -- de la tienda online (un cobro con QR, un link de pago…)
  if coalesce(conciliar_pago.pago ->> 'external_reference', '')
     !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return 'ajeno';
  end if;

  select * into v_pedido
  from public.pedidos p
  where p.id = (conciliar_pago.pago ->> 'external_reference')::uuid
  for update;
  if not found then
    return 'ajeno';
  end if;

  -- El mismo aviso otra vez (o uno viejo, que ya se consultó con el estado de
  -- hoy): nada que hacer
  select * into v_previo from public.pagos g where g.id = v_id;
  if found and v_previo.estado = v_estado
     and v_previo.estado_detalle is not distinct from v_detalle then
    return 'sin_cambios';
  end if;

  insert into public.pagos (id, pedido_id, estado, estado_detalle, monto, moneda, medio)
  values (v_id, v_pedido.id, v_estado, v_detalle, v_monto, v_moneda,
          conciliar_pago.pago ->> 'payment_method_id')
  on conflict (id) do update
    set estado         = excluded.estado,
        estado_detalle = excluded.estado_detalle,
        monto          = excluded.monto,
        moneda         = excluded.moneda,
        medio          = excluded.medio,
        actualizado_en = now();

  update public.pedidos p
  set pago_en_curso = exists (
    select 1 from public.pagos g
    where g.pedido_id = p.id and g.estado in ('pending', 'in_process', 'authorized')
  )
  where p.id = v_pedido.id;

  -- Mismo estado con otro detalle (approved que pasa a partially_refunded):
  -- queda registrado y nada más
  if v_previo.id is not null and v_previo.estado = v_estado then
    return 'sin_cambios';
  end if;

  case
    when v_estado = 'approved' then
      if v_pedido.estado = 'pendiente_pago' then
        if v_moneda <> 'ARS' or v_monto <> v_pedido.total then
          v_motivo := 'monto_distinto';
        else
          update public.pedidos p
          set estado = 'pagado', pago_id = v_id, pagado_en = now()
          where p.id = v_pedido.id;
          v_resultado := 'pagado';
        end if;
      elsif v_pedido.estado = 'cancelado' then
        v_motivo := 'pago_en_cancelado';
      elsif v_pedido.pago_id is distinct from v_id then
        v_motivo := 'pago_duplicado';
      else
        v_resultado := 'sin_cambios';
      end if;

    when v_estado in ('pending', 'in_process', 'authorized') then
      v_resultado := 'en_curso';

    when v_estado in ('rejected', 'cancelled') then
      v_resultado := 'rechazado';

    when v_estado = 'refunded' and v_pedido.pago_id = v_id then
      if v_pedido.estado in ('pagado', 'preparando') then
        update public.pedidos p
        set estado = 'cancelado', cancelado_por = 'devolucion', cancelado_en = now()
        where p.id = v_pedido.id;

        -- Bloquea las variantes en el mismo orden que crear_pedido
        perform 1
        from public.variantes v
        where v.id in (select i.variante_id from public.pedido_items i where i.pedido_id = v_pedido.id)
        order by v.id
        for update;

        update public.variantes v
        set stock = v.stock + d.cantidad
        from (
          select i.variante_id, sum(i.cantidad) as cantidad
          from public.pedido_items i
          where i.pedido_id = v_pedido.id
          group by i.variante_id
        ) d
        where v.id = d.variante_id and v.stock is not null;

        v_resultado := 'cancelado';
      elsif v_pedido.estado in ('enviado', 'entregado') then
        v_motivo := 'devolucion_tras_envio';
      else
        v_resultado := 'registrado';
      end if;

    when v_estado = 'charged_back' and v_pedido.pago_id = v_id then
      v_motivo := 'contracargo';

    else
      -- Un refunded o charged_back de un pago que no pagó el pedido (el
      -- duplicado, el que llegó tarde), in_mediation, etc.
      v_resultado := 'registrado';
  end case;

  if v_motivo is not null then
    insert into public.pedido_revisiones (pedido_id, pago_id, motivo)
    values (v_pedido.id, v_id, v_motivo)
    on conflict (pago_id, motivo) do nothing;
    v_resultado := 'revision';
  end if;

  -- De paso, devuelve el stock de los pedidos vencidos (también este, si el
  -- pago se rechazó después de los 30 minutos)
  perform public.liberar_pedidos_vencidos();

  return v_resultado;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security y permisos
-- ---------------------------------------------------------------------------

alter table public.pagos             enable row level security;
alter table public.pedido_revisiones enable row level security;

-- Cada uno ve los pagos de sus pedidos (la política de pedidos ya filtra) y el
-- admin, todos. Nadie escribe directo: solo conciliar_pago.
create policy "dueño o admin" on public.pagos
  for select to authenticated
  using (exists (select 1 from public.pedidos p where p.id = pedido_id));

-- Las revisiones son de la tienda
create policy "admin lee" on public.pedido_revisiones
  for select to authenticated
  using ((select public.es_admin()));

grant select on public.pagos, public.pedido_revisiones to authenticated;

revoke all on function public.guardar_preferencia(uuid, text, text) from public, anon, authenticated;
grant execute on function public.guardar_preferencia(uuid, text, text) to service_role;

revoke all on function public.conciliar_pago(jsonb) from public, anon, authenticated;
grant execute on function public.conciliar_pago(jsonb) to service_role;

commit;
