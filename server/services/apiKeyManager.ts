import { getStorage } from "../storage";

export class ApiKeyManager {
  static async initializeFromEnvironment() {
    try {
      const storage = await getStorage();
      
      // Initialize Gemini API keys
      const existingGeminiKeys = await storage.getActiveApiKeys("gemini");
      if (existingGeminiKeys.length === 0) {
        await this.initializeGeminiKeys(storage);
      } else {
        console.log(`✓ Found ${existingGeminiKeys.length} existing Gemini API keys`);
      }

      // Initialize Unsplash API keys
      const existingUnsplashKeys = await storage.getActiveApiKeys("unsplash");
      if (existingUnsplashKeys.length === 0) {
        await this.initializeUnsplashKeys(storage);
      } else {
        console.log(`✓ Found ${existingUnsplashKeys.length} existing Unsplash API keys`);
      }
      
    } catch (error) {
      console.error("Failed to initialize API keys:", error);
    }
  }

  private static async initializeGeminiKeys(storage: any) {

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

    const totalGeminiKeys = await storage.getActiveApiKeys("gemini");
    console.log(`✓ Total Gemini API keys configured: ${totalGeminiKeys.length}`);
  }

  private static async initializeUnsplashKeys(storage: any) {
    // Add Unsplash API keys from environment
    const unsplashKeys = [
      process.env.UNSPLASH_ACCESS_KEY,
      process.env.UNSPLASH_ACCESS_KEY_2,
      process.env.UNSPLASH_ACCESS_KEY_3
    ].filter(Boolean);

    for (const key of unsplashKeys) {
      if (key) {
        await storage.createApiKey({
          provider: "unsplash",
          key: key,
          isActive: true,
          dailyUsage: 0,
        });
        console.log("✓ Added Unsplash API key to database");
      }
    }

    const totalUnsplashKeys = await storage.getActiveApiKeys("unsplash");
    console.log(`✓ Total Unsplash API keys configured: ${totalUnsplashKeys.length}`);
      
    } catch (error) {
      console.error("Failed to initialize API keys:", error);
    }
  }

  static async resetDailyUsage() {
    try {
      const storage = await getStorage();
      const geminiKeys = await storage.getApiKeys("gemini");
      const unsplashKeys = await storage.getApiKeys("unsplash");
      const allKeys = [...geminiKeys, ...unsplashKeys];
      
      const now = new Date();
      for (const key of allKeys) {
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