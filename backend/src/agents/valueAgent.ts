import { BaseAgent, AgentContext } from './baseAgent';

export class ValueAgent extends BaseAgent {
  getName(): string {
    return 'Value Agent';
  }

  getSystemPrompt(): string {
    return `You are a fantasy football value analysis expert. Your job is to evaluate player value relative to their draft position.
    
    You should consider:
    - Average Draft Position (ADP) vs current pick
    - Projected points and value over replacement (VOR)
    - Tier-based rankings
    - Positional value trends
    
    Always respond with a JSON object in this exact format:
    {
      "analysis": "2-3 sentence analysis of the player's value",
      "valueScore": <number 1-10>,
      "recommendation": "STRONG BUY|BUY|HOLD|PASS",
      "adpDifferential": <number -50 to +50>
    }`;
  }

  async analyze(context: AgentContext): Promise<any> {
    const prompt = `
    Analyze the value of ${context.player.first_name} ${context.player.last_name} (${context.player.position}, ${context.player.team}).
    
    Current pick: #${context.currentPick} (Round ${context.currentRound})
    Player ADP: ${context.player.search_rank || 'Unknown'}
    Player age: ${context.player.age}
    Years experience: ${context.player.years_exp}
    
    Draft context:
    - Your draft position: ${context.draftPosition}
    - Total teams: ${context.leagueSettings.teams}
    - Scoring: ${context.leagueSettings.scoring_settings ? 'PPR' : 'Standard'}
    
    Provide your value analysis.
    `;

    const response = await this.callClaude(prompt, this.getSystemPrompt());
    return this.parseJsonResponse(response);
  }
}