-- ============================================================
-- HAKIKI v1 — core schema
-- "HAKIKI does not authenticate QR codes.
--  HAKIKI authenticates individual physical products."
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- companies ----------
-- v1 ships with exactly one row. company_id exists on every business
-- record so multi-tenancy later is a policy change, not a migration.
create table if not exists public.companies (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  support_phone text,
  support_email text,
  logo_url      text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- admin_users ----------
-- Mirrors auth.users; carries the HAKIKI role + company binding.
create table if not exists public.admin_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid not null references public.companies(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'OPERATIONS'
              check (role in ('ADMIN','OPERATIONS','VIEWER')),
  is_active   boolean not null default true,
  last_login_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ---------- products ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references public.companies(id) on delete cascade,
  name        text not null,
  sku         text not null,
  description text,
  size        text,
  image_url   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (company_id, sku)
);

-- ---------- batches ----------
create table if not exists public.batches (
  id                 uuid primary key default gen_random_uuid(),
  company_id         uuid not null references public.companies(id) on delete cascade,
  product_id         uuid not null references public.products(id) on delete restrict,
  batch_code         text not null,

  planned_quantity   integer not null check (planned_quantity > 0),
  generated_quantity integer not null default 0,
  activated_quantity integer not null default 0,
  voided_quantity    integer not null default 0,

  -- Length of the hidden scratch code for this batch.
  -- Shorter = easier for rural customers to type, but weaker against
  -- blind guessing. See lib/hakiki/codes.ts for the risk math.
  code_length        integer not null default 10 check (code_length between 6 and 14),

  manufactured_at    date,
  expires_at         date,
  notes              text,

  status             text not null default 'DRAFT'
                     check (status in ('DRAFT','CODES_GENERATED','PRINTING','LABELLED','ACTIVE','CLOSED','RECALLED')),

  created_by         uuid references public.admin_users(id) on delete set null,
  created_at         timestamptz not null default now(),
  activated_at       timestamptz,
  closed_at          timestamptz,
  unique (company_id, batch_code)
);

-- ---------- auth_units ----------
-- ONE ROW = ONE PHYSICAL PRODUCT. This is the heart of HAKIKI.
create table if not exists public.auth_units (
  id                    uuid primary key default gen_random_uuid(),
  company_id            uuid not null references public.companies(id) on delete cascade,
  product_id            uuid not null references public.products(id) on delete restrict,
  batch_id              uuid not null references public.batches(id) on delete cascade,

  serial_number         text not null unique,   -- printed, human readable
  public_token          text not null unique,   -- in the QR URL, public
  secret_code_hmac      text not null unique,   -- HMAC-SHA256(code, server pepper)
  secret_code_encrypted text,                   -- AES-256-GCM, for controlled reprints only

  status                text not null default 'GENERATED'
                        check (status in ('GENERATED','ACTIVE','VOIDED','REVOKED','RECALLED')),

  verification_count    integer not null default 0,
  distinct_verifiers    integer not null default 0,
  failed_attempt_count  integer not null default 0,

  first_verified_at     timestamptz,
  last_verified_at      timestamptz,
  activated_at          timestamptz,
  revoked_at            timestamptz,
  created_at            timestamptz not null default now()
);

-- ---------- label_jobs ----------
create table if not exists public.label_jobs (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  batch_id      uuid not null references public.batches(id) on delete cascade,
  quantity      integer not null,
  file_hash     text,
  storage_path  text,
  generated_by  uuid references public.admin_users(id) on delete set null,
  generated_at  timestamptz not null default now(),
  downloaded_at timestamptz,
  status        text not null default 'GENERATED'
                check (status in ('GENERATED','DOWNLOADED','SENT_TO_PRINTER','ARCHIVED'))
);

-- ---------- verification_events ----------
-- Every attempt is logged, including the bad ones. This is the
-- foundation of the fraud intelligence system.
create table if not exists public.verification_events (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid references public.companies(id) on delete cascade,
  auth_unit_id        uuid references public.auth_units(id) on delete cascade,
  batch_id            uuid references public.batches(id) on delete cascade,

  channel             text not null check (channel in ('QR_WEB','WEB','SMS','ADMIN')),
  result              text not null check (result in (
                        'GENUINE_FIRST','GENUINE_REPEAT','SUSPICIOUS_DUPLICATE',
                        'INVALID_CODE','INVALID_SECRET','NOT_ACTIVATED',
                        'VOIDED','REVOKED','RECALLED','RATE_LIMITED','EXPIRED')),

  phone_hash          text,   -- HMAC(phone, phone pepper) — never the raw number
  phone_last4         text,
  ip_hash             text,
  user_agent          text,
  region              text,   -- self-reported or consented geolocation
  latitude            double precision,
  longitude           double precision,

  provider_message_id text,   -- SMS webhook idempotency key
  verification_number integer,
  created_at          timestamptz not null default now()
);

-- ---------- fraud_alerts ----------
create table if not exists public.fraud_alerts (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references public.companies(id) on delete cascade,
  auth_unit_id  uuid references public.auth_units(id) on delete cascade,
  batch_id      uuid references public.batches(id) on delete cascade,

  alert_type    text not null check (alert_type in (
                  'DUPLICATE_VERIFICATION','HIGH_VOLUME_VERIFICATION',
                  'PRE_ACTIVATION_USE','REVOKED_USE','BRUTE_FORCE','INVALID_SURGE')),
  severity      text not null check (severity in ('WARNING','HIGH','CRITICAL')),
  status        text not null default 'OPEN'
                check (status in ('OPEN','INVESTIGATING','RESOLVED','DISMISSED')),

  detail        text,
  evidence      jsonb not null default '{}'::jsonb,
  event_count   integer not null default 1,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  resolved_by   uuid references public.admin_users(id) on delete set null,
  -- one live alert per unit per type; repeats escalate the existing row
  unique (auth_unit_id, alert_type)
);

-- ---------- sms_events ----------
create table if not exists public.sms_events (
  id                  uuid primary key default gen_random_uuid(),
  company_id          uuid references public.companies(id) on delete cascade,
  direction           text not null check (direction in ('INBOUND','OUTBOUND')),
  phone_hash          text,
  phone_last4         text,
  destination         text,
  body                text,
  provider            text not null default 'MOBISHASTRA',
  provider_message_id text,
  provider_response   text,
  status              text not null default 'PENDING'
                      check (status in ('PENDING','SENT','FAILED','RECEIVED','SKIPPED')),
  error               text,
  created_at          timestamptz not null default now()
);

-- ---------- audit_logs ----------
create table if not exists public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  company_id   uuid references public.companies(id) on delete cascade,
  actor_id     uuid references public.admin_users(id) on delete set null,
  actor_email  text,
  action       text not null,
  entity_type  text,
  entity_id    uuid,
  detail       jsonb not null default '{}'::jsonb,
  ip_hash      text,
  created_at   timestamptz not null default now()
);

-- ---------- rate_limits ----------
-- DB-backed limiter. No Redis needed at pilot volume.
create table if not exists public.rate_limits (
  bucket      text primary key,
  hits        integer not null default 0,
  window_start timestamptz not null default now()
);
