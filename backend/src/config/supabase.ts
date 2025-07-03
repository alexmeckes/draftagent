import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Public client for general operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client for admin operations (use carefully)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Database types (to be generated from Supabase)
export interface User {
  id: string;
  sleeper_user_id: string;
  username: string;
  display_name?: string;
  avatar?: string;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DraftHistory {
  id: string;
  user_id: string;
  draft_id: string;
  league_id: string;
  draft_position: number;
  final_roster: Record<string, any>;
  ai_recommendations: Record<string, any>;
  performance_metrics?: Record<string, any>;
  created_at: string;
}

export interface AnalysisCache {
  id: string;
  player_id: string;
  draft_context: Record<string, any>;
  agent_results: Record<string, any>;
  master_recommendation: string;
  created_at: string;
  expires_at: string;
}