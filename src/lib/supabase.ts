import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Ship {
  id: string;
  name: string;
  image_url: string;
  description: string;
}

export interface Token {
  id: string;
  user_id: string;
  token: string;
  is_active: boolean;
}

export interface RaceSession {
  id: string;
  status: 'waiting' | 'in_progress' | 'completed';
  started_by: string | null;
  started_at: string | null;
  race_text: string | null;
  created_at: string;
}

export interface RaceParticipant {
  id: string;
  race_session_id: string;
  user_email: string;
  user_id: string;
  ship_id: string;
  lane_number: number;
  progress: number;
  wpm: number;
  accuracy: number;
  finished_at: string | null;
  position: number | null;
}

export interface Admin {
  id: string;
  email: string;
  created_at: string;
}
