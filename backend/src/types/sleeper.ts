// Sleeper API Types

export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  metadata?: Record<string, any>;
  is_bot?: boolean;
}

export interface SleeperLeague {
  league_id: string;
  name: string;
  status: 'pre_draft' | 'drafting' | 'in_season' | 'complete';
  sport: string;
  season: string;
  season_type: string;
  total_rosters: number;
  roster_positions: string[];
  scoring_settings: Record<string, number>;
  settings: Record<string, any>;
  draft_id: string;
}

export interface SleeperDraft {
  draft_id: string;
  type: 'snake' | 'linear' | 'auction';
  status: 'pre_draft' | 'drafting' | 'paused' | 'complete';
  sport: string;
  season: string;
  season_type: string;
  settings: {
    teams: number;
    slots_wr: number;
    slots_rb: number;
    slots_qb: number;
    slots_te: number;
    slots_flex: number;
    slots_bn: number;
    slots_def: number;
    rounds: number;
    pick_timer: number;
  };
  start_time: number;
  draft_order: Record<string, number>;
  slot_to_roster_id: Record<string, string>;
  metadata: Record<string, any>;
}

export interface SleeperPick {
  round: number;
  roster_id: string;
  player_id: string;
  picked_by: string;
  pick_no: number;
  metadata: {
    team?: string;
    status?: string;
    position?: string;
    first_name?: string;
    last_name?: string;
  };
  is_keeper?: boolean;
  draft_slot: number;
  draft_id: string;
}

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  team: string;
  position: string;
  age: number;
  years_exp: number;
  status: 'Active' | 'Inactive' | 'Injured Reserve';
  injury_status?: string;
  injury_body_part?: string;
  search_full_name: string;
  search_rank: number;
  fantasy_positions?: string[];
}

export interface SleeperRoster {
  roster_id: string;
  owner_id: string;
  league_id: string;
  players: string[];
  starters: string[];
  reserve?: string[];
  taxi?: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
  };
}