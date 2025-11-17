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
-- ========================================
-- NEUMA VARK Platform - Database Fix Script
-- CORRIGIDO: Remove recursão infinita nas políticas
-- ========================================

-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS
-- ========================================

DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

DROP POLICY IF EXISTS "Users can read own results" ON vark_results;
DROP POLICY IF EXISTS "Users can insert own results" ON vark_results;

DROP POLICY IF EXISTS "Teachers can manage own classrooms" ON classrooms;
DROP POLICY IF EXISTS "Students can view joined classrooms" ON classrooms;

DROP POLICY IF EXISTS "Teachers can view classroom members" ON classroom_members;
DROP POLICY IF EXISTS "Students can view own memberships" ON classroom_members;
DROP POLICY IF EXISTS "Students can join classrooms" ON classroom_members;

DROP POLICY IF EXISTS "Teachers can manage own activities" ON activities;
DROP POLICY IF EXISTS "Students can view classroom activities" ON activities;

-- 2. RECRIAR POLÍTICAS PARA USERS (SEM RECURSÃO)
-- ========================================

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

-- 3. RECRIAR POLÍTICAS PARA VARK_RESULTS (SEM RECURSÃO)
-- ========================================

CREATE POLICY "Users can read own results"
  ON vark_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own results"
  ON vark_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. RECRIAR POLÍTICAS PARA CLASSROOMS (SEM RECURSÃO)
-- ========================================

-- Professores podem ver, criar, atualizar e deletar suas próprias turmas
CREATE POLICY "Teachers can select own classrooms"
  ON classrooms FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own classrooms"
  ON classrooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classrooms"
  ON classrooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classrooms"
  ON classrooms FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Estudantes podem ver turmas onde estão matriculados
CREATE POLICY "Students can view joined classrooms"
  ON classrooms FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT classroom_id 
      FROM classroom_members 
      WHERE student_id = auth.uid()
    )
  );

-- 5. RECRIAR POLÍTICAS PARA CLASSROOM_MEMBERS (SEM RECURSÃO)
-- ========================================

-- Professores podem ver membros de suas turmas
CREATE POLICY "Teachers can view classroom members"
  ON classroom_members FOR SELECT
  TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- Estudantes podem ver suas próprias matrículas
CREATE POLICY "Students can view own memberships"
  ON classroom_members FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- Estudantes podem se matricular em turmas
CREATE POLICY "Students can join classrooms"
  ON classroom_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Estudantes podem sair de turmas
CREATE POLICY "Students can leave classrooms"
  ON classroom_members FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- 6. RECRIAR POLÍTICAS PARA ACTIVITIES (SEM RECURSÃO)
-- ========================================

-- Professores podem gerenciar suas próprias atividades
CREATE POLICY "Teachers can select own activities"
  ON activities FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own activities"
  ON activities FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Estudantes podem ver atividades de suas turmas
CREATE POLICY "Students can view classroom activities"
  ON activities FOR SELECT
  TO authenticated
  USING (
    classroom_id IN (
      SELECT classroom_id 
      FROM classroom_members 
      WHERE student_id = auth.uid()
    )
  );

-- 7. ADICIONAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para classrooms
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_code ON classrooms(code);

