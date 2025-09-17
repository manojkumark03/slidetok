// AI Integration Functions using Pollinations AI
export interface AIGenerationOptions {
  model?: string
  seed?: number
  temperature?: number
}

export async function generateCustomHook(
  appDetails: any,
  inspirationHook: string,
  strategy: string,
  options: AIGenerationOptions = {},
): Promise<string> {
  const prompt = `Transform this hook inspiration: "${inspirationHook}"
  
For app: ${appDetails.name} - ${appDetails.description}
Strategy: ${strategy}
Target: ${appDetails.audience || "general users"}

Create a viral TikTok hook that:
1. Is 8-15 words maximum
2. Uses the ${strategy} strategy principles
3. Is specific to this app
4. Creates urgency/curiosity

Return only the hook text.`

  try {
    const response = await fetch("https://text.pollinations.ai/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        model: options.model || "openai",
        seed: options.seed || Math.floor(Math.random() * 1000000),
        temperature: options.temperature || 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.statusText}`)
    }

    const result = await response.text()
    return result.trim()
  } catch (error) {
    console.error("AI hook generation failed:", error)
    // Fallback hooks based on strategy
    const fallbacks = {
      FOMO: `Don't miss out on ${appDetails.name}!`,
      Hype: `Everyone's talking about ${appDetails.name}`,
      Educational: `Learn how ${appDetails.name} works`,
      "Problem-Solution": `${appDetails.name} solves your biggest problem`,
      Comparison: `Why ${appDetails.name} beats the competition`,
    }
    return fallbacks[strategy as keyof typeof fallbacks] || `Download ${appDetails.name} today!`
  }
}

export async function generatePageContent(
  appDetails: any,
  strategy: string,
  pageIndex: number,
  options: AIGenerationOptions = {},
): Promise<string> {
  const prompts = {
    0: `Create a compelling opening line for page 1 of a TikTok slide about ${appDetails.name}. Strategy: ${strategy}. Keep it under 12 words.`,
    1: `Create engaging content for page 2 highlighting the main benefit of ${appDetails.name}. Strategy: ${strategy}. Keep it under 15 words.`,
    2: `Create content for page 3 showing social proof or features of ${appDetails.name}. Strategy: ${strategy}. Keep it under 15 words.`,
    3: `Create a strong call-to-action for the final page about ${appDetails.name}. Strategy: ${strategy}. Keep it under 10 words.`,
  }

  const prompt = prompts[pageIndex as keyof typeof prompts] || prompts[0]

  try {
    const response = await fetch("https://text.pollinations.ai/prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: prompt,
        model: options.model || "openai",
        seed: options.seed || Math.floor(Math.random() * 1000000),
        temperature: options.temperature || 0.8,
      }),
    })

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.statusText}`)
    }

    const result = await response.text()
    return result.trim()
  } catch (error) {
    console.error("AI content generation failed:", error)
    const fallbacks = [
      `Discover ${appDetails.name}`,
      `Transform your experience`,
      `Join thousands of users`,
      `Download now!'`,
    ]
    return fallbacks[pageIndex] || fallbacks[0]
  }
}
