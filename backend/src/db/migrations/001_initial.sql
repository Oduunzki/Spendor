CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  current_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE
);

CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT,
  store_name TEXT,
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'NOK',
  receipt_date DATE,
  was_planned BOOLEAN,
  raw_ai_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
  description TEXT,
  amount DECIMAL(10,2),
  category TEXT,
  quantity INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS resisted_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  estimated_amount DECIMAL(10,2) NOT NULL,
  category TEXT,
  reason TEXT,
  xp_earned INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waiting_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  estimated_amount DECIMAL(10,2),
  category TEXT,
  reason_wanted TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  wait_until TIMESTAMPTZ NOT NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  outcome TEXT CHECK (outcome IN ('bought', 'skipped', 'still_waiting')),
  decided_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS daily_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  is_no_spend_day BOOLEAN DEFAULT FALSE,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_resisted DECIMAL(10,2) DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT,
  is_default BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_type TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

INSERT INTO categories (name, icon) VALUES
  ('Mat', '🛒'),
  ('Kaffe', '☕'),
  ('Elektronikk', '💻'),
  ('Klær', '👕'),
  ('Hobby', '🎯'),
  ('Restaurant', '🍽'),
  ('Transport', '🚇'),
  ('Abonnement', '📱'),
  ('Helse', '💊'),
  ('Annet', '📦')
ON CONFLICT DO NOTHING;
