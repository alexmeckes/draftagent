import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store/index';
import { fetchActiveDrafts } from '../store/draftSlice';
import { logout } from '../store/authSlice';

export default function DraftsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { activeDrafts, isLoading, error } = useSelector((state: RootState) => state.draft);

  useEffect(() => {
    dispatch(fetchActiveDrafts());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  const handleDraftClick = (draftId: string) => {
    navigate(`/draft/${draftId}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Active Drafts</h1>
            {user && (
              <p className="text-gray-400 mt-1">
                Welcome back, {user.display_name || user.username}!
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading your drafts...</p>
          </div>
        ) : error ? (
          <div className="bg-danger/20 text-danger p-6 rounded-lg">
            <p className="font-semibold">Error loading drafts</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : activeDrafts.length === 0 ? (
          <div className="bg-dark-surface p-12 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">No Active Drafts</h2>
            <p className="text-gray-400">
              You don't have any active drafts at the moment.
            </p>
            <p className="text-gray-400 mt-2">
              Join a draft on Sleeper to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeDrafts.map((draft) => (
              <div
                key={draft.draft_id}
                onClick={() => handleDraftClick(draft.draft_id)}
                className="bg-dark-surface p-6 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold mb-1">
                    Draft {draft.draft_id.slice(0, 8)}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    draft.status === 'drafting' 
                      ? 'bg-success/20 text-success' 
                      : 'bg-warning/20 text-warning'
                  }`}>
                    {draft.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <p>Type: {draft.type}</p>
                  <p>Teams: {draft.settings.teams}</p>
                  <p>Rounds: {draft.settings.rounds}</p>
                  <p>Pick Timer: {draft.settings.pick_timer}s</p>
                </div>

                <button className="mt-4 w-full py-2 bg-primary hover:bg-purple-700 rounded transition-colors">
                  Enter Draft Room
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-dark-surface p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">How to use the Draft Assistant</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-400">
            <li>Select an active draft from the list above</li>
            <li>The assistant will sync with your live draft automatically</li>
            <li>Click on any player to get AI-powered analysis</li>
            <li>Follow the recommendations to build a winning team!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}