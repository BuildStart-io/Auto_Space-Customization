#!/usr/bin/env python3
import os

with open("buildstart-selfhosted/db/01_schema.sql", "r") as f:
    schema_lines = f.readlines()

filtered_lines = [
    line for line in schema_lines
    if not line.strip().startswith(r"\restrict") and not line.strip().startswith(r"\unrestrict")
]

extra_sql = """
-- ============================================================================
-- broadcast_campaigns & broadcast_queue (New Customization Tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "AutoSpace".broadcast_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text DEFAULT 'Promotional Broadcast'::text NOT NULL,
    title text DEFAULT 'Promotional Broadcast'::text NOT NULL,
    segment text DEFAULT 'all'::text NOT NULL,
    audience_filter text DEFAULT 'all'::text NOT NULL,
    message text,
    message_template text,
    media_url text,
    media_type text,
    total_recipients integer DEFAULT 0 NOT NULL,
    total_count integer DEFAULT 0 NOT NULL,
    sent_count integer DEFAULT 0 NOT NULL,
    failed_count integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL CONSTRAINT broadcast_campaigns_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sending'::text, 'in_progress'::text, 'completed'::text, 'paused'::text, 'cancelled'::text, 'failed'::text]))),
    delay_seconds integer DEFAULT 10 NOT NULL,
    delay_seconds_min integer DEFAULT 8 NOT NULL,
    delay_seconds_max integer DEFAULT 15 NOT NULL,
    batch_size integer DEFAULT 30 NOT NULL,
    batch_cooldown_seconds integer DEFAULT 120 NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "AutoSpace".broadcast_campaigns OWNER TO postgres;

CREATE TABLE IF NOT EXISTS "AutoSpace".broadcast_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    campaign_id uuid NOT NULL REFERENCES "AutoSpace".broadcast_campaigns(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    phone_number text NOT NULL,
    customer_name text,
    recipient_name text,
    status text DEFAULT 'pending'::text NOT NULL CONSTRAINT broadcast_queue_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sending'::text, 'sent'::text, 'failed'::text]))),
    error_message text,
    retry_count integer DEFAULT 0 NOT NULL,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "AutoSpace".broadcast_queue OWNER TO postgres;

CREATE INDEX IF NOT EXISTS idx_autospace_broadcast_campaigns_user_id ON "AutoSpace".broadcast_campaigns USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_autospace_broadcast_queue_campaign_id ON "AutoSpace".broadcast_queue USING btree (campaign_id);
CREATE INDEX IF NOT EXISTS idx_autospace_broadcast_queue_status ON "AutoSpace".broadcast_queue USING btree (status);
CREATE INDEX IF NOT EXISTS idx_autospace_broadcast_queue_user_id ON "AutoSpace".broadcast_queue USING btree (user_id);

ALTER TABLE "AutoSpace".broadcast_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AutoSpace".broadcast_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own broadcast campaigns" ON "AutoSpace".broadcast_campaigns;
CREATE POLICY "Users can manage own broadcast campaigns" ON "AutoSpace".broadcast_campaigns
    FOR ALL USING (auth.uid() = user_id OR "AutoSpace".has_role(auth.uid(), 'super_admin'::"AutoSpace".app_role) OR "AutoSpace".is_staff_of(auth.uid(), user_id))
    WITH CHECK (auth.uid() = user_id OR "AutoSpace".has_role(auth.uid(), 'super_admin'::"AutoSpace".app_role) OR "AutoSpace".is_staff_of(auth.uid(), user_id));

DROP POLICY IF EXISTS "Users can manage own broadcast queue" ON "AutoSpace".broadcast_queue;
CREATE POLICY "Users can manage own broadcast queue" ON "AutoSpace".broadcast_queue
    FOR ALL USING (auth.uid() = user_id OR "AutoSpace".has_role(auth.uid(), 'super_admin'::"AutoSpace".app_role) OR "AutoSpace".is_staff_of(auth.uid(), user_id))
    WITH CHECK (auth.uid() = user_id OR "AutoSpace".has_role(auth.uid(), 'super_admin'::"AutoSpace".app_role) OR "AutoSpace".is_staff_of(auth.uid(), user_id));

-- ============================================================================
-- Dedicated Auth Triggers for AutoSpace
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created_AutoSpace ON auth.users;
CREATE TRIGGER on_auth_user_created_AutoSpace
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION "AutoSpace".handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_role_AutoSpace ON auth.users;
CREATE TRIGGER on_auth_user_created_role_AutoSpace
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION "AutoSpace".handle_new_user_role();

DROP TRIGGER IF EXISTS on_auth_user_created_settings_AutoSpace ON auth.users;
CREATE TRIGGER on_auth_user_created_settings_AutoSpace
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION "AutoSpace".handle_new_user_settings();

-- ============================================================================
-- Schema Grants & Default Privileges
-- ============================================================================

GRANT USAGE, CREATE ON SCHEMA "AutoSpace" TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL TABLES IN SCHEMA "AutoSpace" TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA "AutoSpace" TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA "AutoSpace" TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA "AutoSpace" TO anon, authenticated, service_role, postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA "AutoSpace" GRANT ALL ON TABLES TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA "AutoSpace" GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA "AutoSpace" GRANT ALL ON SEQUENCES TO anon, authenticated, service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA "AutoSpace" GRANT ALL ON ROUTINES TO anon, authenticated, service_role, postgres;

-- ============================================================================
-- Realtime Publication
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'AutoSpace' 
      AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "AutoSpace".conversations;
  END IF;
END $$;
ALTER TABLE "AutoSpace".conversations REPLICA IDENTITY FULL;

-- ============================================================================
-- Platform Settings Seed
-- ============================================================================

INSERT INTO "AutoSpace".platform_settings (key, value)
VALUES (
  'plan_limits',
  '{
    "free":       {"max_products": 5,   "max_faqs": 10,  "max_orders_per_month": 50,   "contacts_per_month": 50,   "ai_messages_per_month": 100,   "max_images_per_product": 1,  "max_staff": 0},
    "pro":        {"max_products": 50,  "max_faqs": 100, "max_orders_per_month": 500,  "contacts_per_month": 300,  "ai_messages_per_month": 2000,  "max_images_per_product": 5,  "max_staff": 0},
    "enterprise": {"max_products": 999, "max_faqs": 999, "max_orders_per_month": 9999, "contacts_per_month": 1500, "ai_messages_per_month": 99999, "max_images_per_product": 10, "max_staff": 2}
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================================
-- Super Admin Account (Isolated Credentials)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  enc_pw text := crypt('kftjgVqo71tkLP', gen_salt('bf'));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin-autospace@buildstart.io') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
      recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 
      'superadmin-autospace@buildstart.io', enc_pw, now(), now(), now(), 
      '{"provider":"email","providers":["email"]}', '{"full_name":"AutoSpace Super Admin"}', 
      now(), now(), '', '', '', ''
    );
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'superadmin-autospace@buildstart.io';
    UPDATE auth.users SET encrypted_password = enc_pw WHERE id = new_user_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = new_user_id AND provider = 'email') THEN
    INSERT INTO auth.identities (
      id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      new_user_id::text,
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', 'superadmin-autospace@buildstart.io', 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  INSERT INTO "AutoSpace".profiles (id, user_id, email, full_name, plan_tier, billing_cycle_start, is_active)
  VALUES (gen_random_uuid(), new_user_id, 'superadmin-autospace@buildstart.io', 'AutoSpace Super Admin', 'enterprise', now(), true)
  ON CONFLICT (user_id) DO UPDATE SET 
    full_name = EXCLUDED.full_name,
    plan_tier = EXCLUDED.plan_tier,
    is_active = true;

  INSERT INTO "AutoSpace".user_roles (user_id, role)
  VALUES (new_user_id, 'super_admin'::"AutoSpace".app_role)
  ON CONFLICT (user_id, role) DO UPDATE SET role = 'super_admin'::"AutoSpace".app_role;
  UPDATE "AutoSpace".user_roles SET role = 'super_admin'::"AutoSpace".app_role WHERE user_id = new_user_id;

  INSERT INTO "AutoSpace".staff_accounts (
    owner_id, staff_user_id, is_active, staff_email, staff_name
  ) VALUES (
    new_user_id, new_user_id, true, 'superadmin-autospace@buildstart.io', 'AutoSpace Super Admin'
  ) ON CONFLICT DO NOTHING;

  INSERT INTO "AutoSpace".settings (user_id, key, value) VALUES
    (new_user_id, 'welcome_message', '{"text": "Welcome to AutoSpace!"}'::jsonb),
    (new_user_id, 'payment_info',    '{"accounts": []}'::jsonb),
    (new_user_id, 'auto_responses',  '{"enabled": true}'::jsonb)
  ON CONFLICT (user_id, key) DO NOTHING;
END;
$$;

-- ============================================================================
-- Cron Jobs
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'drain-message-queue-AutoSpace') THEN
    PERFORM cron.unschedule('drain-message-queue-AutoSpace');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'send-followups-AutoSpace') THEN
    PERFORM cron.unschedule('send-followups-AutoSpace');
  END IF;
END $$;

SELECT cron.schedule(
  'drain-message-queue-AutoSpace',
  '* * * * *',
  $$
  SELECT net.http_post(
    url     := 'http://api-gw:8000/functions/v1/process-message-AutoSpace_Customization',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODY0NDc4NjYsImV4cCI6MjEwMTgwNzg2Nn0.X3SLU9ShCNBzlwY91D1CVoHsLHOfYOv6R6eJ8UpkhsQ"}'::jsonb,
    body    := '{"trigger":"cron"}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'send-followups-AutoSpace',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url     := 'http://api-gw:8000/functions/v1/send-followups-AutoSpace_Customization',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODY0NDc4NjYsImV4cCI6MjEwMTgwNzg2Nn0.X3SLU9ShCNBzlwY91D1CVoHsLHOfYOv6R6eJ8UpkhsQ"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);
"""

with open("buildstart-selfhosted/db/01_autospace_remote_deploy.sql", "w") as f:
    f.writelines(filtered_lines)
    f.write(extra_sql)

print("Generated buildstart-selfhosted/db/01_autospace_remote_deploy.sql successfully.")
