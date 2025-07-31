import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiKeyManager } from "./apiKeyManager";
import { getStorage } from "../storage";

class GeminiService {
  private clients: Map<string, GoogleGenerativeAI> = new Map();
  private availableKeys: string[] = [];
  private currentKeyIndex = 0;
  private model = "gemini-1.5-flash";

  constructor() {
    this.initializeClients();
  }

  private async initializeClients() {
    try {
      // Get API keys from database storage
      const storage = await getStorage();
      const apiKeys = await storage.getActiveApiKeys("gemini");

      console.log(`🔄 Loading API keys from database: Found ${apiKeys.length} active Gemini keys`);

      if (apiKeys.length > 0) {
        // Initialize clients for each API key
        apiKeys.forEach((keyData, index) => {
          const client = new GoogleGenerativeAI(keyData.key);
          this.clients.set(keyData.key, client);
          this.availableKeys.push(keyData.key);
          console.log(`  Key ${index + 1}: ${keyData.key.substring(0, 8)}...`);
        });

        console.log(`✓ Initialized Gemini service with ${this.clients.size} API keys using model: ${this.model}`);
      } else {
        console.warn("⚠️ No active Gemini API keys found in database");
      }
    } catch (error) {
      console.error("Failed to initialize Gemini clients:", error);
    }
  }

  async generateText(prompt: string, retries = 3): Promise<string> {
    let currentApiKey = await ApiKeyManager.getAvailableApiKey("gemini");
    if (!currentApiKey) {
      throw new Error("No Gemini API keys available");
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const genAI = new GoogleGenerativeAI(currentApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Increment usage for successful API call
        await ApiKeyManager.incrementUsage(currentApiKey);

        return text;
      } catch (error: any) {
        console.error(`Gemini API error (attempt ${attempt + 1}/${retries + 1}):`, error.message);

        // Handle API key rotation on errors
        const nextKey = await ApiKeyManager.handleApiError(currentApiKey, error);

        if (attempt < retries && nextKey) {
          console.log(`🔄 Switching to next API key for retry...`);
          currentApiKey = nextKey;
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }

        // If no more retries or no more keys available
        if (attempt >= retries) {
          throw new Error(`Gemini API failed after ${retries + 1} attempts: ${error.message}`);
        }

        throw new Error(`Gemini API error: ${error.message}`);
      }
    }

    throw new Error("Unexpected error in generateContent");
  }
}

export const geminiService = new GeminiService();