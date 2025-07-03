interface DraftHeaderProps {
  draft: any;
  draftState: any;
  isMyTurn: boolean;
  picksCount: number;
}

export default function DraftHeader({ draft, draftState, isMyTurn, picksCount }: DraftHeaderProps) {
  const currentRound = draftState?.currentRound || 1;
  const currentPick = draftState?.currentPick || 1;
  const totalPicks = draft.settings.teams * draft.settings.rounds;
  const pickTimer = draft.settings.pick_timer || 0;

  return (
    <div className="bg-dark-surface border-b border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-primary">Draft Room</h1>
          
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <span className="text-gray-400">Round:</span>
              <span className="ml-1 font-semibold">{currentRound}/{draft.settings.rounds}</span>
            </div>
            <div>
              <span className="text-gray-400">Pick:</span>
              <span className="ml-1 font-semibold">{currentPick}/{totalPicks}</span>
            </div>
            <div>
              <span className="text-gray-400">Type:</span>
              <span className="ml-1 font-semibold capitalize">{draft.type}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {isMyTurn && (
            <div className="animate-pulse bg-success/20 text-success px-4 py-1 rounded-full text-sm font-semibold">
              YOUR TURN!
            </div>
          )}
          
          {draft.status === 'drafting' && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}