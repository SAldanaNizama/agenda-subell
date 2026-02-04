create table if not exists public.users (
  id bigint primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role text not null default 'user',
  color_class text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  patient_phone text not null,
  patient_age int null,
  city text not null,
  services text[] not null,
  amount_due numeric not null,
  discount_amount numeric null,
  amount_final numeric not null,
  schedule_type text not null default 'agenda',
  date text not null,
  time text not null,
  operator_id bigint not null,
  operator_name text not null,
  operator_color_class text not null,
  created_by_operator_id bigint not null,
  created_by_operator_name text not null,
  payment_status text not null default 'pending',
  payment_confirmed_at timestamptz null,
  payment_confirmed_by text null,
  appointment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.day_closures (
  date text primary key,
  closed_at timestamptz not null default now(),
  closed_by text not null
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  description text not null,
  amount numeric not null,
  created_at timestamptz not null default now()
);