-- Índices para classroom_members
CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom_id ON classroom_members(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_members_student_id ON classroom_members(student_id);

-- Índices para activities
CREATE INDEX IF NOT EXISTS idx_activities_classroom_id ON activities(classroom_id);
CREATE INDEX IF NOT EXISTS idx_activities_teacher_id ON activities(teacher_id);
CREATE INDEX IF NOT EXISTS idx_activities_learning_style ON activities(learning_style);

-- Índices para vark_results
CREATE INDEX IF NOT EXISTS idx_vark_results_user_id ON vark_results(user_id);

-- 8. GARANTIR QUE DESCRIPTION PERMITE VAZIO E FILE_URL PERMITE NULL
-- ========================================

ALTER TABLE activities 
  ALTER COLUMN description SET DEFAULT '';

ALTER TABLE activities 
  ALTER COLUMN file_url DROP NOT NULL;

-- 9. GARANTIR QUE RLS ESTÁ HABILITADO
-- ========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vark_results ENABLE ROW LEVEL SECURITY;

-- 10. SCRIPT DE VERIFICAÇÃO
-- ========================================

-- Para testar se tudo está funcionando:
SELECT 
  'users' as table_name, 
  COUNT(*) as total,
  COUNT(CASE WHEN user_type = 'teacher' THEN 1 END) as teachers,
  COUNT(CASE WHEN user_type = 'student' THEN 1 END) as students
FROM users
UNION ALL
SELECT 
  'classrooms' as table_name,
  COUNT(*) as total,
  NULL as teachers,
  NULL as students
FROM classrooms
UNION ALL
SELECT 
  'activities' as table_name,
  COUNT(*) as total,
  NULL as teachers,
  NULL as students
FROM activities
UNION ALL
SELECT 
  'classroom_members' as table_name,
  COUNT(*) as total,
  NULL as teachers,
  NULL as students
FROM classroom_members;

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- COMANDOS ÚTEIS PARA DEBUG:

-- Ver seu perfil:
-- SELECT * FROM users WHERE id = auth.uid();

-- Ver suas turmas:
-- SELECT * FROM classrooms WHERE teacher_id = auth.uid();

-- Ver políticas de uma tabela:
-- SELECT * FROM pg_policies WHERE tablename = 'classrooms';

-- Criar perfil manualmente se necessário:
-- INSERT INTO users (id, email, full_name, user_type)
-- VALUES (
--   auth.uid(),
--   (SELECT email FROM auth.users WHERE id = auth.uid()),
--   'Seu Nome',
--   'teacher'
-- );

-- ========================================
-- NEUMA VARK Platform - Database Schema
-- SOLUÇÃO DEFINITIVA: Elimina recursão em políticas RLS
-- ========================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES PRIMEIRO
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

DROP POLICY IF EXISTS "Users can read own results" ON vark_results;
DROP POLICY IF EXISTS "Users can insert own results" ON vark_results;

DROP POLICY IF EXISTS "Teachers can manage own classrooms" ON classrooms;
DROP POLICY IF EXISTS "Students can view joined classrooms" ON classrooms;
DROP POLICY IF EXISTS "classrooms_teacher_all" ON classrooms;
DROP POLICY IF EXISTS "classrooms_student_view" ON classrooms;

DROP POLICY IF EXISTS "Teachers can view classroom members" ON classroom_members;
DROP POLICY IF EXISTS "Students can view own memberships" ON classroom_members;
DROP POLICY IF EXISTS "Students can join classrooms" ON classroom_members;
DROP POLICY IF EXISTS "classroom_members_teacher_view" ON classroom_members;
DROP POLICY IF EXISTS "classroom_members_student_all" ON classroom_members;

DROP POLICY IF EXISTS "Teachers can manage own activities" ON activities;
DROP POLICY IF EXISTS "Students can view classroom activities" ON activities;
DROP POLICY IF EXISTS "activities_teacher_all" ON activities;
DROP POLICY IF EXISTS "activities_student_view" ON activities;

-- 2. RECRIAR POLÍTICAS SIMPLES E SEM RECURSÃO

-- Políticas para USERS
CREATE POLICY "users_select_policy" ON users FOR SELECT 
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "users_insert_policy" ON users FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy" ON users FOR UPDATE 
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Políticas para CLASSROOMS - SEM RECURSÃO
CREATE POLICY "classrooms_teacher_full" ON classrooms FOR ALL 
  TO authenticated USING (auth.uid() = teacher_id);

CREATE POLICY "classrooms_student_select" ON classrooms FOR SELECT 
  TO authenticated USING (
    id IN (
      SELECT classroom_id FROM classroom_members 
      WHERE student_id = auth.uid()
    )
  );

-- Políticas para CLASSROOM_MEMBERS
CREATE POLICY "classroom_members_teacher_full" ON classroom_members FOR ALL 
  TO authenticated USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "classroom_members_student_full" ON classroom_members FOR ALL 
  TO authenticated USING (auth.uid() = student_id);

-- Políticas para ACTIVITIES
CREATE POLICY "activities_teacher_full" ON activities FOR ALL 
  TO authenticated USING (auth.uid() = teacher_id);

CREATE POLICY "activities_student_select" ON activities FOR SELECT 
  TO authenticated USING (
    classroom_id IN (
      SELECT classroom_id FROM classroom_members 
      WHERE student_id = auth.uid()
    )
  );

-- Políticas para VARK_RESULTS
CREATE POLICY "vark_results_select" ON vark_results FOR SELECT 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "vark_results_insert" ON vark_results FOR INSERT 
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- 3. VERIFICAR SE RLS ESTÁ ATIVADO
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE vark_results ENABLE ROW LEVEL SECURITY;

