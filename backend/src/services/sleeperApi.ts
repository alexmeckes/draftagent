import axios, { AxiosInstance } from 'axios';
import { 
  SleeperUser, 
  SleeperLeague, 
  SleeperDraft, 
  SleeperPick, 
  SleeperPlayer,
  SleeperRoster 
} from '../types/sleeper';

export class SleeperApiService {
  private api: AxiosInstance;
  private playersCache: Map<string, SleeperPlayer> = new Map();
  private playersCacheTime = 0;
  private CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.api = axios.create({
      baseURL: process.env.SLEEPER_API_BASE_URL || 'https://api.sleeper.app/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request/response logging in development
    if (process.env.NODE_ENV === 'development') {
      this.api.interceptors.request.use(request => {
        console.log('Sleeper API Request:', request.method?.toUpperCase(), request.url);
        return request;
      });

      this.api.interceptors.response.use(
        response => {
          console.log('Sleeper API Response:', response.status, response.config.url);
          return response;
        },
        error => {
          console.error('Sleeper API Error:', error.response?.status, error.config?.url);
          return Promise.reject(error);
        }
      );
    }
  }

  // User endpoints
  async getUser(username: string): Promise<SleeperUser> {
    const { data } = await this.api.get<SleeperUser>(`/user/${username}`);
    return data;
  }

  async getUserById(userId: string): Promise<SleeperUser> {
    const { data } = await this.api.get<SleeperUser>(`/user/${userId}`);
    return data;
  }

  // League endpoints
  async getUserLeagues(userId: string, sport: string, season: string): Promise<SleeperLeague[]> {
    const { data } = await this.api.get<SleeperLeague[]>(
      `/user/${userId}/leagues/${sport}/${season}`
    );
    return data;
  }

  async getLeague(leagueId: string): Promise<SleeperLeague> {
    const { data } = await this.api.get<SleeperLeague>(`/league/${leagueId}`);
    return data;
  }

  async getLeagueRosters(leagueId: string): Promise<SleeperRoster[]> {
    const { data } = await this.api.get<SleeperRoster[]>(`/league/${leagueId}/rosters`);
    return data;
  }

  async getLeagueUsers(leagueId: string): Promise<SleeperUser[]> {
    const { data } = await this.api.get<SleeperUser[]>(`/league/${leagueId}/users`);
    return data;
  }

  // Draft endpoints
  async getUserDrafts(userId: string, sport: string, season: string): Promise<SleeperDraft[]> {
    const { data } = await this.api.get<SleeperDraft[]>(
      `/user/${userId}/drafts/${sport}/${season}`
    );
    return data;
  }

  async getLeagueDrafts(leagueId: string): Promise<SleeperDraft[]> {
    const { data } = await this.api.get<SleeperDraft[]>(`/league/${leagueId}/drafts`);
    return data;
  }

  async getDraft(draftId: string): Promise<SleeperDraft> {
    const { data } = await this.api.get<SleeperDraft>(`/draft/${draftId}`);
    return data;
  }

  async getDraftPicks(draftId: string): Promise<SleeperPick[]> {
    const { data } = await this.api.get<SleeperPick[]>(`/draft/${draftId}/picks`);
    return data;
  }

  // Player endpoints
  async getAllPlayers(sport: string = 'nfl'): Promise<Map<string, SleeperPlayer>> {
    // Check cache
    const now = Date.now();
    if (this.playersCache.size > 0 && now - this.playersCacheTime < this.CACHE_DURATION) {
      return this.playersCache;
    }

    const { data } = await this.api.get<Record<string, SleeperPlayer>>(`/players/${sport}`);
    
    // Convert to Map and cache
    this.playersCache.clear();
    Object.entries(data).forEach(([id, player]) => {
      this.playersCache.set(id, player);
    });
    this.playersCacheTime = now;

    return this.playersCache;
  }

  async getPlayer(playerId: string, sport: string = 'nfl'): Promise<SleeperPlayer | undefined> {
    const players = await this.getAllPlayers(sport);
    return players.get(playerId);
  }

  async getTrendingPlayers(sport: string = 'nfl', type: 'add' | 'drop' = 'add'): Promise<Array<{player_id: string; count: number}>> {
    const { data } = await this.api.get<Array<{player_id: string; count: number}>>(
      `/players/${sport}/trending/${type}`
    );
    return data;
  }

  // Helper methods
  async getActiveDraftsForUser(userId: string): Promise<SleeperDraft[]> {
    const currentYear = new Date().getFullYear().toString();
    const drafts = await this.getUserDrafts(userId, 'nfl', currentYear);
    
    // Log all drafts to see what statuses exist
    console.log('All user drafts:', drafts.map(d => ({ 
      draft_id: d.draft_id, 
      status: d.status, 
      type: d.type,
      sport: d.sport 
    })));
    
    return drafts.filter(draft => 
      draft.status === 'drafting' || 
      draft.status === 'paused' || 
      draft.status === 'pre_draft'
    );
  }

  async getDraftWithPicks(draftId: string): Promise<{
    draft: SleeperDraft;
    picks: SleeperPick[];
  }> {
    const [draft, picks] = await Promise.all([
      this.getDraft(draftId),
      this.getDraftPicks(draftId)
    ]);

    return { draft, picks };
  }

  async getUserTeamInDraft(draftId: string, userId: string): Promise<{
    rosterId: string | null;
    draftSlot: number | null;
    picks: SleeperPick[];
  }> {
    const [draft, allPicks] = await Promise.all([
      this.getDraft(draftId),
      this.getDraftPicks(draftId)
    ]);

    // Find user's roster ID
    let userRosterId: string | null = null;
    let userDraftSlot: number | null = null;

    for (const [rosterId, ownerId] of Object.entries(draft.slot_to_roster_id || {})) {
      if (ownerId === userId) {
        userRosterId = rosterId;
        userDraftSlot = draft.draft_order[rosterId] || null;
        break;
      }
    }

    const userPicks = userRosterId 
      ? allPicks.filter(pick => pick.roster_id === userRosterId)
      : [];

    return {
      rosterId: userRosterId,
      draftSlot: userDraftSlot,
      picks: userPicks
    };
  }
}

// Export singleton instance
export const sleeperApi = new SleeperApiService();