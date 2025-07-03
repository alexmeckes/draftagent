import { Router, Request, Response } from 'express';
import { sleeperApi } from '../services/sleeperApi';
import { supabase, supabaseAdmin } from '../config/supabase';
import { draftSyncService } from '../services/draftSync';
import { aiAnalysisService } from '../services/aiAnalysis';
import { Server } from 'socket.io';

export function createDraftRouter(io: Server) {
  const router = Router();

// Get active drafts for authenticated user
const getActiveDraftsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get user's Sleeper ID
    const { data: user, error: userError } = await (supabaseAdmin || supabase)
      .from('users')
      .select('sleeper_user_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get active drafts from Sleeper
    console.log('Fetching drafts for Sleeper user:', user.sleeper_user_id);
    const activeDrafts = await sleeperApi.getActiveDraftsForUser(user.sleeper_user_id);
    console.log('Active drafts found:', activeDrafts.length);

    res.json({ drafts: activeDrafts });
  } catch (error) {
    console.error('Get active drafts error:', error);
    res.status(500).json({ error: 'Failed to get active drafts' });
  }
};

router.get('/active', getActiveDraftsHandler);

// Get specific draft details
const getDraftDetailsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { draftId } = req.params;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Get draft and picks
    const { draft, picks } = await sleeperApi.getDraftWithPicks(draftId);

    // Get all players data
    const allPlayers = await sleeperApi.getAllPlayers();

    // Get user's roster info
    const { data: user } = await (supabaseAdmin || supabase)
      .from('users')
      .select('sleeper_user_id')
      .eq('id', userId)
      .single();

    const userTeam = user ? await sleeperApi.getUserTeamInDraft(draftId, user.sleeper_user_id) : null;

    // Only send draftable players (filter out retired, non-fantasy relevant players)
    const draftablePlayers = Array.from(allPlayers.values()).filter(player => 
      player.status === 'Active' && 
      player.fantasy_positions && 
      player.fantasy_positions.length > 0 &&
      player.search_rank < 5000 // Top 5000 ranked players only
    );

    console.log(`Sending ${draftablePlayers.length} draftable players instead of ${allPlayers.size}`);

    res.json({
      draft,
      picks,
      userTeam,
      players: draftablePlayers
    });
  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({ error: 'Failed to get draft details' });
  }
};

router.get('/:draftId', getDraftDetailsHandler);

// Get draft picks (polling endpoint)
const getDraftPicksHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { draftId } = req.params;
    const picks = await sleeperApi.getDraftPicks(draftId);
    
    res.json({ picks });
  } catch (error) {
    console.error('Get picks error:', error);
    res.status(500).json({ error: 'Failed to get draft picks' });
  }
};

router.get('/:draftId/picks', getDraftPicksHandler);

// Analyze player for draft pick
const analyzePlayerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { draftId } = req.params;
    const { playerId } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!playerId) {
      res.status(400).json({ error: 'Player ID is required' });
      return;
    }

    // Run AI analysis
    const analysis = await aiAnalysisService.analyzePlayer(playerId, draftId, userId);
    
    res.json({
      playerId,
      analysis
    });
  } catch (error) {
    console.error('Analyze player error:', error);
    res.status(500).json({ error: 'Failed to analyze player' });
  }
};

router.post('/:draftId/analyze-player', analyzePlayerHandler);

// Start draft sync
const startSyncHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { draftId } = req.params;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Start syncing this draft
    await draftSyncService.startSync({ draftId, io });

    res.json({ message: 'Draft sync started' });
  } catch (error) {
    console.error('Start sync error:', error);
    res.status(500).json({ error: 'Failed to start draft sync' });
  }
};

router.post('/:draftId/start-sync', startSyncHandler);

// Stop draft sync
const stopSyncHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { draftId } = req.params;
    
    draftSyncService.stopSync(draftId);
    
    res.json({ message: 'Draft sync stopped' });
  } catch (error) {
    console.error('Stop sync error:', error);
    res.status(500).json({ error: 'Failed to stop draft sync' });
  }
};

router.post('/:draftId/stop-sync', stopSyncHandler);

// Get current draft state
const getDraftStateHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { draftId } = req.params;
    
    const state = await draftSyncService.getDraftState(draftId);
    
    res.json(state);
  } catch (error) {
    console.error('Get draft state error:', error);
    res.status(500).json({ error: 'Failed to get draft state' });
  }
};

router.get('/:draftId/state', getDraftStateHandler);

  return router;
}

export default createDraftRouter;