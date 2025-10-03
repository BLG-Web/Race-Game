/*
  # Game Race Schema - One Piece Theme

  ## Overview
  Complete database schema for multiplayer typing race game with One Piece ship theme,
  token validation, admin controls, and real-time racing.

  ## Tables Created

  ### 1. admins
  Stores admin email addresses who can control races
  - `id` (uuid, primary key)
  - `email` (text, unique) - Admin email address
  - `created_at` (timestamptz) - When admin was added
  - `created_by` (text) - Who added this admin

  ### 2. tokens
  Stores valid tokens for users (synced from Google Sheet)
  - `id` (uuid, primary key)
  - `user_id` (text, unique) - User identifier (e.g., kotok123)
  - `token` (text, unique) - Access token for validation
  - `is_active` (boolean) - Whether token is currently valid
  - `created_at` (timestamptz) - Token creation time

  ### 3. ships
  Available One Piece ships that players can choose
  - `id` (uuid, primary key)
  - `name` (text, unique) - Ship name
  - `image_url` (text) - Ship image URL
  - `description` (text) - Ship description
  - `created_at` (timestamptz)

  ### 4. race_sessions
  Individual race sessions in the arena
  - `id` (uuid, primary key)
  - `status` (text) - waiting, in_progress, completed
  - `started_by` (text) - Admin email who started race
  - `started_at` (timestamptz) - Race start time
  - `completed_at` (timestamptz) - Race end time
  - `race_text` (text) - Text to type for this race
  - `created_at` (timestamptz)

  ### 5. race_participants
  Players participating in a race session
  - `id` (uuid, primary key)
  - `race_session_id` (uuid, foreign key) - References race_sessions
  - `user_email` (text) - Player email from Google auth
  - `user_id` (text) - Player's chosen user_id
  - `ship_id` (uuid, foreign key) - References ships
  - `lane_number` (integer) - Lane position (1-5)
  - `progress` (integer) - Typing progress percentage
  - `wpm` (integer) - Words per minute
  - `accuracy` (integer) - Typing accuracy percentage
  - `finished_at` (timestamptz) - When player finished
  - `position` (integer) - Final race position
  - `joined_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Authenticated users can read their own data
  - Only admins can modify critical data
  - Public read access for ships and active race sessions
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by text
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admins"
  ON admins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert new admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (
    email IN (SELECT email FROM admins)
  );

-- Create tokens table
CREATE TABLE IF NOT EXISTS tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  token text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read active tokens"
  ON tokens FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage tokens"
  ON tokens FOR ALL
  TO authenticated
  USING (
    (SELECT email FROM admins WHERE email = (SELECT auth.jwt()->>'email')) IS NOT NULL
  );

-- Create ships table
CREATE TABLE IF NOT EXISTS ships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  image_url text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ships"
  ON ships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage ships"
  ON ships FOR ALL
  TO authenticated
  USING (
    (SELECT email FROM admins WHERE email = (SELECT auth.jwt()->>'email')) IS NOT NULL
  );

-- Create race_sessions table
CREATE TABLE IF NOT EXISTS race_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed')),
  started_by text,
  started_at timestamptz,
  completed_at timestamptz,
  race_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE race_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read race sessions"
  ON race_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage race sessions"
  ON race_sessions FOR ALL
  TO authenticated
  USING (
    (SELECT email FROM admins WHERE email = (SELECT auth.jwt()->>'email')) IS NOT NULL
  );

-- Create race_participants table
CREATE TABLE IF NOT EXISTS race_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  race_session_id uuid REFERENCES race_sessions(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  user_id text NOT NULL,
  ship_id uuid REFERENCES ships(id),
  lane_number integer CHECK (lane_number BETWEEN 1 AND 5),
  progress integer DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  wpm integer DEFAULT 0,
  accuracy integer DEFAULT 100,
  finished_at timestamptz,
  position integer,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(race_session_id, lane_number)
);

ALTER TABLE race_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read race participants"
  ON race_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join races"
  ON race_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    user_email = (SELECT auth.jwt()->>'email')
  );

CREATE POLICY "Users can update their own progress"
  ON race_participants FOR UPDATE
  TO authenticated
  USING (
    user_email = (SELECT auth.jwt()->>'email')
  );

-- Insert default admin
INSERT INTO admins (email, created_by)
VALUES ('hokiantogautama.blg88@gmail.com', 'system')
ON CONFLICT (email) DO NOTHING;

-- Insert One Piece ships
INSERT INTO ships (name, image_url, description) VALUES
  ('Thousand Sunny', 'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg', 'Kapal Topi Jerami - Luffy'),
  ('Going Merry', 'https://images.pexels.com/photos/1117210/pexels-photo-1117210.jpeg', 'Kapal Pertama Topi Jerami'),
  ('Red Force', 'https://images.pexels.com/photos/2404949/pexels-photo-2404949.jpeg', 'Kapal Shanks'),
  ('Moby Dick', 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg', 'Kapal Whitebeard'),
  ('Oro Jackson', 'https://images.pexels.com/photos/1796521/pexels-photo-1796521.jpeg', 'Kapal Roger Pirates')
ON CONFLICT (name) DO NOTHING;
