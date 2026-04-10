-- ─── Enable UUID extension ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  fcm_token     TEXT,                          -- Firebase Cloud Messaging device token
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Refresh Tokens ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token   ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- ─── Medicines ────────────────────────────────────────────────────────────────
CREATE TYPE medicine_form      AS ENUM ('tablet','capsule','syrup','injection','drops','other');
CREATE TYPE medicine_frequency AS ENUM ('once_daily','twice_daily','thrice_daily','as_needed');

CREATE TABLE IF NOT EXISTS medicines (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  dosage     VARCHAR(50)  NOT NULL,
  form       medicine_form      NOT NULL DEFAULT 'tablet',
  frequency  medicine_frequency NOT NULL DEFAULT 'once_daily',
  times      TEXT[]       NOT NULL DEFAULT '{}',   -- e.g. {"08:00","20:00"}
  start_date DATE         NOT NULL,
  end_date   DATE,
  notes      TEXT,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);

-- ─── Reminders ────────────────────────────────────────────────────────────────
CREATE TYPE reminder_status AS ENUM ('pending','taken','missed','snoozed');

CREATE TABLE IF NOT EXISTS reminders (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medicine_id   UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        reminder_status NOT NULL DEFAULT 'pending',
  snoozed_until TIMESTAMPTZ,
  taken_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminders_user_id      ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_medicine_id  ON reminders(medicine_id);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_at ON reminders(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_reminders_status       ON reminders(status);

-- ─── Vitals ───────────────────────────────────────────────────────────────────
CREATE TYPE vital_type AS ENUM ('blood_pressure','blood_sugar','weight');

CREATE TABLE IF NOT EXISTS vitals (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       vital_type  NOT NULL,
  value      NUMERIC(7,2),                 -- for blood_sugar and weight
  systolic   SMALLINT,                     -- for blood_pressure
  diastolic  SMALLINT,                     -- for blood_pressure
  unit       VARCHAR(20) NOT NULL,
  notes      TEXT,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitals_user_id   ON vitals(user_id);
CREATE INDEX IF NOT EXISTS idx_vitals_type      ON vitals(type);
CREATE INDEX IF NOT EXISTS idx_vitals_logged_at ON vitals(logged_at);

-- ─── Doctor Share Tokens ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS share_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_tokens_token ON share_tokens(token);

-- ─── Updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER medicines_updated_at
  BEFORE UPDATE ON medicines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
