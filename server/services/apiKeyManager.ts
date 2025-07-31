
import { getStorage } from "../storage";

export class ApiKeyManager {
  private static keyUsageCache = new Map<string, number>();
  private static lastRotationTime = new Map<string, number>();

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
    try {
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
        process.env.GEMINI_API_KEY_5,
        process.env.GEMINI_API_KEY_6,
        process.env.GEMINI_API_KEY_7,
        process.env.GEMINI_API_KEY_8,
        process.env.GEMINI_API_KEY_9,
        process.env.GEMINI_API_KEY_10
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
    } catch (error) {
      console.error("Failed to initialize Gemini keys:", error);
    }
  }

  private static async initializeUnsplashKeys(storage: any) {
    try {
      // Add Unsplash API keys from environment
      const unsplashKeys = [
        process.env.UNSPLASH_ACCESS_KEY,
        process.env.UNSPLASH_ACCESS_KEY_2,
        process.env.UNSPLASH_ACCESS_KEY_3,
        process.env.UNSPLASH_ACCESS_KEY_4,
        process.env.UNSPLASH_ACCESS_KEY_5
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
      console.error("Failed to initialize Unsplash keys:", error);
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
        const lastReset = new Date(key.lastReset || key.createdAt);
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

        // Reset daily usage if more than 24 hours have passed
        if (hoursSinceReset >= 24) {
          await storage.updateApiKey(key.id, {
            dailyUsage: 0,
            lastReset: now,
            isActive: true
          });
          console.log(`✓ Reset daily usage for API key ${key.id.substring(0, 8)}...`);
          
          // Clear cache for this key
          this.keyUsageCache.delete(key.key);
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
        const dailyLimit = keyData.provider === "gemini" ? 1000 : 500;
        const isActive = newUsage < dailyLimit;

        await storage.updateApiKey(keyData.id, {
          dailyUsage: newUsage,
          isActive: isActive
        });

        // Update cache
        this.keyUsageCache.set(apiKey, newUsage);

        if (!isActive) {
          console.log(`⚠️ API key ${keyData.id.substring(0, 8)}... reached daily limit (${newUsage}/${dailyLimit})`);
        }
      }
    } catch (error) {
      console.error("Failed to increment API usage:", error);
    }
  }

  static async getAvailableApiKey(provider: string, retryCount = 0): Promise<string | null> {
    try {
      const storage = await getStorage();
      let keys = await storage.getActiveApiKeys(provider);
      
      if (keys.length === 0) {
        console.log(`No active ${provider} API keys found`);
        return null;
      }

      // Sort keys by usage (lowest first) to distribute load evenly
      keys = keys.sort((a, b) => a.dailyUsage - b.dailyUsage);

      const dailyLimit = provider === "gemini" ? 1000 : 500;
      
      // Find a key that hasn't exceeded daily limits
      for (const key of keys) {
        const currentUsage = this.keyUsageCache.get(key.key) || key.dailyUsage;
        
        if (currentUsage < dailyLimit && key.isActive) {
          // Basic key format validation
          const isValidFormat = provider === "gemini" 
            ? key.key.startsWith("AIza") && key.key.length > 30
            : key.key.length > 20;
            
          if (isValidFormat) {
            console.log(`Using ${provider} API key: ${key.key.substring(0, 8)}... (Usage: ${currentUsage}/${dailyLimit})`);
            return key.key;
          } else {
            console.warn(`Invalid ${provider} API key format: ${key.key.substring(0, 8)}...`);
            // Deactivate invalid key
            await storage.updateApiKey(key.id, { isActive: false });
          }
        }
      }

      // If no keys available, try to reset and retry once
      if (retryCount === 0) {
        console.log(`No available ${provider} API keys, attempting reset...`);
        await this.resetDailyUsage();
        return await this.getAvailableApiKey(provider, 1);
      }

      console.log(`No valid ${provider} API keys available - all have exceeded daily limits or are invalid`);
      return null;
    } catch (error) {
      console.error(`Failed to get ${provider} API key:`, error);
      return null;
    }
  }

  static async handleApiError(apiKey: string, error: any): Promise<string | null> {
    try {
      const storage = await getStorage();
      const keyData = await storage.getApiKeyByValue(apiKey);
      
      if (!keyData) return null;

      console.log(`API error for key ${keyData.id.substring(0, 8)}...:`, error.message || error);

      // Check if it's a quota exceeded error
      const isQuotaError = error.message?.includes('quota') || 
                          error.message?.includes('limit') ||
                          error.status === 429;

      if (isQuotaError) {
        // Temporarily disable this key
        await storage.updateApiKey(keyData.id, {
          isActive: false,
          dailyUsage: 999999 // Mark as exceeded
        });
        
        console.log(`🔄 Rotating to next ${keyData.provider} API key due to quota error`);
        
        // Get next available key
        return await this.getAvailableApiKey(keyData.provider);
      }

      // For other errors, just log and continue with same key
      return apiKey;
    } catch (error) {
      console.error("Failed to handle API error:", error);
      return null;
    }
  }

  static async rotateToNextKey(provider: string): Promise<string | null> {
    const now = Date.now();
    const lastRotation = this.lastRotationTime.get(provider) || 0;
    
    // Prevent too frequent rotations (min 5 seconds between rotations)
    if (now - lastRotation < 5000) {
      console.log(`Rate limiting ${provider} key rotation`);
      return null;
    }
    
    this.lastRotationTime.set(provider, now);
    
    try {
      const storage = await getStorage();
      const keys = await storage.getActiveApiKeys(provider);

      if (keys.length === 0) {
        return null;
      }

      // Find the next available key with lowest usage
      const availableKeys = keys.filter(key => {
        const dailyLimit = provider === "gemini" ? 1000 : 500;
        const currentUsage = this.keyUsageCache.get(key.key) || key.dailyUsage;
        return currentUsage < dailyLimit && key.isActive;
      });

      if (availableKeys.length === 0) {
        console.log(`No available ${provider} keys for rotation`);
        return null;
      }

      // Sort by usage and return the one with lowest usage
      availableKeys.sort((a, b) => {
        const usageA = this.keyUsageCache.get(a.key) || a.dailyUsage;
        const usageB = this.keyUsageCache.get(b.key) || b.dailyUsage;
        return usageA - usageB;
      });

      const selectedKey = availableKeys[0];
      console.log(`🔄 Rotated to ${provider} key: ${selectedKey.key.substring(0, 8)}...`);
      
      return selectedKey.key;
    } catch (error) {
      console.error("Failed to rotate API key:", error);
      return null;
    }
  }

  static async getKeyStats(provider: string) {
    try {
      const storage = await getStorage();
      const keys = await storage.getApiKeys(provider);
      
      const stats = {
        total: keys.length,
        active: keys.filter(k => k.isActive).length,
        dailyLimitReached: keys.filter(k => {
          const limit = provider === "gemini" ? 1000 : 500;
          return k.dailyUsage >= limit;
        }).length,
        totalUsage: keys.reduce((sum, k) => sum + k.dailyUsage, 0)
      };

      return stats;
    } catch (error) {
      console.error("Failed to get key stats:", error);
      return null;
    }
  }
}
