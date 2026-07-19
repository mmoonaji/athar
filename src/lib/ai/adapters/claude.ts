import { AiAdapter } from './provider'

export class ClaudeAdapter implements AiAdapter {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || 'MOCK_ANTHROPIC_API_KEY'
  }

  public async generateText(prompt: string): Promise<string> {
    console.log(`[Claude Adapter] Sending request to api.anthropic.com (Key length: ${this.apiKey.length})`)
    
    // In production:
    // const res = await fetch('https://api.anthropic.com/v1/messages', { ... })
    // return res.json().content[0].text

    return `[CLAUDE MOCK RESPONSE for prompt: ${prompt.substring(0, 40)}...]`
  }
}
