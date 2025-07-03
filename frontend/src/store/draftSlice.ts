import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { draftsApi } from '../services/api';

interface Draft {
  draft_id: string;
  type: 'snake' | 'linear' | 'auction';
  status: 'pre_draft' | 'drafting' | 'paused' | 'complete';
  sport: string;
  season: string;
  settings: any;
}

interface Pick {
  round: number;
  roster_id: string;
  player_id: string;
  pick_no: number;
  metadata: any;
}

interface Player {
  player_id: string;
  first_name: string;
  last_name: string;
  team: string;
  position: string;
  age: number;
}

interface DraftState {
  activeDrafts: Draft[];
  currentDraft: Draft | null;
  picks: Pick[];
  players: Player[];
  userTeam: {
    rosterId: string | null;
    draftSlot: number | null;
    picks: Pick[];
  } | null;
  isLoading: boolean;
  error: string | null;
  selectedPlayer: Player | null;
  analysis: any | null;
  isAnalyzing: boolean;
}

const initialState: DraftState = {
  activeDrafts: [],
  currentDraft: null,
  picks: [],
  players: [],
  userTeam: null,
  isLoading: false,
  error: null,
  selectedPlayer: null,
  analysis: null,
  isAnalyzing: false,
};

export const fetchActiveDrafts = createAsyncThunk(
  'draft/fetchActive',
  async () => {
    const response = await draftsApi.getActiveDrafts();
    return response.drafts;
  }
);

export const fetchDraft = createAsyncThunk(
  'draft/fetchDraft',
  async (draftId: string) => {
    console.log('Fetching draft:', draftId);
    try {
      const response = await draftsApi.getDraft(draftId);
      console.log('Draft response received, size:', JSON.stringify(response).length);
      return response;
    } catch (error) {
      console.error('Failed to fetch draft:', error);
      throw error;
    }
  }
);

export const fetchDraftPicks = createAsyncThunk(
  'draft/fetchPicks',
  async (draftId: string) => {
    const response = await draftsApi.getDraftPicks(draftId);
    return response.picks;
  }
);

export const analyzePlayer = createAsyncThunk(
  'draft/analyzePlayer',
  async ({ draftId, playerId }: { draftId: string; playerId: string }) => {
    const response = await draftsApi.analyzePlayer(draftId, playerId);
    return response.analysis;
  }
);

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    selectPlayer: (state, action) => {
      state.selectedPlayer = action.payload;
      state.analysis = null;
    },
    clearAnalysis: (state) => {
      state.analysis = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active drafts
      .addCase(fetchActiveDrafts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveDrafts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeDrafts = action.payload;
      })
      .addCase(fetchActiveDrafts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch drafts';
      })
      // Fetch draft details
      .addCase(fetchDraft.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDraft.fulfilled, (state, action) => {
        console.log('Draft fetch fulfilled:', {
          draft: action.payload.draft,
          picksCount: action.payload.picks?.length,
          playersCount: action.payload.players?.length,
          userTeam: action.payload.userTeam
        });
        state.isLoading = false;
        state.currentDraft = action.payload.draft;
        state.picks = action.payload.picks || [];
        state.players = action.payload.players || [];
        state.userTeam = action.payload.userTeam;
      })
      .addCase(fetchDraft.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch draft';
      })
      // Fetch picks
      .addCase(fetchDraftPicks.fulfilled, (state, action) => {
        state.picks = action.payload;
      })
      // Analyze player
      .addCase(analyzePlayer.pending, (state) => {
        state.isAnalyzing = true;
      })
      .addCase(analyzePlayer.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.analysis = action.payload;
      })
      .addCase(analyzePlayer.rejected, (state) => {
        state.isAnalyzing = false;
      });
  },
});

export const { selectPlayer, clearAnalysis } = draftSlice.actions;
export default draftSlice.reducer;