-- The Social Circle — relational schema.
--
-- Mirrors the collections in src/lib/db.ts so the in-memory store can be
-- swapped for a SQL backend (SQLite / Cloudflare D1 / Postgres) one table at a
-- time. All text columns are UTF-8; timestamps are ISO-8601 strings so a
-- JS front-end can round-trip them without casting.

CREATE TABLE IF NOT EXISTS users (
  user_id        TEXT PRIMARY KEY,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  age_range      TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS bookings (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  venue_id    TEXT NOT NULL,
  place       TEXT NOT NULL,
  booking_date TEXT NOT NULL,
  booking_time TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue ON bookings (venue_id);

CREATE TABLE IF NOT EXISTS favorites (
  user_id   TEXT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  venue_id  TEXT NOT NULL,
  PRIMARY KEY (user_id, venue_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id          TEXT PRIMARY KEY,
  venue_id    TEXT NOT NULL,
  user_id     TEXT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  author      TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_venue ON reviews (venue_id);

CREATE TABLE IF NOT EXISTS chat_messages (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  author      TEXT NOT NULL,
  text        TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages (created_at);

CREATE TABLE IF NOT EXISTS direct_messages (
  id            TEXT PRIMARY KEY,
  from_user_id  TEXT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  to_user_id    TEXT NOT NULL,
  text          TEXT NOT NULL,
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dm_pair ON direct_messages (from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_dm_created ON direct_messages (created_at);

CREATE TABLE IF NOT EXISTS reports (
  id                 TEXT PRIMARY KEY,
  reporter_user_id   TEXT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  reporter_email     TEXT NOT NULL,
  reported_user      TEXT NOT NULL,
  reason             TEXT NOT NULL,
  description        TEXT NOT NULL,
  created_at         TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports (created_at);

CREATE TABLE IF NOT EXISTS activity (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity (user_id);

-- Reference data: the venues the UI books into. Kept in SQL so the client can
-- eventually stop shipping the static destinations array.
CREATE TABLE IF NOT EXISTS venues (
  id                     TEXT PRIMARY KEY,
  name                   TEXT NOT NULL,
  image                  TEXT NOT NULL,
  description            TEXT NOT NULL,
  location_url           TEXT NOT NULL,
  min_age                INTEGER NOT NULL,
  max_age                INTEGER NOT NULL,
  active_count           INTEGER NOT NULL DEFAULT 0,
  total_bookings         INTEGER NOT NULL DEFAULT 0,
  has_locations_dropdown INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bar_locations (
  slug TEXT PRIMARY KEY
);
