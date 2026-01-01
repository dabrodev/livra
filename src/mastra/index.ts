/**
 * Mastra - Agentic Framework Configuration
 * 
 * This module exports all Mastra agents, tools, and utilities
 * for use throughout the Livra application.
 * 
 * Structure:
 * - agents/: AI agent definitions (Life Director, etc.)
 * - tools/: Tool definitions (weather, trends, wallet, memory)
 */

// Re-export agents
export { lifeDirectorAgent, runLifeDirector } from "./agents";

// Re-export tools
export {
    // Tool definitions
    weatherTool,
    trendsTool,
    walletTool,
    memoryTool,
    // Utility functions (for direct use in Inngest workflows)
    getWeather,
    getTrends,
    updateWallet,
    createMemory,
    // Types
    type WeatherResult,
    type TrendsResult,
    type Category,
} from "./tools";
