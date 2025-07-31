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
    if (this.availableKeys.length === 0) {
      throw new Error("No Gemini API keys available");
    }

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const currentKey = this.availableKeys[this.currentKeyIndex % this.availableKeys.length];
        const client = this.clients.get(currentKey);

        if (!client) {
          throw new Error("Client not found for current key");
        }

        const model = client.getGenerativeModel({ model: this.model });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (text && text.trim()) {
          // Increment usage for this key
          await ApiKeyManager.incrementUsage(currentKey);

          return text.trim();
        }

        throw new Error("Empty response from Gemini");
      } catch (error: any) {
        console.error(`Gemini API error (attempt ${attempt + 1}):`, error.message);

        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('quota') || error.message?.includes('PERMISSION_DENIED')) {
          // Try next key
          this.currentKeyIndex = (this.currentKeyIndex + 1) % this.availableKeys.length;
          console.log(`Switching to next API key (${this.currentKeyIndex + 1}/${this.availableKeys.length})`);
        }

        if (attempt === retries - 1) {
          throw new Error(`Gemini API failed after ${retries} attempts: ${error.message}`);
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    throw new Error("Failed to generate text with Gemini");
  }
}

export const geminiService = new GeminiService();