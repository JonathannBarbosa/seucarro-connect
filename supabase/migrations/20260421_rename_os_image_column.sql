-- ============================================================
-- Migração de correção: renomear os_image_url -> os_image_path
-- Data: 2026-04-21
-- Motivo: passamos a armazenar o path do storage (não a URL
-- assinada) para gerar URLs sob demanda e evitar links expirados
-- ============================================================
-- Idempotente: cobre os três cenários possíveis na prod —
--   (a) tabela ainda com a coluna antiga `os_image_url`
--   (b) tabela já com `os_image_path`
--   (c) tabela sem nenhuma das duas (ambientes novos)
-- ============================================================

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'maintenances'
      and column_name = 'os_image_url'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'maintenances'
        and column_name = 'os_image_path'
    ) then
      -- Caso raro: as duas colunas coexistem. Copia o valor
      -- da antiga para a nova quando a nova está nula e dropa a antiga.
      update public.maintenances
         set os_image_path = os_image_url
       where os_image_path is null
         and os_image_url is not null;
      alter table public.maintenances drop column os_image_url;
    else
      alter table public.maintenances rename column os_image_url to os_image_path;
    end if;
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'maintenances'
      and column_name = 'os_image_path'
  ) then
    alter table public.maintenances add column os_image_path text;
  end if;
end $$;
