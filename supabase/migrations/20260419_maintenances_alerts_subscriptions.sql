-- ============================================================
-- Migração: Manutenções, Alertas e Assinaturas
-- Data: 2026-04-19
-- Objetivo: adicionar o núcleo do produto — histórico de
-- manutenções, alertas automáticos e controle de planos
-- ============================================================
-- Migration idempotente: pode ser re-executada sem erros.
-- ============================================================

-- ============================================================
-- 0) FUNCTION AUXILIAR: update_updated_at
-- Garante que exista (pode já vir de migration anterior).
-- ============================================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1) MAINTENANCES (manutenções realizadas)
-- ============================================================
create table if not exists public.maintenances (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  service_type text not null check (service_type in (
    'troca_oleo', 'freios', 'pneus', 'filtros', 'bateria',
    'suspensao', 'alinhamento', 'revisao', 'outro'
  )),
  description text,
  cost numeric(10,2) not null default 0 check (cost >= 0),
  mileage integer check (mileage >= 0),
  service_date date not null default current_date,
  workshop text,
  parts jsonb default '[]'::jsonb,
  os_image_path text,
  source text not null default 'manual' check (source in ('manual', 'ocr')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_maintenances_vehicle on public.maintenances(vehicle_id);
create index if not exists idx_maintenances_user on public.maintenances(user_id);
create index if not exists idx_maintenances_date on public.maintenances(service_date desc);
create index if not exists idx_maintenances_user_month on public.maintenances(user_id, service_date);

alter table public.maintenances enable row level security;

drop policy if exists "Ver próprias manutenções" on public.maintenances;
create policy "Ver próprias manutenções" on public.maintenances
  for select using (auth.uid() = user_id);

drop policy if exists "Inserir manutenções" on public.maintenances;
create policy "Inserir manutenções" on public.maintenances
  for insert with check (auth.uid() = user_id);

drop policy if exists "Atualizar próprias manutenções" on public.maintenances;
create policy "Atualizar próprias manutenções" on public.maintenances
  for update using (auth.uid() = user_id);

drop policy if exists "Deletar próprias manutenções" on public.maintenances;
create policy "Deletar próprias manutenções" on public.maintenances
  for delete using (auth.uid() = user_id);

drop trigger if exists maintenances_updated_at on public.maintenances;
create trigger maintenances_updated_at
  before update on public.maintenances
  for each row execute function public.update_updated_at();

-- ============================================================
-- 2) ALERTS (alertas de manutenção futura)
-- ============================================================
create table if not exists public.alerts (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  due_mileage integer,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  source text not null default 'manual' check (source in ('auto', 'manual')),
  is_resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_alerts_vehicle on public.alerts(vehicle_id);
create index if not exists idx_alerts_user on public.alerts(user_id);
create index if not exists idx_alerts_pending on public.alerts(user_id, is_resolved) where is_resolved = false;

alter table public.alerts enable row level security;

drop policy if exists "Ver próprios alertas" on public.alerts;
create policy "Ver próprios alertas" on public.alerts
  for select using (auth.uid() = user_id);

drop policy if exists "Inserir alertas" on public.alerts;
create policy "Inserir alertas" on public.alerts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Atualizar próprios alertas" on public.alerts;
create policy "Atualizar próprios alertas" on public.alerts
  for update using (auth.uid() = user_id);

drop policy if exists "Deletar próprios alertas" on public.alerts;
create policy "Deletar próprios alertas" on public.alerts
  for delete using (auth.uid() = user_id);

-- ============================================================
-- 3) SUBSCRIPTIONS (planos de assinatura)
-- ============================================================
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan text not null default 'free' check (plan in ('free', 'pro', 'familia')),
  status text not null default 'active' check (status in ('active', 'canceled', 'expired')),
  whatsapp_notifications_enabled boolean not null default false,
  started_at timestamptz default now(),
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_user on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

drop policy if exists "Ver próprio plano" on public.subscriptions;
create policy "Ver próprio plano" on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "Inserir próprio plano" on public.subscriptions;
create policy "Inserir próprio plano" on public.subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Atualizar próprio plano" on public.subscriptions;
create policy "Atualizar próprio plano" on public.subscriptions
  for update using (auth.uid() = user_id);

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at();

-- ============================================================
-- 4) TRIGGER: criar subscription 'free' automático no signup
-- ============================================================
create or replace function public.handle_new_user_subscription()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_subscription on auth.users;
create trigger on_auth_user_created_subscription
  after insert on auth.users
  for each row execute function public.handle_new_user_subscription();

-- Backfill: criar subscription 'free' para usuários já existentes
insert into public.subscriptions (user_id, plan, status)
select id, 'free', 'active'
from auth.users
where id not in (select user_id from public.subscriptions);

-- ============================================================
-- 5) TRIGGER: gerar alerta automático de manutenção preventiva
-- ============================================================
-- Quando uma manutenção é inserida, cria alertas automáticos
-- baseados em intervalos recomendados do mercado.
create or replace function public.generate_maintenance_alerts()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  interval_km integer;
  alert_title text;
  alert_desc text;
begin
  -- Intervalos recomendados por tipo de serviço
  case new.service_type
    when 'troca_oleo' then
      interval_km := 10000;
      alert_title := 'Próxima troca de óleo';
      alert_desc := 'Recomendado a cada 10.000 km';
    when 'freios' then
      interval_km := 20000;
      alert_title := 'Revisão dos freios';
      alert_desc := 'Recomendado a cada 20.000 km';
    when 'pneus' then
      interval_km := 40000;
      alert_title := 'Troca de pneus';
      alert_desc := 'Recomendado a cada 40.000 km';
    when 'filtros' then
      interval_km := 15000;
      alert_title := 'Troca de filtros';
      alert_desc := 'Recomendado a cada 15.000 km';
    when 'bateria' then
      interval_km := null;
      alert_title := null;
      alert_desc := null;
    when 'revisao' then
      interval_km := 10000;
      alert_title := 'Próxima revisão';
      alert_desc := 'Recomendado a cada 10.000 km';
    else
      interval_km := null;
  end case;

  -- Se o tipo tem intervalo definido e temos km, cria o alerta
  if interval_km is not null and new.mileage is not null and alert_title is not null then
    insert into public.alerts (
      vehicle_id, user_id, title, description,
      due_mileage, priority, source
    ) values (
      new.vehicle_id, new.user_id, alert_title, alert_desc,
      new.mileage + interval_km, 'medium', 'auto'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_maintenance_created_alert on public.maintenances;
create trigger on_maintenance_created_alert
  after insert on public.maintenances
  for each row execute function public.generate_maintenance_alerts();

-- ============================================================
-- 6) STORAGE: bucket privado para imagens de OS
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'os-uploads',
  'os-uploads',
  false,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Policies: usuário só acessa arquivos na sua própria pasta {user_id}/
drop policy if exists "User upload own OS" on storage.objects;
create policy "User upload own OS" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'os-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "User read own OS" on storage.objects;
create policy "User read own OS" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'os-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "User delete own OS" on storage.objects;
create policy "User delete own OS" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'os-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
