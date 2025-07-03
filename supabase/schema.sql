-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sleeper_user_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  avatar VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Draft history table
CREATE TABLE IF NOT EXISTS draft_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  draft_id VARCHAR(255) NOT NULL,
  league_id VARCHAR(255) NOT NULL,
  draft_position INTEGER NOT NULL,
  final_roster JSONB NOT NULL,
  ai_recommendations JSONB NOT NULL,
  performance_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, draft_id)
);

-- Analysis cache table
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id VARCHAR(255) NOT NULL,
  draft_context JSONB NOT NULL,
  agent_results JSONB NOT NULL,
  master_recommendation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Draft sessions table (for active drafts)
CREATE TABLE IF NOT EXISTS draft_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  draft_id VARCHAR(255) NOT NULL,
  league_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  draft_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, draft_id)
);

-- Indexes for performance
CREATE INDEX idx_users_sleeper_id ON users(sleeper_user_id);
CREATE INDEX idx_draft_history_user_draft ON draft_history(user_id, draft_id);
CREATE INDEX idx_analysis_cache_player ON analysis_cache(player_id);
CREATE INDEX idx_analysis_cache_expires ON analysis_cache(expires_at);
CREATE INDEX idx_draft_sessions_status ON draft_sessions(status);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_draft_sessions_updated_at BEFORE UPDATE ON draft_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own draft history" ON draft_history
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own draft history" ON draft_history
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own draft sessions" ON draft_sessions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own draft sessions" ON draft_sessions
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Analysis cache is public read (but expires)
CREATE POLICY "Anyone can read analysis cache" ON analysis_cache
  FOR SELECT USING (expires_at > NOW());

CREATE POLICY "System can insert analysis cache" ON analysis_cache
  FOR INSERT WITH CHECK (true);