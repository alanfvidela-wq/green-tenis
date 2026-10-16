-- green.: catálogo, combos y pedidos.
--
-- Se corre una sola vez, entera, en el SQL Editor de Supabase y antes de
-- seed.sql. Va en una transacción: si algo falla, no queda nada a medias.
--
-- El proyecto no expone tablas nuevas solo, así que los permisos de cada rol
-- van explícitos al final, además de las políticas de RLS.

begin;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

create type public.producto_tipo as enum
  ('raqueta', 'pelota', 'cuerda', 'grip', 'bolso', 'servicio');

create type public.pedido_estado as enum
  ('pendiente_pago', 'pagado', 'preparando', 'enviado', 'entregado', 'cancelado');

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------

-- La navegación. 'servicios' (el encordado) existe pero no se navega.
create table public.categorias (
  slug        text primary key,
  nombre      text not null,
  descripcion text not null,
  orden       smallint not null,
  visible     boolean not null default true
);

-- `categoria` es dónde se navega; `tipo`, qué ficha lleva y qué lógica se le
-- aplica (cuerdas-y-grips agrupa dos tipos). Pelota, grip y bolso guardan su
-- ficha en `ficha`, solo para mostrar: [["Rótulo", "Valor"], …]. Raqueta y
-- cuerda la tienen en tablas tipadas, porque el quiz y el armador filtran por
-- esos números.
create table public.productos (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  categoria   text not null references public.categorias,
  tipo        public.producto_tipo not null,
  marca       text not null,
  nombre      text not null,
  descripcion text not null,
  ficha       jsonb,
  destacado   boolean not null default false,
  activo      boolean not null default true,
  orden       smallint not null default 0,
  creado_en   timestamptz not null default now(),
  -- Para atar cada ficha tipada a su tipo con una FK compuesta
  unique (id, tipo),
  check (ficha is null or (tipo in ('pelota', 'grip', 'bolso') and jsonb_typeof(ficha) = 'array'))
);

-- Precio en ARS, entero. stock null: no se controla (servicios). Lo que ya se
-- vendió no se borra: se pasa a activa = false.
create table public.variantes (
  id          bigint generated always as identity primary key,
  producto_id bigint not null references public.productos on delete cascade,
  sku         text not null unique,
  nombre      text not null,
  precio      integer not null check (precio > 0),
  stock       integer check (stock >= 0),
  orden       smallint not null default 0,
  activa      boolean not null default true,
  unique (producto_id, nombre),
  -- Para que combo_items no fije una variante de otro producto
  unique (id, producto_id)
);

create table public.combos (
  id            bigint generated always as identity primary key,
  slug          text not null unique,
  nombre        text not null,
  descripcion   text not null,
  descuento_pct smallint not null check (descuento_pct between 1 and 50),
  destacado     boolean not null default false,
  activo        boolean not null default true,
  orden         smallint not null default 0
);

-- `ruta` es la ruta dentro del bucket 'productos' de Storage, no la URL.
create table public.fotos (
  id          bigint generated always as identity primary key,
  producto_id bigint references public.productos on delete cascade,
  combo_id    bigint references public.combos on delete cascade,
  ruta        text not null,
  orden       smallint not null,
  check (num_nonnulls(producto_id, combo_id) = 1)
);
create index on public.fotos (producto_id);
create index on public.fotos (combo_id);

-- ---------------------------------------------------------------------------
-- Fichas tipadas: raqueta y cuerda
-- ---------------------------------------------------------------------------

