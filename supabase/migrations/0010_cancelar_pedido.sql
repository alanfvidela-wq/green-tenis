-- green.: cancelar_pedido, para que el cliente cancele un pedido suyo que
-- todavía no pagó y el stock vuelva en el momento, sin esperar los 30 minutos.
-- Se corre una sola vez, entera, en el SQL Editor, después de 0009. Va en una
-- transacción: si algo falla, no queda nada a medias.
--
-- Hoy la usa el test E2E del checkout (e2e/cuenta.spec.js) para limpiar el
-- pedido que crea, con la sesión de la cuenta de prueba: no hace falta la
-- clave secreta. La tienda todavía no tiene un botón que la llame.
--
-- Hace lo mismo que liberar_pedidos_vencidos con un solo pedido:
-- - solo un pedido del usuario que llama (auth.uid()), en pendiente_pago y sin
--   un pago en curso (pending o in_process en Mercado Pago);
-- - lo pasa a cancelado y devuelve el stock de sus ítems;
-- - si dos llamadas se cruzan con liberar_pedidos_vencidos o conciliar_pago,
--   el update espera el lock de la fila y vuelve a evaluar el where: si ya
--   no está pendiente, no hace nada y el stock no se devuelve dos veces.
--
-- cancelado_por suma 'cliente'. Si el pedido ya pasó los 30 minutos, queda
-- como 'vencimiento', igual que si lo hubiera cancelado
-- liberar_pedidos_vencidos: así un pago aprobado a tiempo se sigue
-- reactivando (0003). Un approved que llega después de que el cliente
-- canceló va a revisión como pago_en_cancelado («El pedido no se canceló por
-- vencido»), como cualquier pago de un pedido cancelado que no venció.

begin;

-- El check se llama como lo nombró Postgres al crear la columna (0002). Sin
-- «if exists»: si no se llamara así, la migración falla entera y no queda un
-- check viejo que rechace 'cliente'.
alter table public.pedidos
  drop constraint pedidos_cancelado_por_check,
  add constraint pedidos_cancelado_por_check
    check (cancelado_por in ('vencimiento', 'devolucion', 'cliente'));

-- Devuelve true si lo canceló; false si no es del usuario, no existe, ya no
-- está pendiente o tiene un pago en curso (entonces no cambia nada).
create function public.cancelar_pedido(pedido uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_usuario uuid := auth.uid();
  v_id      uuid;
begin
  if v_usuario is null then
    raise exception 'Para cancelar un pedido hay que iniciar sesión' using errcode = '42501';
  end if;

  update public.pedidos p
  set estado = 'cancelado',
      cancelado_por = case
        when p.creado_en < now() - interval '30 minutes' then 'vencimiento'
        else 'cliente'
      end,
      cancelado_en = now()
  where p.id = cancelar_pedido.pedido
    and p.usuario_id = v_usuario
    and p.estado = 'pendiente_pago'
    and not p.pago_en_curso
  returning p.id into v_id;

  if v_id is null then
    return false;
  end if;

  -- El stock de sus ítems, como en liberar_pedidos_vencidos (los servicios,
  -- con stock null, no se controlan)
  update public.variantes v
  set stock = v.stock + d.cantidad
  from (
    select i.variante_id, sum(i.cantidad) as cantidad
    from public.pedido_items i
    where i.pedido_id = v_id
    group by i.variante_id
  ) d
  where v.id = d.variante_id and v.stock is not null;

  return true;
end;
$$;

revoke all on function public.cancelar_pedido(uuid) from public, anon;
grant execute on function public.cancelar_pedido(uuid) to authenticated;

commit;
