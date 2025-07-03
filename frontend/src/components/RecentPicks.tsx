interface RecentPicksProps {
  picks: any[];
  players: any[];
  currentPick?: number;
}

export default function RecentPicks({ picks, players, currentPick }: RecentPicksProps) {
  // Create a map for quick player lookup
  const playerMap = new Map(players.map(p => [p.player_id, p]));

  // Get last 10 picks
  const recentPicks = picks.slice(-10).reverse();

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-800">
        <h3 className="font-semibold text-sm">Recent Picks</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {recentPicks.length === 0 ? (
          <p className="p-4 text-center text-gray-400 text-sm">No picks yet</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentPicks.map((pick) => {
              const player = playerMap.get(pick.player_id);
              const isJustPicked = pick.pick_no === (currentPick || 0) - 1;

              return (
                <div
                  key={pick.pick_no}
                  className={`p-3 text-sm ${isJustPicked ? 'bg-primary/10' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        {player ? `${player.first_name} ${player.last_name}` : 'Unknown Player'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {player && `${player.position} - ${player.team || 'FA'}`}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-gray-400">Pick #{pick.pick_no}</div>
                      <div className="text-gray-500">R{pick.round}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {currentPick && (
        <div className="p-3 border-t border-gray-800 bg-gray-800 text-center text-sm">
          <span className="text-gray-400">Next:</span>
          <span className="ml-1 font-semibold">Pick #{currentPick}</span>
        </div>
      )}
    </div>
  );
}