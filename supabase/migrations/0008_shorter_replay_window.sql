-- ============================================================
-- HAKIKI v1.4 -- the double-submit window shrinks to 10 seconds
--
-- 0006 made a scratch code a one-time credential: the first check answers
-- GENUINE_FIRST, every check after it answers CHECKED_MANY_TIMES. It also
-- added a 60 second window in which a resubmit by the same person replays the
-- previous answer instead of counting, so an accidental double tap could not
-- turn a genuine first scan into a counterfeit warning.
--
-- Sixty seconds was too long. Scanning a label and entering its code twice in
-- a row -- which is exactly what anyone does when they are testing, and what
-- a suspicious customer does in a shop -- returned "HALISI, hii ni mara ya
-- kwanza" both times. The guard meant to cover one mistaken tap was covering
-- a deliberate second check, and hiding genuine duplicate use for a minute.
--
-- Ten seconds still absorbs the accident it was built for (a request that
-- appeared to fail and was sent again) while a real second check, however
-- quickly it follows, is counted and warned about.
--
-- Nothing else changes: same signature, same rules, same thresholds.
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
  p_provider_message_id text default null,
  p_purchase_place      text default null
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
  v_recent   verification_events%rowtype;
  -- One check per code. The 2nd is where we start speaking up.
  c_repeat_limit constant integer := 1;
  -- Alerts stay at the old threshold. An owner rechecking their own bottle
  -- is now warned, but it is not evidence of anything and must not fill the
  -- investigation console with noise.
  c_alert_limit  constant integer := 3;
  -- A resubmit of the same code by the same person inside this window is a
  -- double tap or a retry after a timeout, not a second check.
  --
  -- Ten seconds, not sixty. This window exists to absorb one accident: the
  -- request that looked like it failed and got sent again. It is not a
  -- product rule, and at sixty seconds it had quietly become one -- anybody
  -- testing a label twice in a row was told "HALISI, mara ya kwanza" both
  -- times, which is the exact opposite of what a one-time credential is
  -- supposed to say, and it hid real duplicate use for a full minute.
  --
  -- The code sits under scratch foil. You cannot reveal it without holding
  -- the product, so the first person to submit it is the buyer and the second
  -- submission is either that buyer checking again -- who cannot know whether
  -- the earlier check was theirs -- or a copy. Both deserve the warning.
  c_grace_window constant interval := interval '10 seconds';
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
      insert into verification_events (channel, result, phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id, purchase_place)
      values (p_channel, 'INVALID_CODE', p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id, left(p_purchase_place, 160));
      return jsonb_build_object('result', 'INVALID_CODE');
    end if;

    if v_unit.secret_code_hmac is distinct from p_secret_hmac then
      -- Right label, wrong code. Usually a typo; repeated, it is a
      -- brute-force attempt against a known-good QR.
      update auth_units set failed_attempt_count = failed_attempt_count + 1
        where id = v_unit.id
        returning failed_attempt_count into v_count;

      insert into verification_events (company_id, auth_unit_id, batch_id, channel, result,
                                       phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id, purchase_place)
      values (v_unit.company_id, v_unit.id, v_unit.batch_id, p_channel, 'INVALID_SECRET',
              p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id, left(p_purchase_place, 160));

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
      insert into verification_events (channel, result, phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id, purchase_place)
      values (p_channel, 'INVALID_CODE', p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id, left(p_purchase_place, 160));
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
                                     phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id, purchase_place)
    values (v_unit.company_id, v_unit.id, v_unit.batch_id, p_channel, v_result,
            p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id, left(p_purchase_place, 160));

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
                                     phone_hash, phone_last4, ip_hash, user_agent, region, provider_message_id, purchase_place)
    values (v_unit.company_id, v_unit.id, v_unit.batch_id, p_channel, 'NOT_ACTIVATED',
            p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region, p_provider_message_id, left(p_purchase_place, 160));

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
  -- Double-submit guard.
  --
  -- Now that a single recheck triggers a warning, an accidental second
  -- submit is expensive: the customer would watch their genuine product be
  -- called a possible fake. If this same identity already checked this same
  -- unit moments ago, replay that answer and count nothing.
  -- ----------------------------------------------------------
  select * into v_recent
    from verification_events
   where auth_unit_id = v_unit.id
     and coalesce(phone_hash, ip_hash, 'anonymous') = v_identity
     and result in ('GENUINE_FIRST', 'GENUINE_REPEAT', 'CHECKED_MANY_TIMES', 'SUSPICIOUS_DUPLICATE')
     and created_at > now() - c_grace_window
   order by created_at desc
   limit 1;

  if found then
    return jsonb_build_object(
      'result',              v_recent.result,
      'serial',              v_unit.serial_number,
      'product',             v_product.name,
      'product_size',        v_product.size,
      'product_image',       v_product.image_url,
      'company',             v_company.name,
      'support_phone',       v_company.support_phone,
      'batch_code',          v_batch.batch_code,
      'verification_number', coalesce(v_recent.verification_number, v_unit.verification_count),
      'distinct_verifiers',  v_unit.distinct_verifiers,
      'first_verified_at',   v_unit.first_verified_at,
      'is_expired',          v_expired,
      'expires_at',          v_batch.expires_at,
      -- A gateway retry of a callback we already answered. The customer was
      -- replied to the first time, so the caller must not text them again.
      'deduplicated',        (p_provider_message_id is not null
                              and v_recent.provider_message_id is not distinct from p_provider_message_id)
    );
  end if;

  -- ----------------------------------------------------------
  -- Genuine credential. Now decide whether the pattern looks honest.
  -- ----------------------------------------------------------
  select exists (
    select 1 from verification_events
     where auth_unit_id = v_unit.id
       and result in ('GENUINE_FIRST', 'GENUINE_REPEAT', 'CHECKED_MANY_TIMES', 'SUSPICIOUS_DUPLICATE')
       and coalesce(phone_hash, ip_hash, 'anonymous') = v_identity
  ) into v_seen;

  select count(distinct coalesce(phone_hash, ip_hash, 'anonymous'))
    into v_distinct
    from verification_events
   where auth_unit_id = v_unit.id
     and result in ('GENUINE_FIRST', 'GENUINE_REPEAT', 'CHECKED_MANY_TIMES', 'SUSPICIOUS_DUPLICATE');

  if not v_seen then
    v_distinct := v_distinct + 1;
  end if;

  v_count := v_unit.verification_count + 1;

  if v_unit.verification_count = 0 then
    v_result := 'GENUINE_FIRST';
  elsif v_distinct >= 3 then
    -- One bottle cannot legitimately live in three different hands.
    v_result := 'SUSPICIOUS_DUPLICATE';
  elsif v_count > c_repeat_limit then
    -- The code has been revealed and used already. Whoever is holding this
    -- bottle is not the first to check it, and that is exactly what a copied
    -- code looks like.
    v_result := 'CHECKED_MANY_TIMES';
  else
    -- Unreachable while c_repeat_limit is 1, and kept so the threshold stays
    -- a one-line decision rather than a rewrite. Historical rows still carry
    -- this result.
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
                                   latitude, longitude, provider_message_id, verification_number, purchase_place)
  values (v_unit.company_id, v_unit.id, v_unit.batch_id, p_channel, v_result,
          p_phone_hash, p_phone_last4, p_ip_hash, p_user_agent, p_region,
          p_latitude, p_longitude, p_provider_message_id, v_count, left(p_purchase_place, 160));

  -- Deterministic escalation. No model, no scoring — just rules that
  -- an investigator can read back and defend.
  if v_distinct >= 3 or v_count > c_alert_limit then
    v_severity := case
                    when v_distinct >= 10 or v_count >= 10 then 'CRITICAL'
                    when v_distinct >= 5  or v_count >= 5  then 'HIGH'
                    else 'WARNING' end;

    insert into fraud_alerts (company_id, auth_unit_id, batch_id, alert_type, severity, detail, evidence, event_count)
    values (v_unit.company_id, v_unit.id, v_unit.batch_id,
            case when v_distinct >= 3 and v_count < 10 then 'DUPLICATE_VERIFICATION' else 'HIGH_VOLUME_VERIFICATION' end,
            v_severity,
            case when v_distinct >= 3
              then 'Serial ' || v_unit.serial_number || ' verified ' || v_count || ' times by '
                     || v_distinct || ' different people. The code has likely been copied onto counterfeits.'
              else 'Serial ' || v_unit.serial_number || ' verified ' || v_count || ' times from only '
                     || v_distinct || ' verifier identity. Either an owner rechecking, or one code copied '
                     || 'across a carton and checked from a single place.'
            end,
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

revoke all on function public.hakiki_verify from public, anon, authenticated;
