import Anthropic from '@anthropic-ai/sdk';

export interface AgentContext {
  currentPick: number;
  totalPicks: number;
  currentRound: number;
  draftPosition: number;
  userRoster: any[];
  allPicks: any[];
  availablePlayers: any[];
  leagueSettings: any;
  player: any;
}

export abstract class BaseAgent {
  protected anthropic: Anthropic;
  protected model = 'claude-3-5-haiku-20241022'; // Fast model for individual agents

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY || '',
    });
  }

  abstract getName(): string;
  abstract getSystemPrompt(): string;
  abstract analyze(context: AgentContext): Promise<any>;

  protected async callClaude(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      console.error(`Error in ${this.getName()} agent:`, error);
      throw error;
    }
  }

  protected parseJsonResponse(response: string): any {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error(`Failed to parse JSON response from ${this.getName()}:`, response);
      throw error;
    }
  }
}