create table public.fichas_raqueta (
  producto_id        bigint primary key,
  tipo               public.producto_tipo not null default 'raqueta' check (tipo = 'raqueta'),
  cabeza_pulg2       smallint not null check (cabeza_pulg2 between 85 and 135),
  largo_mm           smallint not null default 685 check (largo_mm between 660 and 740),
  balance_mm         smallint not null check (balance_mm between 290 and 360), -- sin encordar
  patron_principales smallint not null check (patron_principales between 14 and 20),
  patron_cruzadas    smallint not null check (patron_cruzadas between 15 and 22),
  rigidez_ra         smallint check (rigidez_ra between 45 and 80),
  tension_min_kg     numeric(3,1) not null check (tension_min_kg between 15 and 35),
  tension_max_kg     numeric(3,1) not null check (tension_max_kg between 15 and 35),
  check (tension_min_kg < tension_max_kg),
  foreign key (producto_id, tipo) references public.productos (id, tipo) on delete cascade
);

-- El peso va en la variante porque cambia con ella (300 g o 285 g)
create table public.variantes_raqueta (
  variante_id bigint primary key references public.variantes on delete cascade,
  grip        smallint not null check (grip between 0 and 5),
  peso_g      smallint not null check (peso_g between 220 and 360)          -- sin encordar
);

create table public.fichas_cuerda (
  producto_id bigint primary key,
  tipo        public.producto_tipo not null default 'cuerda' check (tipo = 'cuerda'),
  material    text not null
              check (material in ('copoliester', 'multifilamento', 'nylon', 'tripa', 'hibrida')),
  calibre_mm  numeric(3,2) not null check (calibre_mm between 1.05 and 1.45),
  perfil      text not null check (perfil in ('redondo', 'octogonal', 'cuadrado', 'pentagonal')),
  foreign key (producto_id, tipo) references public.productos (id, tipo) on delete cascade
);

-- 12 = set (lo que usa un encordado), 200 = rollo
create table public.variantes_cuerda (
  variante_id bigint primary key references public.variantes on delete cascade,
  largo_m     smallint not null check (largo_m > 0)
);

-- ---------------------------------------------------------------------------
-- Para «Armá tu raqueta»: qué cuerdas y grips ofrece y recomienda la tienda
-- para cada raqueta
-- ---------------------------------------------------------------------------

create table public.compatibilidades (
  raqueta_id     bigint not null,
  raqueta_tipo   public.producto_tipo not null default 'raqueta' check (raqueta_tipo = 'raqueta'),
  accesorio_id   bigint not null,
  accesorio_tipo public.producto_tipo not null check (accesorio_tipo in ('cuerda', 'grip')),
  recomendado    boolean not null default false,
  primary key (raqueta_id, accesorio_id),
  foreign key (raqueta_id, raqueta_tipo)
    references public.productos (id, tipo) on delete cascade,
  foreign key (accesorio_id, accesorio_tipo)
    references public.productos (id, tipo) on delete cascade
);
create index on public.compatibilidades (accesorio_id);

-- ---------------------------------------------------------------------------
-- Combos: el precio y el stock se calculan en el servidor a partir de los
-- ítems; no se guardan.
-- ---------------------------------------------------------------------------

-- variante_id null: el cliente elige la variante al comprar
create table public.combo_items (
  id          bigint generated always as identity primary key,
  combo_id    bigint not null references public.combos on delete cascade,
  producto_id bigint not null references public.productos,
  variante_id bigint,
  cantidad    smallint not null default 1 check (cantidad > 0),
  orden       smallint not null default 0,
  unique (combo_id, producto_id),
  foreign key (variante_id, producto_id) references public.variantes (id, producto_id)
);
create index on public.combo_items (producto_id);

-- ---------------------------------------------------------------------------
-- Pedidos: todo lo que muestran queda copiado al comprar
-- ---------------------------------------------------------------------------

-- usuario_id siempre se carga; queda null solo si se borra la cuenta, para no
-- perder el historial.
create table public.pedidos (
  id          uuid primary key default gen_random_uuid(),
  numero      bigint generated always as identity unique,
  usuario_id  uuid references auth.users on delete set null,
  email       text not null,
  estado      public.pedido_estado not null default 'pendiente_pago',
  subtotal    integer not null check (subtotal >= 0),  -- Σ ítems a precio de lista
  descuento   integer not null default 0 check (descuento >= 0),
  envio       integer not null default 0 check (envio >= 0),
  total       integer not null,
  envio_datos jsonb not null,                           -- copia, no se filtra por esto
  creado_en   timestamptz not null default now(),
  check (total = subtotal - descuento + envio)
);
create index on public.pedidos (usuario_id, creado_en desc);
create index on public.pedidos (estado, creado_en);  -- para encontrar los vencidos

