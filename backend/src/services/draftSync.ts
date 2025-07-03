import { Server } from 'socket.io';
import { sleeperApi } from './sleeperApi';
import { supabase } from '../config/supabase';

interface DraftSyncOptions {
  draftId: string;
  io: Server;
  pollInterval?: number;
}

export class DraftSyncService {
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastPickCounts: Map<string, number> = new Map();

  async startSync({ draftId, io, pollInterval = 2000 }: DraftSyncOptions) {
    // Stop any existing sync for this draft
    this.stopSync(draftId);

    console.log(`Starting draft sync for ${draftId}`);

    // Initial sync
    await this.syncDraft(draftId, io);

    // Set up polling
    const interval = setInterval(async () => {
      await this.syncDraft(draftId, io);
    }, pollInterval);

    this.syncIntervals.set(draftId, interval);
  }

  stopSync(draftId: string) {
    const interval = this.syncIntervals.get(draftId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(draftId);
      this.lastPickCounts.delete(draftId);
      console.log(`Stopped draft sync for ${draftId}`);
    }
  }

  stopAllSyncs() {
    for (const [draftId] of this.syncIntervals) {
      this.stopSync(draftId);
    }
  }

  private async syncDraft(draftId: string, io: Server) {
    try {
      const [draft, picks] = await Promise.all([
        sleeperApi.getDraft(draftId),
        sleeperApi.getDraftPicks(draftId)
      ]);

      const lastPickCount = this.lastPickCounts.get(draftId) || 0;
      const currentPickCount = picks.length;

      // Check if there are new picks
      if (currentPickCount > lastPickCount) {
        console.log(`New picks detected in draft ${draftId}: ${currentPickCount - lastPickCount} new picks`);
        
        // Get the new picks
        const newPicks = picks.slice(lastPickCount);
        
        // Emit updates to all clients in the draft room
        io.to(`draft-${draftId}`).emit('draft-update', {
          type: 'new-picks',
          draft,
          picks,
          newPicks,
          currentPick: currentPickCount + 1,
          isComplete: draft.status === 'complete'
        });

        // Store draft session in database
        await this.updateDraftSession(draftId, draft, picks);
      }

      // Update last pick count
      this.lastPickCounts.set(draftId, currentPickCount);

      // Check if draft is complete
      if (draft.status === 'complete') {
        console.log(`Draft ${draftId} is complete, stopping sync`);
        this.stopSync(draftId);
        
        io.to(`draft-${draftId}`).emit('draft-update', {
          type: 'draft-complete',
          draft,
          picks
        });
      }

    } catch (error) {
      console.error(`Error syncing draft ${draftId}:`, error);
      
      // Emit error to clients
      io.to(`draft-${draftId}`).emit('draft-error', {
        message: 'Failed to sync draft data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async updateDraftSession(draftId: string, draft: any, picks: any[]) {
    try {
      // Get all user IDs in this draft
      const userIds = Object.values(draft.slot_to_roster_id || {}) as string[];
      
      for (const userId of userIds) {
        // Check if we have this user in our database
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('sleeper_user_id', userId)
          .single();

        if (user) {
          // Update or create draft session
          await supabase
            .from('draft_sessions')
            .upsert({
              user_id: user.id,
              draft_id: draftId,
              league_id: draft.league_id || '',
              status: draft.status,
              draft_data: {
                draft,
                picks,
                lastSync: new Date().toISOString()
              }
            }, {
              onConflict: 'user_id,draft_id'
            });
        }
      }
    } catch (error) {
      console.error('Error updating draft session:', error);
    }
  }

  // Get current draft state
  async getDraftState(draftId: string) {
    try {
      const [draft, picks] = await Promise.all([
        sleeperApi.getDraft(draftId),
        sleeperApi.getDraftPicks(draftId)
      ]);

      const currentPick = picks.length + 1;
      const totalPicks = draft.settings.teams * draft.settings.rounds;
      const isComplete = draft.status === 'complete' || currentPick > totalPicks;

      // Calculate whose turn it is
      let currentDraftSlot = 1;
      if (!isComplete && picks.length > 0) {
        const round = Math.floor(picks.length / draft.settings.teams) + 1;
        const pickInRound = picks.length % draft.settings.teams;
        
        // Snake draft logic
        if (draft.type === 'snake' && round % 2 === 0) {
          currentDraftSlot = draft.settings.teams - pickInRound;
        } else {
          currentDraftSlot = pickInRound + 1;
        }
      }

      return {
        draft,
        picks,
        currentPick,
        currentRound: Math.floor(picks.length / draft.settings.teams) + 1,
        currentDraftSlot,
        isComplete,
        totalPicks
      };
    } catch (error) {
      console.error('Error getting draft state:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const draftSyncService = new DraftSyncService();