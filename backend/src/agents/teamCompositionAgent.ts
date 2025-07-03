import { BaseAgent, AgentContext } from './baseAgent';

export class TeamCompositionAgent extends BaseAgent {
  getName(): string {
    return 'Team Composition Agent';
  }

  getSystemPrompt(): string {
    return `You are a fantasy football roster construction expert. Your job is to evaluate how a player fits with the current team composition.
    
    You should consider:
    - Current roster balance and positional needs
    - Starting lineup requirements
    - Bye week distribution
    - Stack potential (QB-WR combos)
    - Bench depth
    
    Always respond with a JSON object in this exact format:
    {
      "analysis": "2-3 sentence analysis of roster fit",
      "needScore": <number 1-10>,
      "synergyScore": <number 1-10>,
      "criticalNeeds": ["position1", "position2"],
      "byeWeekConflicts": []
    }`;
  }

  async analyze(context: AgentContext): Promise<any> {
    // Count current roster by position
    const rosterCounts = this.countPositions(context.userRoster);
    
    const prompt = `
    Analyze how ${context.player.first_name} ${context.player.last_name} (${context.player.position}, ${context.player.team}) fits with the current roster.
    
    Current roster composition:
    ${Object.entries(rosterCounts).map(([pos, count]) => `- ${pos}: ${count}`).join('\n')}
    
    Starting requirements:
    - QB: ${context.leagueSettings.roster_positions?.filter((p: string) => p === 'QB').length || 1}
    - RB: ${context.leagueSettings.roster_positions?.filter((p: string) => p === 'RB').length || 2}
    - WR: ${context.leagueSettings.roster_positions?.filter((p: string) => p === 'WR').length || 2}
    - TE: ${context.leagueSettings.roster_positions?.filter((p: string) => p === 'TE').length || 1}
    - FLEX: ${context.leagueSettings.roster_positions?.filter((p: string) => p === 'FLEX').length || 1}
    
    Current pick: ${context.currentPick} of ${context.totalPicks}
    
    Evaluate roster fit and positional needs.
    `;

    const response = await this.callClaude(prompt, this.getSystemPrompt());
    return this.parseJsonResponse(response);
  }

  private countPositions(roster: any[]): Record<string, number> {
    const counts: Record<string, number> = {
      QB: 0,
      RB: 0,
      WR: 0,
      TE: 0,
      DEF: 0,
      K: 0
    };

    roster.forEach(player => {
      if (player.position && counts.hasOwnProperty(player.position)) {
        counts[player.position]++;
      }
    });

    return counts;
  }
}