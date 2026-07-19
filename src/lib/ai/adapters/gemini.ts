import { AiAdapter } from './provider'

export class GeminiAdapter implements AiAdapter {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || 'MOCK_GEMINI_API_KEY'
  }

  public async generateText(prompt: string): Promise<string> {
    console.log(`[Gemini Adapter] Sending request to generativelanguage.googleapis.com (Key length: ${this.apiKey.length})`)
    
    // In production:
    // const res = await fetch('https://generativelanguage.googleapis.com/...', { ... })
    // return res.json().candidates[0].content.parts[0].text

    return `[GEMINI MOCK RESPONSE for prompt: ${prompt.substring(0, 40)}...]`
  }
}
