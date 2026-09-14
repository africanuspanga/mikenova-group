-- ============================================================
-- HAKIKI v1 — verification engine
--
-- Runs as ONE atomic transaction with a row lock on the unit.
-- That matters: a counterfeiter submitting the same stolen code from
-- 20 phones in parallel must still be counted as 20 distinct verifiers.
-- Doing the read-decide-write in application code would let those
-- requests interleave and each read verification_count = 0.
-- ============================================================

create or replace function public.hakiki_verify(
  p_secret_hmac         text,
  p_public_token        text default null,
  p_channel             text default 'WEB',
  p_phone_hash          text default null,
  p_phone_last4         text default null,
  p_ip_hash             text default null,
  p_user_agent          text default null,
  p_region              text default null,
  p_latitude            double precision default null,
  p_longitude           double precision default null,
  p_provider_message_id text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_unit     auth_units%rowtype;
  v_batch    batches%rowtype;
  v_product  products%rowtype;
  v_company  companies%rowtype;
  v_identity text;
  v_result   text;
  v_distinct integer;
  v_seen     boolean;
  v_count    integer;
  v_severity text;
  v_expired  boolean := false;
begin
  -- A "verifier identity" is the phone for SMS, else the hashed IP.
  v_identity := coalesce(p_phone_hash, p_ip_hash, 'anonymous');

  -- ----------------------------------------------------------
  -- Locate the physical unit.
  -- ----------------------------------------------------------
  if p_public_token is not null then
    -- QR flow: the customer is holding ONE label. Find that label first,
    -- then ask whether the scratch code they typed belongs to it.
    select * into v_unit from auth_units
      where public_token = p_public_token for update;

    if not found then
      insert into verification_events (channel, result, phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id)
      values (p_channel, 'INVALID_CODE', p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id);
      return jsonb_build_object('result', 'INVALID_CODE');
    end if;

    if v_unit.secret_code_hmac is distinct from p_secret_hmac then
      -- Right label, wrong code. Usually a typo; repeated, it is a
      -- brute-force attempt against a known-good QR.
      update auth_units set failed_attempt_count = failed_attempt_count + 1
        where id = v_unit.id
        returning failed_attempt_count into v_count;

      insert into verification_events (company_id, auth_unit_id, batch_id, channel, result,
                                       phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id)
      values (v_unit.company_id, v_unit.id, v_unit.batch_id, p_channel, 'INVALID_SECRET',
              p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id);

      if v_count >= 3 then
        insert into fraud_alerts (company_id, auth_unit_id, batch_id, alert_type, severity, detail, evidence, event_count)
        values (v_unit.company_id, v_unit.id, v_unit.batch_id, 'BRUTE_FORCE',
                case when v_count >= 10 then 'HIGH' else 'WARNING' end,
                v_count || ' incorrect codes submitted against serial ' || v_unit.serial_number,
                jsonb_build_object('failed_attempts', v_count), v_count)
        on conflict (auth_unit_id, alert_type) do update
          set event_count = excluded.event_count,
              severity    = excluded.severity,
              detail      = excluded.detail,
              status      = case when fraud_alerts.status = 'RESOLVED' then 'OPEN' else fraud_alerts.status end,
              updated_at  = now();
      end if;

      return jsonb_build_object('result', 'INVALID_SECRET', 'failed_attempts', v_count);
    end if;
  else
    -- SMS / manual entry: the code alone must identify the unit.
    select * into v_unit from auth_units
      where secret_code_hmac = p_secret_hmac for update;

    if not found then
      insert into verification_events (channel, result, phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id)
      values (p_channel, 'INVALID_CODE', p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id);
      return jsonb_build_object('result', 'INVALID_CODE');
    end if;
  end if;

  select * into v_batch   from batches   where id = v_unit.batch_id;
  select * into v_product from products  where id = v_unit.product_id;
  select * into v_company from companies where id = v_unit.company_id;

  -- ----------------------------------------------------------
  -- Lifecycle gates, before we call anything genuine.
  -- ----------------------------------------------------------
  if v_unit.status in ('VOIDED', 'REVOKED', 'RECALLED') or v_batch.status = 'RECALLED' then
    v_result := case
                  when v_batch.status = 'RECALLED' or v_unit.status = 'RECALLED' then 'RECALLED'
                  when v_unit.status = 'VOIDED' then 'VOIDED'
                  else 'REVOKED' end;

    insert into verification_events (company_id, auth_unit_id, batch_id, channel, result,
                                     phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id)
    values (v_unit.company_id, v_unit.id, v_unit.batch_id, p_channel, v_result,
            p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id);

    insert into fraud_alerts (company_id, auth_unit_id, batch_id, alert_type, severity, detail, evidence)
    values (v_unit.company_id, v_unit.id, v_unit.batch_id, 'REVOKED_USE', 'HIGH',
            'A ' || v_result || ' credential (' || v_unit.serial_number || ') was presented for verification.',
            jsonb_build_object('unit_status', v_unit.status, 'batch_status', v_batch.status))
    on conflict (auth_unit_id, alert_type) do update
      set event_count = fraud_alerts.event_count + 1, updated_at = now();

    return jsonb_build_object('result', v_result, 'serial', v_unit.serial_number,
                              'product', v_product.name, 'company', v_company.name);
  end if;

  -- Labels that exist but were never reconciled onto a real product.
  -- This is how stolen or leaked label stock surfaces.
  if v_unit.status <> 'ACTIVE' or v_batch.status not in ('ACTIVE', 'CLOSED') then
    insert into verification_events (company_id, auth_unit_id, batch_id, channel, result,
                                     phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id)
    values (v_unit.company_id, v_unit.id, v_unit.batch_id, p_channel, 'NOT_ACTIVATED',
            p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id);

    insert into fraud_alerts (company_id, auth_unit_id, batch_id, alert_type, severity, detail, evidence)
    values (v_unit.company_id, v_unit.id, v_unit.batch_id, 'PRE_ACTIVATION_USE', 'HIGH',
            'Serial ' || v_unit.serial_number || ' was verified in the market before batch '
              || v_batch.batch_code || ' was activated.',
            jsonb_build_object('unit_status', v_unit.status, 'batch_status', v_batch.status))
    on conflict (auth_unit_id, alert_type) do update
      set event_count = fraud_alerts.event_count + 1, updated_at = now();

    return jsonb_build_object('result', 'NOT_ACTIVATED', 'serial', v_unit.serial_number,
                              'product', v_product.name, 'company', v_company.name,
                              'batch_code', v_batch.batch_code);
  end if;

  if v_batch.expires_at is not null and v_batch.expires_at < current_date then
    v_expired := true;
  end if;

  -- ----------------------------------------------------------
  -- Genuine credential. Now decide whether the pattern looks honest.
  -- ----------------------------------------------------------
  select exists (
    select 1 from verification_events
     where auth_unit_id = v_unit.id
       and result like 'GENUINE%'
       and coalesce(phone_hash, ip_hash, 'anonymous') = v_identity
  ) into v_seen;

  select count(distinct coalesce(phone_hash, ip_hash, 'anonymous'))
    into v_distinct
    from verification_events
   where auth_unit_id = v_unit.id
     and result in ('GENUINE_FIRST', 'GENUINE_REPEAT', 'SUSPICIOUS_DUPLICATE');

  if not v_seen then
    v_distinct := v_distinct + 1;
  end if;

  v_count := v_unit.verification_count + 1;

  if v_unit.verification_count = 0 then
    v_result := 'GENUINE_FIRST';
  elsif v_distinct >= 3 then
    -- One bottle cannot legitimately live in three different hands.
    v_result := 'SUSPICIOUS_DUPLICATE';
  else
    v_result := 'GENUINE_REPEAT';
  end if;

  update auth_units
     set verification_count = v_count,
         distinct_verifiers = v_distinct,
         first_verified_at  = coalesce(first_verified_at, now()),
         last_verified_at   = now()
   where id = v_unit.id;

  insert into verification_events (company_id, auth_unit_id, batch_id, channel, result,
                                   phone_hash, phone_last4, ip_hash, user_agent, region,
                                   latitude, longitude, provider_message_id, verification_number)
  values (v_unit.company_id, v_unit.id, v_unit.batch_id, p_channel, v_result,
          p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region,
          p_latitude, p_longitude, p_provider_message_id, v_count);

  -- Deterministic escalation. No model, no scoring — just rules that
  -- an investigator can read back and defend.
  if v_distinct >= 3 then
    v_severity := case
                    when v_distinct >= 10 or v_count >= 10 then 'CRITICAL'
                    when v_distinct >= 5  or v_count >= 5  then 'HIGH'
                    else 'WARNING' end;

    insert into fraud_alerts (company_id, auth_unit_id, batch_id, alert_type, severity, detail, evidence, event_count)
    values (v_unit.company_id, v_unit.id, v_unit.batch_id,
            case when v_count >= 10 then 'HIGH_VOLUME_VERIFICATION' else 'DUPLICATE_VERIFICATION' end,
            v_severity,
            'Serial ' || v_unit.serial_number || ' verified ' || v_count || ' times by '
              || v_distinct || ' different people. The code has likely been copied onto counterfeits.',
            jsonb_build_object('verification_count', v_count, 'distinct_verifiers', v_distinct,
                               'batch_code', v_batch.batch_code, 'product', v_product.name),
            v_count)
    on conflict (auth_unit_id, alert_type) do update
      set severity    = excluded.severity,
          detail      = excluded.detail,
          evidence    = excluded.evidence,
          event_count = excluded.event_count,
          status      = case when fraud_alerts.status in ('RESOLVED','DISMISSED') then 'OPEN' else fraud_alerts.status end,
          updated_at  = now();
  end if;

  return jsonb_build_object(
    'result',              v_result,
    'serial',              v_unit.serial_number,
    'product',             v_product.name,
    'product_size',        v_product.size,
    'product_image',       v_product.image_url,
    'company',             v_company.name,
    'support_phone',       v_company.support_phone,
    'batch_code',          v_batch.batch_code,
    'verification_number', v_count,
    'distinct_verifiers',  v_distinct,
    'first_verified_at',   v_unit.first_verified_at,
    'is_expired',          v_expired,
    'expires_at',          v_batch.expires_at,
    'severity',            v_severity
  );
end;
$$;

-- ------------------------------------------------------------
-- Atomic fixed-window rate limiter. Returns true when ALLOWED.
-- ------------------------------------------------------------
create or replace function public.hakiki_rate_limit(
  p_bucket text, p_limit integer, p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
begin
  insert into rate_limits (bucket, hits, window_start)
  values (p_bucket, 1, now())
  on conflict (bucket) do update
    set hits = case
                 when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
                 then 1 else rate_limits.hits + 1 end,
        window_start = case
                 when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
                 then now() else rate_limits.window_start end
  returning hits into v_hits;

  return v_hits <= p_limit;
end;
$$;

-- Only the server (service_role) may ever call these.
revoke all on function public.hakiki_verify     from public, anon, authenticated;
revoke all on function public.hakiki_rate_limit from public, anon, authenticated;
