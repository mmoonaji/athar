import { AiAdapter } from './provider'

export class DeepSeekAdapter implements AiAdapter {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || 'MOCK_DEEPSEEK_API_KEY'
  }

  public async generateText(prompt: string): Promise<string> {
    console.log(`[DeepSeek Adapter] Sending request to api.deepseek.com (Key length: ${this.apiKey.length})`)
    
    // In production:
    // const res = await fetch('https://api.deepseek.com/chat/completions', { ... })
    // return res.json().choices[0].message.content

    return `[DEEPSEEK MOCK RESPONSE for prompt: ${prompt.substring(0, 40)}...]`
  }
}
