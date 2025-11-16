/*
  # Neuma VARK Platform Database Schema

  ## Overview
  Complete database structure for the Neuma VARK learning style platform supporting students and teachers.

  ## New Tables
  
  ### 1. users
  - id (uuid, primary key, from auth.users)
  - email (text, unique)
  - full_name (text)
  - user_type (text: 'student' or 'teacher')
  - created_at (timestamp)
  
  ### 2. vark_results
  - id (uuid, primary key)
  - user_id (uuid, references users)
  - visual_score (integer)
  - auditory_score (integer)
  - kinesthetic_score (integer)
  - reading_score (integer)
  - dominant_style (text)
  - completed_at (timestamp)
  
  ### 3. classrooms
  - id (uuid, primary key)
  - teacher_id (uuid, references users)
  - name (text)
  - code (text, unique, 6-char code)
  - created_at (timestamp)
  
  ### 4. classroom_members
  - id (uuid, primary key)
  - classroom_id (uuid, references classrooms)
  - student_id (uuid, references users)
  - joined_at (timestamp)
  
  ### 5. activities
  - id (uuid, primary key)
  - classroom_id (uuid, references classrooms)
  - teacher_id (uuid, references users)
  - learning_style (text)
  - title (text)
  - description (text)
  - file_url (text)
  - created_at (timestamp)

  ## Security
  - Enable RLS on all tables
  - Policies for authenticated users to manage their own data
  - Teachers can manage their classrooms and activities
  - Students can view activities in their classrooms
*/

-- Create users profile table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('student', 'teacher')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create vark_results table
CREATE TABLE IF NOT EXISTS vark_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visual_score integer NOT NULL DEFAULT 0,
  auditory_score integer NOT NULL DEFAULT 0,
  kinesthetic_score integer NOT NULL DEFAULT 0,
  reading_score integer NOT NULL DEFAULT 0,
  dominant_style text NOT NULL,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE vark_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own results"
  ON vark_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON vark_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own classrooms"
  ON classrooms FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Create classroom_members table
CREATE TABLE IF NOT EXISTS classroom_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view classroom members"
  ON classroom_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classrooms
      WHERE classrooms.id = classroom_members.classroom_id
      AND classrooms.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own memberships"
  ON classroom_members FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can join classrooms"
  ON classroom_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Add policy for students to view classrooms they joined
CREATE POLICY "Students can view joined classrooms"
  ON classrooms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classroom_members
      WHERE classroom_members.classroom_id = classrooms.id
      AND classroom_members.student_id = auth.uid()
    )
  );

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learning_style text NOT NULL CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
  title text NOT NULL,
  description text DEFAULT '',
  file_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own activities"
  ON activities FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Students can view classroom activities"
  ON activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classroom_members
      WHERE classroom_members.classroom_id = activities.classroom_id
      AND classroom_members.student_id = auth.uid()
    )
  );

-- Create function to generate classroom code
CREATE OR REPLACE FUNCTION generate_classroom_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;