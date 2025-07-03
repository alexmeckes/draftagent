import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/index';
import { fetchDraft, fetchDraftPicks, selectPlayer } from '../store/draftSlice';
import { socketService } from '../services/socket';
import { draftsApi } from '../services/api';
import DraftHeader from '../components/DraftHeader';
import PlayerPool from '../components/PlayerPool';
import AnalysisPanel from '../components/AnalysisPanel';
import MyTeam from '../components/MyTeam';
import RecentPicks from '../components/RecentPicks';

export default function DraftRoomPage() {
  const { draftId } = useParams<{ draftId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const reduxDraftState = useSelector((state: RootState) => state.draft);
  const { currentDraft, picks, players, userTeam, isLoading, error, selectedPlayer } = reduxDraftState;
  
  console.log('Redux draft state:', {
    hasCurrentDraft: !!currentDraft,
    isLoading,
    error,
    picksCount: picks?.length,
    playersCount: players?.length
  });
  const [draftState, setDraftState] = useState<any>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (!draftId) return;

    console.log('DraftRoomPage: Initializing for draft', draftId);

    // Connect to socket
    const socket = socketService.connect();
    socketService.joinDraft(draftId);

    // Initial fetch
    dispatch(fetchDraft(draftId))
      .unwrap()
      .then((result) => {
        console.log('Draft fetched successfully:', result);
      })
      .catch((error) => {
        console.error('Failed to fetch draft:', error);
      });
    
    // Start draft sync
    draftsApi.api.post(`/drafts/${draftId}/start-sync`)
      .catch(err => console.error('Failed to start sync:', err));

    // Get draft state
    const fetchDraftState = async () => {
      try {
        const { data } = await draftsApi.api.get(`/drafts/${draftId}/state`);
        console.log('Draft state fetched:', data);
        setDraftState(data);
      } catch (error) {
        console.error('Failed to fetch draft state:', error);
      }
    };

    fetchDraftState();

    // Listen for draft updates
    socketService.onDraftUpdate((update) => {
      console.log('Draft update received:', update);
      if (update.type === 'new-picks') {
        dispatch(fetchDraftPicks(draftId));
        fetchDraftState();
      } else if (update.type === 'draft-complete') {
        setDraftState({ ...draftState, isComplete: true });
        setIsMyTurn(false);
      }
    });

    socketService.onDraftError((error) => {
      console.error('Draft sync error:', error);
    });

    // Cleanup
    return () => {
      socketService.leaveDraft(draftId);
      socketService.offDraftUpdate();
      socketService.offDraftError();
      draftsApi.api.post(`/drafts/${draftId}/stop-sync`);
    };
  }, [draftId, dispatch]);

  // Separate effect to check if it's user's turn
  useEffect(() => {
    if (userTeam && draftState && draftState.currentDraftSlot) {
      const isUserTurn = userTeam.draftSlot === draftState.currentDraftSlot && !draftState.isComplete;
      setIsMyTurn(isUserTurn);
    }
  }, [userTeam, draftState]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading draft room...</p>
        </div>
      </div>
    );
  }

  if (error || !currentDraft) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="bg-danger/20 text-danger p-6 rounded-lg">
          <p className="font-semibold">Error loading draft</p>
          <p className="text-sm mt-1">{error || 'Draft not found'}</p>
          <button
            onClick={() => navigate('/drafts')}
            className="mt-4 px-4 py-2 bg-danger hover:bg-red-600 rounded transition-colors"
          >
            Back to Drafts
          </button>
        </div>
      </div>
    );
  }

  const handlePlayerSelect = (player: any) => {
    dispatch(selectPlayer(player));
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <DraftHeader
        draft={currentDraft}
        draftState={draftState}
        isMyTurn={isMyTurn}
        picksCount={picks.length}
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Player Pool */}
        <div className="w-1/3 border-r border-gray-800 overflow-hidden flex flex-col">
          <PlayerPool
            players={players}
            picks={picks}
            onPlayerSelect={handlePlayerSelect}
            selectedPlayer={selectedPlayer}
          />
        </div>

        {/* Center Panel - Analysis */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnalysisPanel
            selectedPlayer={selectedPlayer}
            draftId={draftId!}
            isMyTurn={isMyTurn}
            currentPick={draftState?.currentPick}
          />
        </div>

        {/* Right Panel - Team & Recent Picks */}
        <div className="w-1/4 border-l border-gray-800 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <MyTeam
              roster={userTeam?.picks || []}
              players={players}
              draftSettings={currentDraft.settings}
            />
          </div>
          <div className="h-1/3 border-t border-gray-800 overflow-y-auto">
            <RecentPicks
              picks={picks}
              players={players}
              currentPick={draftState?.currentPick}
            />
          </div>
        </div>
      </div>

      {/* Draft Complete Modal */}
      {draftState?.isComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-surface p-8 rounded-lg max-w-md">
            <h2 className="text-2xl font-bold text-primary mb-4">Draft Complete!</h2>
            <p className="text-gray-400 mb-6">
              The draft has finished. Good luck this season!
            </p>
            <button
              onClick={() => navigate('/drafts')}
              className="w-full py-2 bg-primary hover:bg-purple-700 rounded transition-colors"
            >
              Back to Drafts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}