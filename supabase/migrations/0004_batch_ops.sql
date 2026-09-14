-- ============================================================
-- HAKIKI v1 — batch lifecycle operations
--
-- Activation is the step that actually matters operationally.
-- Codes are generated at the printer; they must NOT verify as genuine
-- until someone confirms the labels reached real products. Anything
-- else means a stolen label roll authenticates counterfeits.
-- ============================================================

-- Activate the first N still-unactivated units in a batch.
create or replace function public.hakiki_activate_batch(
  p_batch_id uuid, p_quantity integer
) returns integer
language plpgsql security definer set search_path = public
as $$
declare v_activated integer;
begin
  with target as (
    select id from auth_units
     where batch_id = p_batch_id and status = 'GENERATED'
     order by serial_number
     limit p_quantity
     for update skip locked
  )
  update auth_units u
     set status = 'ACTIVE', activated_at = now()
    from target t
   where u.id = t.id;

  get diagnostics v_activated = row_count;

  update batches
     set activated_quantity = activated_quantity + v_activated,
         status = 'ACTIVE',
         activated_at = coalesce(activated_at, now())
   where id = p_batch_id;

  return v_activated;
end;
$$;

-- Activate an explicit list of serials — used when the line reconciles
-- by scanning rather than by counting off the roll.
create or replace function public.hakiki_activate_serials(
  p_batch_id uuid, p_serials text[]
) returns integer
language plpgsql security definer set search_path = public
as $$
declare v_activated integer;
begin
  update auth_units
     set status = 'ACTIVE', activated_at = now()
   where batch_id = p_batch_id
     and status = 'GENERATED'
     and serial_number = any(p_serials);

  get diagnostics v_activated = row_count;

  update batches
     set activated_quantity = activated_quantity + v_activated,
         status = 'ACTIVE',
         activated_at = coalesce(activated_at, now())
   where id = p_batch_id;

  return v_activated;
end;
$$;

-- Destroy the codes for labels that never made it onto a product.
create or replace function public.hakiki_void_remaining(p_batch_id uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare v_voided integer;
begin
  update auth_units
     set status = 'VOIDED'
   where batch_id = p_batch_id and status = 'GENERATED';

  get diagnostics v_voided = row_count;

  update batches
     set voided_quantity = voided_quantity + v_voided
   where id = p_batch_id;

  return v_voided;
end;
$$;

-- Pull an entire batch out of the market.
create or replace function public.hakiki_recall_batch(p_batch_id uuid)
returns integer
language plpgsql security definer set search_path = public
as $$
declare v_count integer;
begin
  update auth_units set status = 'RECALLED'
   where batch_id = p_batch_id and status in ('ACTIVE', 'GENERATED');
  get diagnostics v_count = row_count;

  update batches set status = 'RECALLED' where id = p_batch_id;
  return v_count;
end;
$$;

revoke all on function public.hakiki_activate_batch   from public, anon, authenticated;
revoke all on function public.hakiki_activate_serials from public, anon, authenticated;
revoke all on function public.hakiki_void_remaining   from public, anon, authenticated;
revoke all on function public.hakiki_recall_batch     from public, anon, authenticated;
