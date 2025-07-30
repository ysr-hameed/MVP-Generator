import { getStorage } from "../storage";

export class ApiKeyManager {
  static async initializeFromEnvironment() {
    try {
      const storage = await getStorage();
      
      // Check if we already have API keys
      const existingKeys = await storage.getActiveApiKeys("gemini");
      if (existingKeys.length > 0) {
        console.log(`✓ Found ${existingKeys.length} existing Gemini API keys`);
        return;
      }

      // Add the primary API key from environment
      if (process.env.GEMINI_API_KEY) {
        await storage.createApiKey({
          provider: "gemini",
          key: process.env.GEMINI_API_KEY,
          isActive: true,
          dailyUsage: 0,
        });
        console.log("✓ Added primary Gemini API key to database");
      }

      // Add additional API keys if they exist
      const additionalKeys = [
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5
      ].filter(Boolean);

      for (const key of additionalKeys) {
        if (key) {
          await storage.createApiKey({
            provider: "gemini",
            key: key,
            isActive: true,
            dailyUsage: 0,
          });
          console.log("✓ Added additional Gemini API key to database");
        }
      }

      const totalKeys = await storage.getActiveApiKeys("gemini");
      console.log(`✓ Total API keys configured: ${totalKeys.length}`);
      
    } catch (error) {
      console.error("Failed to initialize API keys:", error);
    }
  }

  static async resetDailyUsage() {
    try {
      const storage = await getStorage();
      const keys = await storage.getApiKeys("gemini");
      
      const now = new Date();
      for (const key of keys) {
        const lastReset = new Date(key.lastReset);
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
        
        // Reset daily usage if more than 24 hours have passed
        if (hoursSinceReset >= 24) {
          await storage.updateApiKey(key.id, {
            dailyUsage: 0,
            lastReset: now,
            isActive: true
          });
          console.log(`✓ Reset daily usage for API key ${key.id.substring(0, 8)}...`);
        }
      }
    } catch (error) {
      console.error("Failed to reset daily usage:", error);
    }
  }

  static async incrementUsage(apiKey: string) {
    try {
      const storage = await getStorage();
      const keyData = await storage.getApiKeyByValue(apiKey);
      
      if (keyData) {
        const newUsage = keyData.dailyUsage + 1;
        const isActive = newUsage < 50; // Disable if over 50 requests per day
        
        await storage.updateApiKey(keyData.id, {
          dailyUsage: newUsage,
          isActive: isActive
        });
        
        if (!isActive) {
          console.log(`⚠️ API key ${keyData.id.substring(0, 8)}... reached daily limit`);
        }
      }
    } catch (error) {
      console.error("Failed to increment API usage:", error);
    }
  }
}