interface MyTeamProps {
  roster: any[];
  players: any[];
  draftSettings: any;
}

export default function MyTeam({ roster, players, draftSettings }: MyTeamProps) {
  // Create a map for quick player lookup
  const playerMap = new Map(players.map(p => [p.player_id, p]));

  // Get roster requirements
  const rosterRequirements = {
    QB: draftSettings.slots_qb || 1,
    RB: draftSettings.slots_rb || 2,
    WR: draftSettings.slots_wr || 2,
    TE: draftSettings.slots_te || 1,
    FLEX: draftSettings.slots_flex || 1,
    DEF: draftSettings.slots_def || 1,
    K: draftSettings.slots_k || 1,
    BN: draftSettings.slots_bn || 6,
  };

  // Group roster by position
  const rosterByPosition = roster.reduce((acc: any, pick) => {
    const player = playerMap.get(pick.player_id);
    if (player) {
      const position = player.position;
      if (!acc[position]) acc[position] = [];
      acc[position].push({ ...player, pick });
    }
    return acc;
  }, {});

  // Calculate needs
  const needs = {
    QB: Math.max(0, rosterRequirements.QB - (rosterByPosition.QB?.length || 0)),
    RB: Math.max(0, rosterRequirements.RB + 1 - (rosterByPosition.RB?.length || 0)), // +1 for depth
    WR: Math.max(0, rosterRequirements.WR + 1 - (rosterByPosition.WR?.length || 0)), // +1 for depth
    TE: Math.max(0, rosterRequirements.TE - (rosterByPosition.TE?.length || 0)),
    DEF: Math.max(0, rosterRequirements.DEF - (rosterByPosition.DEF?.length || 0)),
    K: Math.max(0, rosterRequirements.K - (rosterByPosition.K?.length || 0)),
  };

  const positions = ['QB', 'RB', 'WR', 'TE', 'DEF', 'K'];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h3 className="font-semibold">My Team</h3>
        <p className="text-sm text-gray-400">{roster.length} players drafted</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Team Needs */}
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Roster Needs</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(needs).map(([pos, need]) => (
              <div key={pos} className={need > 0 ? 'text-warning' : 'text-gray-400'}>
                {pos}: {need > 0 ? `Need ${need}` : '✓'}
              </div>
            ))}
          </div>
        </div>

        {/* Roster by Position */}
        <div className="space-y-3">
          {positions.map(position => {
            const positionPlayers = rosterByPosition[position] || [];
            const requirement = rosterRequirements[position as keyof typeof rosterRequirements] || 0;

            return (
              <div key={position}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold">
                    {position} ({positionPlayers.length}/{requirement})
                  </h4>
                </div>
                {positionPlayers.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">None drafted</p>
                ) : (
                  <div className="space-y-1">
                    {positionPlayers.map((player: any) => (
                      <div key={player.player_id} className="bg-gray-800 p-2 rounded text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {player.first_name} {player.last_name}
                          </span>
                          <span className="text-xs text-gray-400">
                            Pick #{player.pick.pick_no}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.team} - Round {player.pick.round}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bench */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-1">
            Bench ({Math.max(0, roster.length - Object.values(rosterRequirements).reduce((a, b) => a + b, 0) + rosterRequirements.BN)}/{rosterRequirements.BN})
          </h4>
        </div>
      </div>
    </div>
  );
}