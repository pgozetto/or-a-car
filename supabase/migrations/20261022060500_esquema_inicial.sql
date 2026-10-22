-- Aplicada no projeto Supabase "orcacar" (mntzyauafruhpfkatbue) em 2026-10-22.

-- Uma oficina por usuário (id = auth.users.id).
create table public.oficinas (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  whatsapp text not null default '',
  uf char(2) not null default 'SP',
  local text not null default 'capital' check (local in ('capital', 'interior')),
  valor_hora numeric(10, 2) not null default 80 check (valor_hora >= 0),
  -- Campos de assinatura: só o servidor (service role) altera.
  plano text not null default 'gratis' check (plano in ('gratis', 'oficina', 'pro')),
  assinatura_status text not null default 'inativa'
    check (assinatura_status in ('inativa', 'pendente', 'ativa', 'cancelada')),
  assinatura_ciclo text check (assinatura_ciclo in ('mensal', 'anual')),
  assinatura_fim timestamptz,
  mp_preapproval_id text unique,
  orcamentos_criados integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.servicos_oficina (
  id uuid primary key default gen_random_uuid(),
  oficina_id uuid not null default auth.uid() references public.oficinas (id) on delete cascade,
  nome text not null,
  horas numeric(6, 2) not null default 1 check (horas >= 0),
  pecas jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index servicos_oficina_oficina_id_idx on public.servicos_oficina (oficina_id);

create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  oficina_id uuid not null default auth.uid() references public.oficinas (id) on delete cascade,
  cliente text not null default '',
  telefone_cliente text not null default '',
  veiculo jsonb not null,
  modelo text not null default '',
  itens jsonb not null,
  valor_hora numeric(10, 2) not null,
  desconto_pct numeric(5, 2) not null default 0,
  total numeric(12, 2) not null,
  status text not null default 'enviado' check (status in ('enviado', 'aprovado', 'recusado')),
  servicos_oficina jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index orcamentos_oficina_id_created_idx on public.orcamentos (oficina_id, created_at desc);

-- Registro dos avisos do Mercado Pago (só o servidor lê e escreve).
create table public.eventos_pagamento (
  id bigint generated always as identity primary key,
  mp_id text not null,
  tipo text not null,
  payload jsonb not null,
  recebido_em timestamptz not null default now()
);

-- Funções internas fora do schema exposto pela API.
create schema if not exists private;
grant usage on schema private to authenticated;

create function private.assinatura_ativa(o public.oficinas)
returns boolean
language sql
stable
set search_path = ''
as $$
  select o.plano <> 'gratis'
    and (
      o.assinatura_status = 'ativa'
      or (o.assinatura_status = 'cancelada' and o.assinatura_fim > now())
    );
$$;

-- Plano grátis: 3 orçamentos no total (contador não diminui ao excluir).
create function private.pode_criar_orcamento()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.oficinas o
    where o.id = (select auth.uid())
      and (private.assinatura_ativa(o) or o.orcamentos_criados < 3)
  );
$$;

create function private.contar_orcamento()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.oficinas
    set orcamentos_criados = orcamentos_criados + 1
    where id = new.oficina_id;
  return new;
end;
$$;

create trigger orcamentos_contar
  after insert on public.orcamentos
  for each row execute function private.contar_orcamento();

revoke all on function private.assinatura_ativa(public.oficinas) from public;
revoke all on function private.pode_criar_orcamento() from public;
revoke all on function private.contar_orcamento() from public;
grant execute on function private.assinatura_ativa(public.oficinas) to authenticated;
grant execute on function private.pode_criar_orcamento() to authenticated;

-- RLS
alter table public.oficinas enable row level security;
alter table public.servicos_oficina enable row level security;
alter table public.orcamentos enable row level security;
alter table public.eventos_pagamento enable row level security;

create policy "oficina: ver a própria" on public.oficinas
  for select to authenticated using (id = (select auth.uid()));
create policy "oficina: criar a própria" on public.oficinas
  for insert to authenticated with check (id = (select auth.uid()));
create policy "oficina: editar a própria" on public.oficinas
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "servicos: ver os próprios" on public.servicos_oficina
  for select to authenticated using (oficina_id = (select auth.uid()));
create policy "servicos: criar os próprios" on public.servicos_oficina
  for insert to authenticated with check (oficina_id = (select auth.uid()));
create policy "servicos: editar os próprios" on public.servicos_oficina
  for update to authenticated
  using (oficina_id = (select auth.uid())) with check (oficina_id = (select auth.uid()));
create policy "servicos: excluir os próprios" on public.servicos_oficina
  for delete to authenticated using (oficina_id = (select auth.uid()));

create policy "orcamentos: ver os próprios" on public.orcamentos
  for select to authenticated using (oficina_id = (select auth.uid()));
create policy "orcamentos: criar dentro do plano" on public.orcamentos
  for insert to authenticated
  with check (oficina_id = (select auth.uid()) and (select private.pode_criar_orcamento()));
create policy "orcamentos: editar os próprios" on public.orcamentos
  for update to authenticated
  using (oficina_id = (select auth.uid())) with check (oficina_id = (select auth.uid()));
create policy "orcamentos: excluir os próprios" on public.orcamentos
  for delete to authenticated using (oficina_id = (select auth.uid()));

-- Permissões por coluna: o usuário não mexe em plano, assinatura nem contador.
revoke all on public.oficinas from anon, authenticated;
grant select on public.oficinas to authenticated;
grant insert (id, nome, whatsapp, uf, local, valor_hora) on public.oficinas to authenticated;
grant update (nome, whatsapp, uf, local, valor_hora) on public.oficinas to authenticated;

revoke all on public.servicos_oficina from anon;
revoke all on public.orcamentos from anon, authenticated;
grant select, delete on public.orcamentos to authenticated;
grant insert (oficina_id, cliente, telefone_cliente, veiculo, modelo, itens, valor_hora,
  desconto_pct, total, servicos_oficina) on public.orcamentos to authenticated;
grant update (status) on public.orcamentos to authenticated;

revoke all on public.eventos_pagamento from anon, authenticated;
