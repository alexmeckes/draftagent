import { BaseAgent, AgentContext } from './baseAgent';

export class ScarcityAgent extends BaseAgent {
  getName(): string {
    return 'Market Scarcity Agent';
  }

  getSystemPrompt(): string {
    return `You are a fantasy football position scarcity expert. Your job is to evaluate the remaining player pool and identify scarcity concerns.
    
    You should consider:
    - Remaining quality players at each position
    - Tier dropoffs and cliffs
    - Position run probability
    - Replacement level quality
    
    Always respond with a JSON object in this exact format:
    {
      "analysis": "2-3 sentence scarcity assessment",
      "scarcityScore": <number 1-10>,
      "urgency": "HIGH|MEDIUM|LOW",
      "tierDropoff": <number 1-5>,
      "alternativesCount": <number>
    }`;
  }

  async analyze(context: AgentContext): Promise<any> {
    // Calculate available players by position
    const availableByPosition = this.countAvailableByPosition(
      context.availablePlayers,
      context.player.position
    );

    const prompt = `
    Analyze position scarcity for ${context.player.first_name} ${context.player.last_name} (${context.player.position}, ${context.player.team}).
    
    Remaining quality players at ${context.player.position}:
    - Top 10 remaining: ${availableByPosition.top10}
    - Top 20 remaining: ${availableByPosition.top20}
    - Total remaining starters: ${availableByPosition.starters}
    
    Draft progress:
    - Current pick: ${context.currentPick} of ${context.totalPicks}
    - Picks until your next: ${this.calculatePicksUntilNext(context)}
    - Teams still needing ${context.player.position}: ${this.estimateTeamsNeeding(context, context.player.position)}
    
    Player rank: ${context.player.search_rank || 'Unknown'}
    
    Assess the urgency to draft this position.
    `;

    const response = await this.callClaude(prompt, this.getSystemPrompt());
    return this.parseJsonResponse(response);
  }

  private countAvailableByPosition(availablePlayers: any[], position: string) {
    const positionPlayers = availablePlayers
      .filter(p => p.position === position)
      .sort((a, b) => (a.search_rank || 999) - (b.search_rank || 999));

    return {
      top10: positionPlayers.filter(p => p.search_rank <= 100).length,
      top20: positionPlayers.filter(p => p.search_rank <= 200).length,
      starters: positionPlayers.filter(p => p.search_rank <= 300).length,
      total: positionPlayers.length
    };
  }

  private calculatePicksUntilNext(context: AgentContext): number {
    const currentRound = context.currentRound;
    const isEvenRound = currentRound % 2 === 0;
    const teams = context.leagueSettings.teams;
    
    if (isEvenRound) {
      return 2 * (context.draftPosition - 1);
    } else {
      return 2 * (teams - context.draftPosition);
    }
  }

  private estimateTeamsNeeding(context: AgentContext, position: string): number {
    // Simple estimation based on typical roster construction
    const positionTargets: Record<string, number> = {
      QB: 1,
      RB: 3,
      WR: 3,
      TE: 1
    };

    const target = positionTargets[position] || 1;
    const pickedCount = context.allPicks.filter(p => 
      p.metadata?.position === position
    ).length;

    const avgPerTeam = pickedCount / context.leagueSettings.teams;
    return Math.max(0, context.leagueSettings.teams - Math.floor(avgPerTeam / target));
  }
}