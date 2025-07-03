import { BaseAgent, AgentContext } from './baseAgent';

export class RiskAgent extends BaseAgent {
  getName(): string {
    return 'Risk Assessment Agent';
  }

  getSystemPrompt(): string {
    return `You are a fantasy football risk assessment expert. Your job is to evaluate player reliability and risk factors.
    
    You should consider:
    - Age and injury history
    - Consistency of past performance
    - Team situation and coaching changes
    - Workload and competition concerns
    
    Always respond with a JSON object in this exact format:
    {
      "analysis": "2-3 sentence risk assessment",
      "riskScore": <number 1-10>,
      "confidence": "HIGH|MEDIUM|LOW",
      "primaryConcerns": ["concern1", "concern2"],
      "upsideVariance": <number 1-5>
    }`;
  }

  async analyze(context: AgentContext): Promise<any> {
    const prompt = `
    Analyze the risk profile of ${context.player.first_name} ${context.player.last_name} (${context.player.position}, ${context.player.team}).
    
    Player details:
    - Age: ${context.player.age}
    - Years experience: ${context.player.years_exp}
    - Status: ${context.player.status}
    - Injury status: ${context.player.injury_status || 'Healthy'}
    
    Draft context:
    - Current pick: ${context.currentPick}
    - Round: ${context.currentRound}
    
    Consider:
    1. Age-related decline risk (${context.player.age} years old)
    2. Injury history and current health
    3. Team situation stability
    4. Competition for targets/carries
    5. Historical consistency
    
    Provide your risk assessment.
    `;

    const response = await this.callClaude(prompt, this.getSystemPrompt());
    return this.parseJsonResponse(response);
  }
}