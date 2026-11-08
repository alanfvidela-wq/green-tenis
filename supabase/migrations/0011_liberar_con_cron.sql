-- green.: liberar_pedidos_vencidos cada 10 minutos, con pg_cron. Se corre una
-- sola vez, entera, en el SQL Editor, después de 0010.
--
-- Hasta ahora no había cron: un pedido sin pagar se cancelaba y devolvía su
-- stock recién cuando corría liberar_pedidos_vencidos, al principio del
-- próximo crear_pedido o con un aviso del webhook. Si nadie compraba, el
-- stock quedaba apartado. Con esto, un pedido vencido (30 minutos sin pago)
-- se libera a más tardar 10 minutos después; crear_pedido y conciliar_pago la
-- siguen llamando igual, por si llegan antes.
--
-- La función ya estaba lista para esto: cancela solo lo pendiente de más de
-- 30 minutos y sin un pago en curso, y si dos llamadas se cruzan, la segunda
-- espera el lock de cada fila y ya la ve cancelada (el stock no vuelve dos
-- veces). El job corre como postgres, el dueño de la función.
--
-- pg_cron es una extensión de Supabase: queda en el esquema cron (cron.job,
-- cron.job_run_details). Se ve también en el panel: Integrations › Cron.

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Con el mismo nombre, volver a correrlo reemplaza el job en vez de duplicarlo
select cron.schedule(
  'liberar-pedidos-vencidos',
  '*/10 * * * *',
  $$select public.liberar_pedidos_vencidos()$$
);

-- Para verificar que está programado y que corre (docs/ARQUITECTURA.md):
--
--   select jobid, jobname, schedule, command, active
--   from cron.job
--   where jobname = 'liberar-pedidos-vencidos';
--
--   select status, return_message, start_time, end_time
--   from cron.job_run_details
--   where jobid = (select jobid from cron.job where jobname = 'liberar-pedidos-vencidos')
--   order by start_time desc
--   limit 5;
--
-- Para sacarlo: select cron.unschedule('liberar-pedidos-vencidos');
