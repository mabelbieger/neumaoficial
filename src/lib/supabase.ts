import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserType = 'student' | 'teacher';

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_type: UserType;
  created_at: string;
}

export interface VarkResult {
  id: string;
  user_id: string;
  visual_score: number;
  auditory_score: number;
  kinesthetic_score: number;
  reading_score: number;
  dominant_style: string;
  completed_at: string;
}

export interface Classroom {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Activity {
  id: string;
  classroom_id: string;
  teacher_id: string;
  learning_style: string;
  title: string;
  description: string;
  file_url: string | null;
  created_at: string;
}