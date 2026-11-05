-- ovio: Postgres schema for the backend milestone (Supabase).
-- Money is integer cents + ISO 4217 currency. Times are timestamptz in UTC.

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (length(name) between 1 and 80),
  email text,
  default_currency char(3) not null default 'EUR',
  simplify_by_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- People the user tracks; may or may not be linked to a real profile.
create table people (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  name text not null check (length(name) between 1 and 80),
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on people (owner_id);
create index on people (profile_id);

create table groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null check (length(name) between 1 and 60),
  kind text not null default 'other' check (kind in ('trip','home','couple','other')),
  currency char(3) not null default 'EUR',
  simplify_debts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on groups (owner_id);

create table group_members (
  group_id uuid not null references groups(id) on delete cascade,
  person_id uuid not null references people(id) on delete restrict,
  joined_at timestamptz not null default now(),
  primary key (group_id, person_id)
);
create index on group_members (person_id);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  description text not null check (length(description) between 1 and 120),
  cost_cents bigint not null check (cost_cents > 0),
  currency char(3) not null,
  split_method text not null default 'equal'
    check (split_method in ('equal','exact','percent','shares')),
  category text not null default 'general',
  notes text,
  is_payment boolean not null default false,
  spent_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index on expenses (owner_id, spent_on desc);
create index on expenses (group_id, spent_on desc);

create table expense_shares (
  expense_id uuid not null references expenses(id) on delete cascade,
  person_id uuid not null references people(id) on delete restrict,
  paid_cents bigint not null default 0 check (paid_cents >= 0),
  owed_cents bigint not null default 0 check (owed_cents >= 0),
  primary key (expense_id, person_id)
);
create index on expense_shares (person_id);

-- Shares must add up to the cost, checked at commit so all rows can be inserted first.
create function check_expense_shares() returns trigger language plpgsql as $$
declare e expenses; paid bigint; owed bigint;
begin
  select * into e from expenses where id = coalesce(new.expense_id, old.expense_id);
  if e.id is null then return null; end if;
  select coalesce(sum(paid_cents),0), coalesce(sum(owed_cents),0) into paid, owed
    from expense_shares where expense_id = e.id;
  if paid <> e.cost_cents or owed <> e.cost_cents then
    raise exception 'shares for expense % do not add up to %', e.id, e.cost_cents;
  end if;
  return null;
end $$;
create constraint trigger expense_shares_sum
  after insert or update or delete on expense_shares
  deferrable initially deferred
  for each row execute function check_expense_shares();

create table activity (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('expense_added','expense_edited','expense_deleted',
                                     'payment','group_created','group_deleted','friend_added')),
  subject_id uuid,
  summary text not null,
  at timestamptz not null default now()
);
create index on activity (owner_id, at desc);

-- Access: row level security, owner only for the first backend release.
alter table profiles enable row level security;
alter table people enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table expenses enable row level security;
alter table expense_shares enable row level security;
alter table activity enable row level security;

create policy own_profile on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy own_people on people for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy own_groups on groups for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy own_members on group_members for all
  using (exists (select 1 from groups g where g.id = group_id and g.owner_id = auth.uid()))
  with check (exists (select 1 from groups g where g.id = group_id and g.owner_id = auth.uid()));
create policy own_expenses on expenses for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy own_shares on expense_shares for all
  using (exists (select 1 from expenses e where e.id = expense_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from expenses e where e.id = expense_id and e.owner_id = auth.uid()));
create policy own_activity on activity for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