create table public.pedido_combos (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null references public.pedidos on delete cascade,
  combo_id      bigint not null references public.combos,
  nombre        text not null,
  descuento_pct smallint not null,
  precio_lista  integer not null,
  descuento     integer not null
);
create index on public.pedido_combos (pedido_id);

create table public.pedido_items (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references public.pedidos on delete cascade,
  pedido_combo_id uuid references public.pedido_combos on delete cascade, -- null: suelto
  variante_id     bigint not null references public.variantes,
  producto_slug   text not null,
  marca           text not null,
  producto_nombre text not null,
  variante_nombre text not null,
  precio_unitario integer not null check (precio_unitario >= 0),
  cantidad        smallint not null check (cantidad > 0),
  subtotal        integer generated always as (precio_unitario * cantidad) stored
);
create index on public.pedido_items (pedido_id);
create index on public.pedido_items (pedido_combo_id);
create index on public.pedido_items (variante_id);

-- Extiende la línea del servicio de encordado: qué raqueta y qué cuerda del
-- mismo pedido, y a qué tensión
create table public.pedido_encordados (
  servicio_item_id uuid primary key references public.pedido_items on delete cascade,
  raqueta_item_id  uuid not null references public.pedido_items,
  cuerda_item_id   uuid not null references public.pedido_items,
  tension_kg       numeric(3,1) not null
);

-- ---------------------------------------------------------------------------
-- Funciones
-- ---------------------------------------------------------------------------

-- El admin lleva {"rol": "admin"} en app_metadata, que solo se escribe con la
-- service role (el usuario no se lo puede poner solo).
create function public.es_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin', false)
$$;

-- Cancela los pedidos en pendiente_pago con más de 30 minutos y les devuelve
-- el stock. Si dos llamadas se cruzan, la segunda espera el lock de cada fila
-- y, al volver a evaluarla, ya la ve cancelada: el stock no se devuelve dos
-- veces. La llaman crear_pedido y, después, el webhook de Mercado Pago (con la
-- service role). Devuelve cuántos pedidos canceló.
create function public.liberar_pedidos_vencidos()
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
    set estado = 'cancelado'
    where estado = 'pendiente_pago'
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

