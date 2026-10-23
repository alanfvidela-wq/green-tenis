-- green.: un pago aprobado a tiempo reactiva el pedido vencido.
--
-- Se corre una sola vez, entera, en el SQL Editor de Supabase, después de
-- 0002_pagos.sql. Va en una transacción: si algo falla, no queda nada a
-- medias.
--
-- Hasta ahora, un approved de un pedido ya cancelado iba siempre a revisión
-- (pasó con el pedido #5: Mercado Pago aprobó el pago, pero el aviso se
-- concilió cuando el pedido ya había vencido). Ahora conciliar_pago lo
-- reactiva si:
-- - el pedido se canceló por vencido (no por una devolución);
-- - el pago es por el total del pedido, en ARS;
-- - Mercado Pago lo aprobó (date_approved) antes del vencimiento: creado_en
--   más 30 minutos, el mismo plazo que usa liberar_pedidos_vencidos;
-- - hay stock para todas sus líneas.
-- Entonces el pedido vuelve a pagado y el stock se descuenta otra vez, todo en
-- la transacción de conciliar_pago. Si no, va a revisión como antes, y la
-- revisión dice por qué no se reactivó.
--
-- La regla se evalúa cuando el pago pasa a approved, una sola vez, como el
-- resto de la conciliación: un pago que ya quedó en revisión no se reactiva
-- solo después (por ejemplo, si vuelve el stock). Eso lo decide la tienda.

begin;

-- date_approved de Mercado Pago
alter table public.pagos add column aprobado_en timestamptz;

-- Por qué no se resolvió solo: «Aprobado el 22/10 20:51, después del
-- vencimiento (22/10 20:44)», «Sin stock de Babolat Pure Drive (Grip 2)»…
alter table public.pedido_revisiones add column detalle text;

-- Como en 0002, con estos cambios:
-- - guarda date_approved en pagos.aprobado_en;
-- - un approved de un pedido cancelado por vencido se reactiva con la regla de
--   arriba (resultado: reactivado), y si no, va a revisión con detalle;
-- - un approved de un pedido cancelado que no es por el total en ARS va a
--   revisión como monto_distinto (antes, pago_en_cancelado).
--
-- Devuelve qué hizo: pagado, reactivado, en_curso, rechazado, cancelado,
-- revision, registrado, sin_cambios o ajeno (el pago no es de un pedido de la
-- tienda).
create or replace function public.conciliar_pago(pago jsonb)
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
  v_aprobado  timestamptz;
  v_vence     timestamptz;
  v_falta     text;
  v_pedido    public.pedidos%rowtype;
  v_previo    public.pagos%rowtype;
  v_resultado text;
  v_motivo    text;
  v_por_que   text;
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

  -- Una fecha que no se entiende cuenta como desconocida: si hace falta para
  -- reactivar, el pago va a revisión
  begin
    v_aprobado := (conciliar_pago.pago ->> 'date_approved')::timestamptz;
  exception when invalid_datetime_format or datetime_field_overflow then
    v_aprobado := null;
  end;

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

  insert into public.pagos (id, pedido_id, estado, estado_detalle, monto, moneda, medio, aprobado_en)
  values (v_id, v_pedido.id, v_estado, v_detalle, v_monto, v_moneda,
          conciliar_pago.pago ->> 'payment_method_id', v_aprobado)
  on conflict (id) do update
    set estado         = excluded.estado,
        estado_detalle = excluded.estado_detalle,
        monto          = excluded.monto,
        moneda         = excluded.moneda,
        medio          = excluded.medio,
        aprobado_en    = excluded.aprobado_en,
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
        -- El mismo plazo que liberar_pedidos_vencidos
        v_vence := v_pedido.creado_en + interval '30 minutes';

        if v_moneda <> 'ARS' or v_monto <> v_pedido.total then
          v_motivo := 'monto_distinto';
        elsif v_pedido.cancelado_por is distinct from 'vencimiento' then
          v_motivo := 'pago_en_cancelado';
          v_por_que := 'El pedido no se canceló por vencido';
        elsif v_aprobado is null then
          v_motivo := 'pago_en_cancelado';
          v_por_que := 'Mercado Pago no informó cuándo se aprobó el pago';
        elsif v_aprobado >= v_vence then
          v_motivo := 'pago_en_cancelado';
          v_por_que := format(
            'Aprobado el %s, después del vencimiento (%s)',
            to_char(v_aprobado at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI:SS'),
            to_char(v_vence at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI:SS')
          );
        else
          -- Aprobado a tiempo: se reactiva si hay stock para todo. Bloquea las
          -- variantes en el mismo orden que crear_pedido.
          perform 1
          from public.variantes v
          where v.id in (select i.variante_id from public.pedido_items i where i.pedido_id = v_pedido.id)
          order by v.id
          for update;

          select string_agg(p.marca || ' ' || p.nombre || ' (' || v.nombre || ')', ', ' order by v.id)
          into v_falta
          from (
            select i.variante_id, sum(i.cantidad) as cantidad
            from public.pedido_items i
            where i.pedido_id = v_pedido.id
            group by i.variante_id
          ) l
          join public.variantes v on v.id = l.variante_id
          join public.productos p on p.id = v.producto_id
          where v.stock is not null and v.stock < l.cantidad;

          if v_falta is not null then
            v_motivo := 'pago_en_cancelado';
            v_por_que := 'Aprobado a tiempo, pero sin stock de ' || v_falta;
          else
            update public.pedidos p
            set estado = 'pagado', pago_id = v_id, pagado_en = now(),
                cancelado_por = null, cancelado_en = null
            where p.id = v_pedido.id;

            update public.variantes v
            set stock = v.stock - d.cantidad
            from (
              select i.variante_id, sum(i.cantidad) as cantidad
              from public.pedido_items i
              where i.pedido_id = v_pedido.id
              group by i.variante_id
            ) d
            where v.id = d.variante_id and v.stock is not null;

            v_resultado := 'reactivado';
          end if;
        end if;

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
    insert into public.pedido_revisiones (pedido_id, pago_id, motivo, detalle)
    values (v_pedido.id, v_id, v_motivo, v_por_que)
    on conflict (pago_id, motivo) do nothing;
    v_resultado := 'revision';
  end if;

  -- De paso, devuelve el stock de los pedidos vencidos (también este, si el
  -- pago se rechazó después de los 30 minutos)
  perform public.liberar_pedidos_vencidos();

  return v_resultado;
end;
$$;

commit;
