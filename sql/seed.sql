-- Seed data for a fresh The Social Circle database.
--
-- The password_hash values are SHA-256(`sc:` || plaintext), matching the
-- hashing used in src/lib/db.ts. If you move to a real password-hashing
-- scheme (bcrypt/argon2) you'll need to re-hash and update these rows.

-- Admin account. Log in with username `admin` or `admin@socialcircle.al`.
-- Password: Admin2016
INSERT INTO users (user_id, email, password_hash, age_range, created_at) VALUES
  ('USR-ADMIN',
   'admin@socialcircle.al',
   'f34fa0e07848b4a33ef8e1649cc12ee8a28b007820fe7fcfe35ae4ac36441d5b',
   '25-30',
   '2026-01-01T00:00:00.000Z');

-- Two sample members so the admin spreadsheet has data to inspect.
-- Passwords: `password123` and `mypassword2026`.
INSERT INTO users (user_id, email, password_hash, age_range, created_at) VALUES
  ('USR-1001',
   'ardi.b@example.al',
   '753067b178a70faf2c34e78885b0ccfb1a06ebe52e2e180e7378bd08f3fc0307',
   '18-24',
   '2026-08-01T10:00:00.000Z'),
  ('USR-1002',
   'elena.k@example.al',
   '1ef68e9e7b634e4060bac11b5a9be6bc8463c0d065ab65e162f3c3460a15b575',
   '25-30',
   '2026-08-05T10:00:00.000Z');

-- Venues shown in the booking grid. Mirror of destinations in public/app.js.
INSERT INTO venues (id, name, image, description, location_url, min_age, max_age, active_count, total_bookings, has_locations_dropdown) VALUES
  ('mulliri',           'Mulliri',           'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
                        'Popular coffee hub in Tirana, perfect for remote working, fresh pastries, and social meetups.',
                        'https://maps.google.com/?q=Mulliri+Tirane+Albania', 16, 60, 22, 310, 1),
  ('moncherie',         'Moncherie',         'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80',
                        'Cozy, vibrant espresso bar franchise loved by students and young professionals across Tirana.',
                        'https://maps.google.com/?q=MonCherie+Tirane+Albania', 18, 35, 18, 245, 1),
  ('sophie',            'Sophie',            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
                        'Charming lounge bar and caffe offer sweet treats and vibrant social atmospheres.',
                        'https://maps.google.com/?q=Sophie+Caffe+Tirane+Albania', 18, 45, 15, 189, 1),
  ('le-cheateau',       'Le Chateau',        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
                        'Elegant lounge environment featuring fine drinks, signature cocktails, and relaxed vibes.',
                        'https://maps.google.com/?q=Le+Chateau+Tirane+Albania', 21, 65, 27, 412, 0),
  ('millenium-garden',  'Millenium Garden',  'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2f/3f/36/d5/caption.jpg?w=900&h=-1&s=1',
                        'Spacious outdoor terrace garden bar along Pedonalja, ideal for large gatherings.',
                        'https://maps.google.com/?q=Millennium+Garden+Tirane+Albania', 18, 70, 34, 520, 0),
  ('my-way',            'My Way - Liqeni Artificial Tirane',
                        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
                        'Scenic bar right by Tirana Artificial Lake, offering panoramic water views and great cocktails.',
                        'https://maps.google.com/?q=My+Way+Liqeni+Artificial+Tirane+Albania', 20, 50, 31, 380, 0),
  ('komiteti',          'Komiteti',          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
                        'Famous Kafe-Muzeum known for vintage Albanian culture, traditional raki, and artistic community.',
                        'https://maps.google.com/?q=Komiteti+Kafe+Muzeum+Tirane+Albania', 21, 55, 25, 298, 0);

-- Specific bar locations shown in venue dropdowns.
INSERT INTO bar_locations (slug) VALUES
  ('bllok'), ('drejtoria e policise'), ('sheshi wilson'), ('blv bajram curri'),
  ('rruga jan kukuzeli'), ('rruga sami frasheri'), ('rruga medar shtylla'),
  ('zogu i zi'), ('rruga muhamet gjollesha'), ('rruga e kavajes'), ('toptani'),
  ('rruga e elbasanit'), ('rruga e durresit'), ('rruga e barikadave'),
  ('don bosco'), ('ali demi'), ('rruga hoxha tasim'), ('kombinat');

-- Sample bookings for the admin dashboard.
INSERT INTO bookings (id, user_id, venue_id, place, booking_date, booking_time, created_at) VALUES
  ('BK-sample-1', 'USR-1001', 'mulliri',   'Mulliri (bllok)',             '2026-08-29', '20:00', '2026-08-28T18:00:00.000Z'),
  ('BK-sample-2', 'USR-1002', 'moncherie', 'Moncherie (sheshi wilson)',   '2026-08-30', '21:30', '2026-08-29T15:00:00.000Z');

-- Sample report so the reports spreadsheet isn't empty on first open.
INSERT INTO reports (id, reporter_user_id, reporter_email, reported_user, reason, description, created_at) VALUES
  ('REP-5001',
   'USR-1001',
   'ardi.b@example.al',
   'USR-1002',
   'Inappropriate Behavior',
   'User was posting spam content in chat.',
   '2026-08-28T14:20:00.000Z');
