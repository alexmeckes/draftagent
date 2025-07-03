import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface PlayerPoolProps {
  players: any[];
  picks: any[];
  onPlayerSelect: (player: any) => void;
  selectedPlayer: any;
}

export default function PlayerPool({ players, picks, onPlayerSelect, selectedPlayer }: PlayerPoolProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'rank' | 'name' | 'position'>('rank');

  // Get drafted player IDs
  const draftedPlayerIds = useMemo(() => {
    return new Set(picks.map(pick => pick.player_id));
  }, [picks]);

  // Filter and sort available players
  const availablePlayers = useMemo(() => {
    return players
      .filter(player => {
        // Only show draftable positions
        if (!player.position || !['QB', 'RB', 'WR', 'TE', 'DEF', 'K'].includes(player.position)) {
          return false;
        }
        
        // Filter out drafted players
        if (draftedPlayerIds.has(player.player_id)) {
          return false;
        }

        // Apply position filter
        if (positionFilter !== 'ALL' && player.position !== positionFilter) {
          return false;
        }

        // Apply search filter
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
          return fullName.includes(search) || player.team?.toLowerCase().includes(search);
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'rank':
            return (a.search_rank || 999) - (b.search_rank || 999);
          case 'name':
            return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
          case 'position':
            return a.position.localeCompare(b.position);
          default:
            return 0;
        }
      });
  }, [players, draftedPlayerIds, positionFilter, searchTerm, sortBy]);

  const positions = ['ALL', 'QB', 'RB', 'WR', 'TE', 'DEF', 'K'];

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'QB': return 'bg-red-500/20 text-red-300';
      case 'RB': return 'bg-green-500/20 text-green-300';
      case 'WR': return 'bg-blue-500/20 text-blue-300';
      case 'TE': return 'bg-orange-500/20 text-orange-300';
      case 'DEF': return 'bg-purple-500/20 text-purple-300';
      case 'K': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Search and Filters */}
      <div className="p-4 border-b border-border space-y-3">
        <Input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {positions.map(pos => (
              <Button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                variant={positionFilter === pos ? 'default' : 'secondary'}
                size="sm"
                className="h-7 px-2 text-xs"
              >
                {pos}
              </Button>
            ))}
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-24 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Rank</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="position">Position</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Player List */}
      <ScrollArea className="flex-1">
        {availablePlayers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No players found
          </div>
        ) : (
          <div className="divide-y divide-border">
            {availablePlayers.map((player) => (
              <div
                key={player.player_id}
                onClick={() => onPlayerSelect(player)}
                className={`p-3 hover:bg-accent/5 cursor-pointer transition-colors ${
                  selectedPlayer?.player_id === player.player_id ? 'bg-accent/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {player.first_name} {player.last_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className={`${getPositionColor(player.position)} border-0`}>
                        {player.position}
                      </Badge>
                      <span className="text-muted-foreground">
                        {player.team || 'FA'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      #{player.search_rank || '???'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Age: {player.age}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Stats */}
      <div className="p-3 border-t border-border text-xs text-muted-foreground flex justify-between">
        <span>{availablePlayers.length} players available</span>
        <span>{picks.length} picks made</span>
      </div>
    </div>
  );
}