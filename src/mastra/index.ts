import { Mastra } from '@mastra/core'

export const mastra = new Mastra({
    // Agent and tools will be configured here
})

// Life Director Agent will be added with tools:
// - getWeather(city)
// - getTrends(city)
// - generateImage(prompt, refs)
// - generateVideo(firstFrame, lastFrame, prompt)
// - updateWallet(amount)