-- Crea un pedido del usuario que llama. Nunca recibe precios: los toma de
-- `variantes` y calcula los descuentos de los combos.
--
--   items:      [{ "variante_id": 12, "cantidad": 1, "ref": "cuerda" }]
--   combos:     [{ "combo_id": 1, "elecciones": [
--                  { "combo_item_id": 3, "variante_id": 15, "ref": "raqueta" } ] }]
--               Cada elemento es un combo. `elecciones` trae la variante de
--               los ítems a elegir; un `ref` sirve para nombrar una línea.
--   encordados: [{ "raqueta": "raqueta", "cuerda": "cuerda", "tension_kg": 24 }]
--               Cada uno suma una línea del servicio de encordado.
--   envio_datos: { "nombre": …, "direccion": …, … }
--
-- Todo pasa en una transacción, con las variantes bloqueadas: no se vende
-- más de lo que hay.
create function public.crear_pedido(
  items       jsonb default '[]',
  combos      jsonb default '[]',
  encordados  jsonb default '[]',
  envio_datos jsonb default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario   uuid := auth.uid();
  v_email     text;
  v_pedido    uuid := gen_random_uuid();
  v_encordado bigint;
  v_subtotal  integer;
  v_descuento integer;
  v_envio     integer := 0;  -- el costo de envío llega en otro paso
  v_falta     text;
begin
  -- Antes de bloquear nada, devuelve el stock de los pedidos vencidos
  perform public.liberar_pedidos_vencidos();

  if v_usuario is null then
    raise exception 'Para comprar hay que iniciar sesión' using errcode = '42501';
  end if;
  select u.email into v_email from auth.users u where u.id = v_usuario;
  if v_email is null then
    raise exception 'La cuenta no tiene email';
  end if;

  if jsonb_typeof(crear_pedido.items) is distinct from 'array'
     or jsonb_typeof(crear_pedido.combos) is distinct from 'array'
     or jsonb_typeof(crear_pedido.encordados) is distinct from 'array'
     or jsonb_typeof(crear_pedido.envio_datos) is distinct from 'object' then
    raise exception 'El pedido no tiene el formato esperado';
  end if;

  -- Tablas de trabajo, solo para esta transacción
  create temp table if not exists _combos (
    n             bigint primary key,
    id            uuid not null default gen_random_uuid(),
    combo_id      bigint,
    nombre        text,
    descuento_pct smallint,
    lista         integer,
    descuento     integer
  ) on commit drop;
  create temp table if not exists _lineas (
    n             integer generated always as identity,
    id            uuid not null default gen_random_uuid(),
    ref           text,
    variante_id   bigint,
    cantidad      integer,
    combo_n       bigint,
    combo_item_id bigint,
    encordado_n   bigint,
    producto_id   bigint,
    tipo          public.producto_tipo,
    precio        integer
  ) on commit drop;
  create temp table if not exists _encordados (
    n          bigint primary key,
    raqueta    text,
    cuerda     text,
    tension_kg numeric
  ) on commit drop;
  truncate pg_temp._combos, pg_temp._lineas, pg_temp._encordados;

  -- Los combos pedidos, solo si existen y están activos
  insert into pg_temp._combos (n, combo_id, nombre, descuento_pct)
  select c.n, k.id, k.nombre, k.descuento_pct
  from jsonb_array_elements(crear_pedido.combos) with ordinality as c(dato, n)
  left join public.combos k
    on k.id = (c.dato ->> 'combo_id')::bigint and k.activo;
  if exists (select 1 from pg_temp._combos where combo_id is null) then
    raise exception 'Un combo no existe o ya no está disponible';
  end if;

  -- Las líneas sueltas
  insert into pg_temp._lineas (ref, variante_id, cantidad)
  select x.dato ->> 'ref', (x.dato ->> 'variante_id')::bigint, (x.dato ->> 'cantidad')::integer
  from jsonb_array_elements(crear_pedido.items) as x(dato);

  -- Las líneas de cada combo: la variante fija o la que eligió el cliente
  insert into pg_temp._lineas (ref, variante_id, cantidad, combo_n, combo_item_id)
  select e.dato ->> 'ref',
         coalesce(ci.variante_id, (e.dato ->> 'variante_id')::bigint),
         ci.cantidad, c.n, ci.id
  from pg_temp._combos c
  join public.combo_items ci on ci.combo_id = c.combo_id
  left join lateral (
    select x.dato
    from jsonb_array_elements(
      coalesce(crear_pedido.combos -> (c.n::integer - 1) -> 'elecciones', '[]'::jsonb)
    ) as x(dato)
    where (x.dato ->> 'combo_item_id')::bigint = ci.id
    limit 1
  ) e on true
  order by c.n, ci.orden, ci.id;

  if exists (
    select 1
    from pg_temp._lineas l
    join public.combo_items ci on ci.id = l.combo_item_id
    where not exists (
      select 1 from public.variantes v
      where v.id = l.variante_id and v.producto_id = ci.producto_id
    )
  ) then
    raise exception 'Falta elegir una opción de un combo, o la opción no corresponde';
  end if;

  -- Una línea del servicio por cada encordado
  insert into pg_temp._encordados (n, raqueta, cuerda, tension_kg)
  select e.n, e.dato ->> 'raqueta', e.dato ->> 'cuerda', (e.dato ->> 'tension_kg')::numeric
  from jsonb_array_elements(crear_pedido.encordados) with ordinality as e(dato, n);

  if exists (select 1 from pg_temp._encordados) then
    select v.id into v_encordado
    from public.variantes v
    join public.productos p on p.id = v.producto_id
    where p.slug = 'encordado' and p.tipo = 'servicio' and p.activo and v.activa
    order by v.orden, v.id
    limit 1;
    if v_encordado is null then
      raise exception 'El encordado no está disponible';
    end if;

    insert into pg_temp._lineas (variante_id, cantidad, encordado_n)
    select v_encordado, 1, e.n from pg_temp._encordados e order by e.n;
  end if;

  -- Lo básico de cada línea
  if not exists (select 1 from pg_temp._lineas) then
    raise exception 'El pedido está vacío';
  end if;
  if exists (
    select 1 from pg_temp._lineas
    where variante_id is null or cantidad is null or cantidad not between 1 and 99
  ) then
    raise exception 'Hay una línea sin producto o con una cantidad inválida';
  end if;
  if exists (
    select 1 from pg_temp._lineas where ref is not null group by ref having count(*) > 1
  ) then
    raise exception 'Hay dos líneas con la misma referencia';
  end if;

  -- Bloquea las variantes, siempre en el mismo orden
  perform 1
  from public.variantes v
  where v.id in (select l.variante_id from pg_temp._lineas l)
  order by v.id
  for update;

  if exists (
    select 1
    from (select distinct variante_id from pg_temp._lineas) l
    left join public.variantes v on v.id = l.variante_id and v.activa
    left join public.productos p on p.id = v.producto_id and p.activo
    where p.id is null
  ) then
    raise exception 'Algún producto del pedido ya no está disponible';
  end if;

  select string_agg(p.marca || ' ' || p.nombre || ' (' || v.nombre || ')', ', ')
  into v_falta
  from (
    select variante_id, sum(cantidad) as cantidad
    from pg_temp._lineas
    group by variante_id
  ) l
  join public.variantes v on v.id = l.variante_id
  join public.productos p on p.id = v.producto_id
  where v.stock is not null and v.stock < l.cantidad;
  if v_falta is not null then
    raise exception 'No hay stock suficiente de %', v_falta;
  end if;

  -- Precios de hoy
  update pg_temp._lineas l
  set precio = v.precio, producto_id = p.id, tipo = p.tipo
  from public.variantes v
  join public.productos p on p.id = v.producto_id
  where v.id = l.variante_id;

  -- Cada combo: la suma de sus ítems, menos el descuento redondeado para abajo
  update pg_temp._combos c
  set lista = s.lista,
      descuento = (s.lista::bigint * c.descuento_pct / 100)::integer
  from (
    select combo_n, sum(precio * cantidad)::integer as lista
    from pg_temp._lineas
    where combo_n is not null
    group by combo_n
  ) s
  where s.combo_n = c.n;
  if exists (select 1 from pg_temp._combos where lista is null) then
    raise exception 'Un combo no tiene productos';
  end if;

  -- Cada encordado: una raqueta y un set de cuerda del pedido, con la tensión
  -- dentro del rango de la raqueta
  if exists (
    select 1
    from pg_temp._encordados e
    left join pg_temp._lineas r on r.ref = e.raqueta and r.tipo = 'raqueta'
    left join public.fichas_raqueta f on f.producto_id = r.producto_id
    left join pg_temp._lineas c on c.ref = e.cuerda and c.tipo = 'cuerda'
    left join public.variantes_cuerda vc on vc.variante_id = c.variante_id and vc.largo_m = 12
    where f.producto_id is null
       or vc.variante_id is null
       or e.tension_kg is null
       or e.tension_kg not between f.tension_min_kg and f.tension_max_kg
  ) then
    raise exception 'Revisá el encordado: hace falta una raqueta, un set de cuerda de 12 m y una tensión dentro del rango de la raqueta';
  end if;
  if exists (
    select 1
    from (select raqueta as ref, count(*) as veces from pg_temp._encordados group by raqueta
          union all
          select cuerda, count(*) from pg_temp._encordados group by cuerda) x
    join pg_temp._lineas l on l.ref = x.ref
    where x.veces > l.cantidad
  ) then
    raise exception 'Hay más encordados que raquetas o sets de cuerda';
  end if;

  -- Totales
  select sum(precio * cantidad)::integer into v_subtotal from pg_temp._lineas;
  select coalesce(sum(descuento), 0)::integer into v_descuento from pg_temp._combos;

  -- El pedido, con todo copiado
  insert into public.pedidos (id, usuario_id, email, subtotal, descuento, envio, total, envio_datos)
  values (v_pedido, v_usuario, v_email, v_subtotal, v_descuento, v_envio,
          v_subtotal - v_descuento + v_envio, crear_pedido.envio_datos);

  insert into public.pedido_combos (id, pedido_id, combo_id, nombre, descuento_pct, precio_lista, descuento)
  select c.id, v_pedido, c.combo_id, c.nombre, c.descuento_pct, c.lista, c.descuento
  from pg_temp._combos c
  order by c.n;

  insert into public.pedido_items
    (id, pedido_id, pedido_combo_id, variante_id, producto_slug, marca,
     producto_nombre, variante_nombre, precio_unitario, cantidad)
  select l.id, v_pedido, c.id, l.variante_id, p.slug, p.marca,
         p.nombre, v.nombre, l.precio, l.cantidad
  from pg_temp._lineas l
  join public.variantes v on v.id = l.variante_id
  join public.productos p on p.id = v.producto_id
  left join pg_temp._combos c on c.n = l.combo_n
  order by l.n;

  insert into public.pedido_encordados (servicio_item_id, raqueta_item_id, cuerda_item_id, tension_kg)
  select s.id, r.id, c.id, e.tension_kg
  from pg_temp._encordados e
  join pg_temp._lineas s on s.encordado_n = e.n
  join pg_temp._lineas r on r.ref = e.raqueta
  join pg_temp._lineas c on c.ref = e.cuerda;

  -- Reserva el stock hasta que se pague (o venza a los 30 minutos)
  update public.variantes v
  set stock = v.stock - l.cantidad
  from (
    select variante_id, sum(cantidad) as cantidad
    from pg_temp._lineas
    group by variante_id
  ) l
  where v.id = l.variante_id and v.stock is not null;

  return v_pedido;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.categorias        enable row level security;
alter table public.productos         enable row level security;
alter table public.variantes         enable row level security;
alter table public.combos            enable row level security;
alter table public.fotos             enable row level security;
alter table public.fichas_raqueta    enable row level security;
alter table public.variantes_raqueta enable row level security;
alter table public.fichas_cuerda     enable row level security;
alter table public.variantes_cuerda  enable row level security;
alter table public.compatibilidades  enable row level security;
alter table public.combo_items       enable row level security;
alter table public.pedidos           enable row level security;
alter table public.pedido_combos     enable row level security;
alter table public.pedido_items      enable row level security;
alter table public.pedido_encordados enable row level security;

-- Catálogo: cualquiera lee lo activo. Las tablas hijas preguntan por su padre,
-- que ya filtra por su propia política.
create policy "lectura pública" on public.categorias
  for select to anon, authenticated using (true);

create policy "lectura pública" on public.productos
  for select to anon, authenticated using (activo);

create policy "lectura pública" on public.variantes
  for select to anon, authenticated
  using (activa and exists (select 1 from public.productos p where p.id = producto_id));

create policy "lectura pública" on public.combos
  for select to anon, authenticated using (activo);

create policy "lectura pública" on public.fotos
  for select to anon, authenticated
  using (exists (select 1 from public.productos p where p.id = producto_id)
      or exists (select 1 from public.combos k where k.id = combo_id));

create policy "lectura pública" on public.fichas_raqueta
  for select to anon, authenticated
  using (exists (select 1 from public.productos p where p.id = producto_id));

create policy "lectura pública" on public.fichas_cuerda
  for select to anon, authenticated
  using (exists (select 1 from public.productos p where p.id = producto_id));

create policy "lectura pública" on public.variantes_raqueta
  for select to anon, authenticated
  using (exists (select 1 from public.variantes v where v.id = variante_id));

create policy "lectura pública" on public.variantes_cuerda
  for select to anon, authenticated
  using (exists (select 1 from public.variantes v where v.id = variante_id));

create policy "lectura pública" on public.compatibilidades
  for select to anon, authenticated
  using (exists (select 1 from public.productos p where p.id = raqueta_id)
     and exists (select 1 from public.productos p where p.id = accesorio_id));

create policy "lectura pública" on public.combo_items
  for select to anon, authenticated
  using (exists (select 1 from public.combos k where k.id = combo_id));

-- El admin puede todo en el catálogo. Hoy authenticated solo tiene SELECT (ver
-- los GRANT de abajo): cuando haya panel de admin, se le suma insert, update y
-- delete, y estas políticas siguen limitando la escritura al admin.
create policy "admin: todo" on public.categorias
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.productos
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.variantes
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.combos
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.fotos
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.fichas_raqueta
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.fichas_cuerda
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.variantes_raqueta
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.variantes_cuerda
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.compatibilidades
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
create policy "admin: todo" on public.combo_items
  for all to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));

