export interface AiAdapter {
  generateText(prompt: string): Promise<string>
}
