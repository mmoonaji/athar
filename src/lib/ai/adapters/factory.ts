import { AiAdapter } from './provider'
import { OpenAIAdapter } from './openai'
import { GeminiAdapter } from './gemini'
import { ClaudeAdapter } from './claude'
import { DeepSeekAdapter } from './deepseek'

/**
 * Registry Factory returning the requested LLM driver provider.
 */
export function getAiAdapter(providerName: string): AiAdapter {
  const provider = providerName.toLowerCase().trim()
  switch (provider) {
    case 'openai':
      return new OpenAIAdapter()
    case 'gemini':
      return new GeminiAdapter()
    case 'claude':
    case 'anthropic':
      return new ClaudeAdapter()
    case 'deepseek':
      return new DeepSeekAdapter()
    default:
      console.warn(`[Factory Warning] Provider "${providerName}" not recognized. Defaulting to Gemini.`)
      return new GeminiAdapter()
  }
}
