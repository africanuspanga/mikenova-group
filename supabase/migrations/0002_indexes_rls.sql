-- ============================================================
-- HAKIKI v1 — indexes + row level security
-- ============================================================

-- ---------- hot path indexes ----------
-- secret_code_hmac / public_token / serial_number are already UNIQUE (indexed).
create index if not exists idx_auth_units_batch      on public.auth_units (batch_id);
create index if not exists idx_auth_units_product    on public.auth_units (product_id);
create index if not exists idx_auth_units_status     on public.auth_units (batch_id, status);
create index if not exists idx_auth_units_suspicious on public.auth_units (distinct_verifiers desc)
  where distinct_verifiers > 1;

create index if not exists idx_ve_unit    on public.verification_events (auth_unit_id, created_at desc);
create index if not exists idx_ve_created on public.verification_events (created_at desc);
create index if not exists idx_ve_result  on public.verification_events (result, created_at desc);
create index if not exists idx_ve_batch   on public.verification_events (batch_id, created_at desc);
create index if not exists idx_ve_phone   on public.verification_events (phone_hash) where phone_hash is not null;
-- SMS webhook idempotency: the same provider callback must never double count.
create unique index if not exists idx_ve_provider_msg
  on public.verification_events (provider_message_id) where provider_message_id is not null;

create index if not exists idx_fa_status  on public.fraud_alerts (status, severity, created_at desc);
create index if not exists idx_fa_company on public.fraud_alerts (company_id, created_at desc);
create index if not exists idx_batches_company on public.batches (company_id, created_at desc);
create index if not exists idx_sms_created on public.sms_events (created_at desc);
create index if not exists idx_audit_created on public.audit_logs (created_at desc);

-- ---------- row level security ----------
-- Every table is RLS-enabled with NO policies granted to anon/authenticated.
-- That is deliberate: the browser must never reach auth_units directly.
-- All access goes through server routes holding the service_role key,
-- which bypasses RLS. The anon key is therefore useless for data access.
alter table public.companies           enable row level security;
alter table public.admin_users         enable row level security;
alter table public.products            enable row level security;
alter table public.batches             enable row level security;
alter table public.auth_units          enable row level security;
alter table public.label_jobs          enable row level security;
alter table public.verification_events enable row level security;
alter table public.fraud_alerts        enable row level security;
alter table public.sms_events          enable row level security;
alter table public.audit_logs          enable row level security;
alter table public.rate_limits         enable row level security;

-- Belt and braces: revoke the default grants PostgREST relies on so that
-- even a misconfigured policy cannot leak secrets to the public roles.
revoke all on public.auth_units          from anon, authenticated;
revoke all on public.verification_events from anon, authenticated;
revoke all on public.label_jobs          from anon, authenticated;
revoke all on public.audit_logs          from anon, authenticated;
revoke all on public.rate_limits         from anon, authenticated;
revoke all on public.sms_events          from anon, authenticated;
