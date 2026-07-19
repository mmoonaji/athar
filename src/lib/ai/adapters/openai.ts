import { AiAdapter } from './provider'

export class OpenAIAdapter implements AiAdapter {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || 'MOCK_OPENAI_API_KEY'
  }

  public async generateText(prompt: string): Promise<string> {
    console.log(`[OpenAI Adapter] Sending request to api.openai.com (Key length: ${this.apiKey.length})`)
    
    // In production:
    // const res = await fetch('https://api.openai.com/v1/chat/completions', { ... })
    // return res.json().choices[0].message.content
    
    return `[OPENAI MOCK RESPONSE for prompt: ${prompt.substring(0, 40)}...]`
  }
}
