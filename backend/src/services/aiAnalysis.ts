import { MasterStrategist } from '../agents/masterStrategist';
import { AgentContext } from '../agents/baseAgent';
import { supabase, supabaseAdmin } from '../config/supabase';
import { sleeperApi } from './sleeperApi';
import crypto from 'crypto';

export class AIAnalysisService {
  private masterStrategist: MasterStrategist;

  constructor() {
    this.masterStrategist = new MasterStrategist();
  }

  async analyzePlayer(
    playerId: string,
    draftId: string,
    userId: string
  ): Promise<any> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(playerId, draftId, userId);
      const cachedAnalysis = await this.getCachedAnalysis(cacheKey);
      
      if (cachedAnalysis) {
        console.log('Returning cached analysis for player:', playerId);
        return cachedAnalysis;
      }

      // Build context for analysis
      const context = await this.buildAnalysisContext(playerId, draftId, userId);

      // Run AI analysis
      console.log('Running AI analysis for player:', playerId);
      const analysis = await this.masterStrategist.analyze(context);

      // Cache the results
      await this.cacheAnalysis(cacheKey, playerId, context, analysis);

      return analysis;
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw error;
    }
  }

  private async buildAnalysisContext(
    playerId: string,
    draftId: string,
    userId: string
  ): Promise<AgentContext> {
    // Get all necessary data in parallel
    const [draft, picks, players, user] = await Promise.all([
      sleeperApi.getDraft(draftId),
      sleeperApi.getDraftPicks(draftId),
      sleeperApi.getAllPlayers(),
      (supabaseAdmin || supabase).from('users').select('sleeper_user_id').eq('id', userId).single()
    ]);

    if (!user.data) {
      throw new Error('User not found');
    }

    // Get player info
    const player = players.get(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Get user's team info
    const userTeam = await sleeperApi.getUserTeamInDraft(draftId, user.data.sleeper_user_id);

    // Get user's current roster
    const userRoster = picks
      .filter(pick => pick.roster_id === userTeam.rosterId)
      .map(pick => players.get(pick.player_id))
      .filter(p => p);

    // Get available players (not yet drafted)
    const draftedPlayerIds = new Set(picks.map(p => p.player_id));
    const availablePlayers = Array.from(players.values())
      .filter(p => !draftedPlayerIds.has(p.player_id))
      .filter(p => p.position && ['QB', 'RB', 'WR', 'TE'].includes(p.position));

    // Calculate current pick info
    const currentPick = picks.length + 1;
    const totalPicks = draft.settings.teams * draft.settings.rounds;
    const currentRound = Math.floor(picks.length / draft.settings.teams) + 1;

    return {
      player,
      currentPick,
      totalPicks,
      currentRound,
      draftPosition: userTeam.draftSlot || 1,
      userRoster,
      allPicks: picks,
      availablePlayers,
      leagueSettings: draft.settings
    };
  }

  private generateCacheKey(playerId: string, draftId: string, userId: string): string {
    const data = `${playerId}-${draftId}-${userId}-${new Date().getHours()}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  private async getCachedAnalysis(cacheKey: string): Promise<any | null> {
    try {
      const { data } = await (supabaseAdmin || supabase)
        .from('analysis_cache')
        .select('*')
        .eq('id', cacheKey)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (data) {
        return {
          agents: data.agent_results,
          recommendation: data.master_recommendation,
          ...data.agent_results.masterStrategist
        };
      }
    } catch (error) {
      // Cache miss is expected
    }

    return null;
  }

  private async cacheAnalysis(
    cacheKey: string,
    playerId: string,
    context: AgentContext,
    analysis: any
  ): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour cache

      await (supabaseAdmin || supabase).from('analysis_cache').upsert({
        id: cacheKey,
        player_id: playerId,
        draft_context: {
          currentPick: context.currentPick,
          currentRound: context.currentRound,
          draftPosition: context.draftPosition
        },
        agent_results: analysis.agents,
        master_recommendation: analysis.recommendation,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });
    } catch (error) {
      console.error('Failed to cache analysis:', error);
      // Don't throw - caching failure shouldn't break the analysis
    }
  }
}

export const aiAnalysisService = new AIAnalysisService();