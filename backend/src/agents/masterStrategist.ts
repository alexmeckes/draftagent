import { BaseAgent, AgentContext } from './baseAgent';
import { ValueAgent } from './valueAgent';
import { TeamCompositionAgent } from './teamCompositionAgent';
import { ScarcityAgent } from './scarcityAgent';
import { RiskAgent } from './riskAgent';

export class MasterStrategist extends BaseAgent {
  private valueAgent: ValueAgent;
  private teamCompositionAgent: TeamCompositionAgent;
  private scarcityAgent: ScarcityAgent;
  private riskAgent: RiskAgent;

  constructor() {
    super();
    this.model = 'claude-3-5-sonnet-20241022'; // Use a more capable model for synthesis
    this.valueAgent = new ValueAgent();
    this.teamCompositionAgent = new TeamCompositionAgent();
    this.scarcityAgent = new ScarcityAgent();
    this.riskAgent = new RiskAgent();
  }

  getName(): string {
    return 'Master Strategist';
  }

  getSystemPrompt(): string {
    return `You are the Master Strategist for fantasy football drafts. Your job is to synthesize insights from multiple specialist agents and provide a clear, actionable recommendation.
    
    You will receive analysis from:
    1. Value Agent - evaluates draft value and ADP
    2. Team Composition Agent - analyzes roster fit
    3. Scarcity Agent - assesses position availability
    4. Risk Agent - evaluates reliability concerns
    
    Provide a conversational, confident recommendation that:
    - Gives a clear DRAFT or PASS verdict
    - Explains the key reasoning in 2-3 sentences
    - Suggests alternatives if PASS
    - Includes a confidence score (1-10)
    
    Be direct and actionable. Users are on the clock and need quick decisions.`;
  }

  async analyze(context: AgentContext): Promise<any> {
    try {
      // Run all agents in parallel
      const [valueAnalysis, teamAnalysis, scarcityAnalysis, riskAnalysis] = await Promise.all([
        this.valueAgent.analyze(context),
        this.teamCompositionAgent.analyze(context),
        this.scarcityAgent.analyze(context),
        this.riskAgent.analyze(context)
      ]);

      // Get alternative players if needed
      const alternatives = this.findAlternatives(context);

      const prompt = `
      Synthesize these analyses for ${context.player.first_name} ${context.player.last_name} (${context.player.position}, ${context.player.team}):

      VALUE ANALYSIS:
      ${JSON.stringify(valueAnalysis, null, 2)}

      TEAM COMPOSITION:
      ${JSON.stringify(teamAnalysis, null, 2)}

      POSITION SCARCITY:
      ${JSON.stringify(scarcityAnalysis, null, 2)}

      RISK ASSESSMENT:
      ${JSON.stringify(riskAnalysis, null, 2)}

      Context:
      - Pick #${context.currentPick} (Round ${context.currentRound})
      - Your next pick in: ${this.calculatePicksUntilNext(context)} selections
      - Top alternatives available: ${alternatives.map(p => `${p.first_name} ${p.last_name} (${p.position})`).join(', ')}

      Provide your master recommendation. Be conversational but decisive. Start with DRAFT or PASS, then explain why in 2-3 sentences. If PASS, suggest who to target instead.
      `;

      const recommendation = await this.callClaude(prompt, this.getSystemPrompt());

      return {
        agents: {
          valueAgent: valueAnalysis,
          teamCompositionAgent: teamAnalysis,
          scarcityAgent: scarcityAnalysis,
          riskAgent: riskAnalysis
        },
        recommendation,
        confidence: this.extractConfidence(recommendation),
        verdict: this.extractVerdict(recommendation),
        alternatives: alternatives.slice(0, 3)
      };
    } catch (error) {
      console.error('Master Strategist error:', error);
      throw error;
    }
  }

  private findAlternatives(context: AgentContext): any[] {
    return context.availablePlayers
      .filter(p => p.position === context.player.position)
      .filter(p => p.player_id !== context.player.player_id)
      .sort((a, b) => (a.search_rank || 999) - (b.search_rank || 999))
      .slice(0, 5);
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

  private extractConfidence(recommendation: string): number {
    const match = recommendation.match(/confidence:?\s*(\d+)/i);
    if (match) {
      return parseInt(match[1]);
    }
    
    // Estimate based on language
    if (recommendation.includes('strongly') || recommendation.includes('definitely')) {
      return 9;
    } else if (recommendation.includes('good') || recommendation.includes('solid')) {
      return 7;
    } else if (recommendation.includes('risky') || recommendation.includes('concern')) {
      return 5;
    }
    
    return 6;
  }

  private extractVerdict(recommendation: string): 'DRAFT' | 'PASS' {
    if (recommendation.toUpperCase().includes('DRAFT')) {
      return 'DRAFT';
    }
    return 'PASS';
  }
}