-- Pedidos: cada uno ve los suyos y el admin, todos. Nadie los crea ni toca el
-- stock directo: solo crear_pedido y liberar_pedidos_vencidos.
create policy "dueño o admin" on public.pedidos
  for select to authenticated
  using (usuario_id = (select auth.uid()) or (select public.es_admin()));

-- Para cambiar el estado desde el panel de admin (necesita GRANT UPDATE)
create policy "admin actualiza" on public.pedidos
  for update to authenticated
  using ((select public.es_admin())) with check ((select public.es_admin()));

create policy "dueño o admin" on public.pedido_combos
  for select to authenticated
  using (exists (select 1 from public.pedidos p where p.id = pedido_id));

create policy "dueño o admin" on public.pedido_items
  for select to authenticated
  using (exists (select 1 from public.pedidos p where p.id = pedido_id));

create policy "dueño o admin" on public.pedido_encordados
  for select to authenticated
  using (exists (select 1 from public.pedido_items i where i.id = servicio_item_id));

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;

grant select on
  public.categorias, public.productos, public.variantes, public.combos, public.fotos,
  public.fichas_raqueta, public.variantes_raqueta, public.fichas_cuerda,
  public.variantes_cuerda, public.compatibilidades, public.combo_items
to anon, authenticated;

grant select on
  public.pedidos, public.pedido_combos, public.pedido_items, public.pedido_encordados
to authenticated;

-- Las funciones se pueden ejecutar por defecto desde public: se cierra y se
-- abre solo a quien corresponde.
revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to anon, authenticated, service_role;

revoke all on function public.crear_pedido(jsonb, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.crear_pedido(jsonb, jsonb, jsonb, jsonb) to authenticated;

revoke all on function public.liberar_pedidos_vencidos() from public, anon, authenticated;
grant execute on function public.liberar_pedidos_vencidos() to service_role;

-- ---------------------------------------------------------------------------
-- Storage: las fotos de producto
-- ---------------------------------------------------------------------------

-- Público para leer por URL; subir, cambiar y borrar, solo el admin
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "productos: el admin sube" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'productos' and (select public.es_admin()));

create policy "productos: el admin cambia" on storage.objects
  for update to authenticated
  using (bucket_id = 'productos' and (select public.es_admin()))
  with check (bucket_id = 'productos' and (select public.es_admin()));

create policy "productos: el admin borra" on storage.objects
  for delete to authenticated
  using (bucket_id = 'productos' and (select public.es_admin()));

commit;
