import { getStorage } from "../storage";

export class ApiKeyManager {
  private static geminiKeys: string[] = [];
  private static unsplashKeys: string[] = [];
  private static currentGeminiIndex = 0;
  private static currentUnsplashIndex = 0;
  private static lastRotation = Date.now();
  private static rotationInterval = 60000; // 1 minute

  static async initialize() {
    await this.loadApiKeys();
    console.log(`✓ API Key Manager initialized with ${this.geminiKeys.length} Gemini keys and ${this.unsplashKeys.length} Unsplash keys`);
  }

  private static async loadApiKeys() {
    try {
      const storage = await getStorage();

      // Load Gemini API keys
      const geminiKeys = await storage.getActiveApiKeys("gemini");
      this.geminiKeys = geminiKeys.map(k => k.key);

      // Load Unsplash API keys
      const unsplashKeys = await storage.getActiveApiKeys("unsplash");
      this.unsplashKeys = unsplashKeys.map(k => k.key);

      console.log(`🔄 Loaded from database: ${this.geminiKeys.length} Gemini keys, ${this.unsplashKeys.length} Unsplash keys`);

      // Show partial keys for verification
      this.geminiKeys.forEach((key, index) => {
        console.log(`  Gemini Key ${index + 1}: ${key.substring(0, 8)}...`);
      });

      this.unsplashKeys.forEach((key, index) => {
        console.log(`  Unsplash Key ${index + 1}: ${key.substring(0, 8)}...`);
      });

    } catch (error) {
      console.error("Failed to load API keys from database:", error);

      // Fallback to environment variables
      const geminiEnv = process.env.GEMINI_API_KEY;
      const unsplashEnv = process.env.UNSPLASH_API_KEY;

      if (geminiEnv) {
        this.geminiKeys = [geminiEnv];
        console.log("✓ Using environment GEMINI_API_KEY as fallback");
      }

      if (unsplashEnv) {
        this.unsplashKeys = [unsplashEnv];
        console.log("✓ Using environment UNSPLASH_API_KEY as fallback");
      }
    }
  }

  static async getCurrentGeminiKey(): Promise<string | null> {
    if (this.geminiKeys.length === 0) {
      await this.loadApiKeys();
    }

    if (this.geminiKeys.length === 0) {
      console.error("❌ No Gemini API keys available");
      return null;
    }

    // Auto-rotate keys every minute or on demand
    if (Date.now() - this.lastRotation > this.rotationInterval) {
      this.rotateGeminiKey();
    }

    return this.geminiKeys[this.currentGeminiIndex];
  }

  static async getCurrentUnsplashKey(): Promise<string | null> {
    if (this.unsplashKeys.length === 0) {
      await this.loadApiKeys();
    }

    if (this.unsplashKeys.length === 0) {
      console.error("❌ No Unsplash API keys available");
      return null;
    }

    return this.unsplashKeys[this.currentUnsplashIndex];
  }

  static rotateGeminiKey() {
    if (this.geminiKeys.length > 1) {
      this.currentGeminiIndex = (this.currentGeminiIndex + 1) % this.geminiKeys.length;
      this.lastRotation = Date.now();
      console.log(`🔄 Rotated to Gemini key ${this.currentGeminiIndex + 1}/${this.geminiKeys.length}`);
    }
  }

  static rotateUnsplashKey() {
    if (this.unsplashKeys.length > 1) {
      this.currentUnsplashIndex = (this.currentUnsplashIndex + 1) % this.unsplashKeys.length;
      console.log(`🔄 Rotated to Unsplash key ${this.currentUnsplashIndex + 1}/${this.unsplashKeys.length}`);
    }
  }

  static async handleApiError(provider: string, error: any) {
    console.error(`API Error for ${provider}:`, error.message);

    if (provider === "gemini" && this.geminiKeys.length > 1) {
      console.log("🔄 Rotating Gemini key due to error");
      this.rotateGeminiKey();
      return true;
    }

    if (provider === "unsplash" && this.unsplashKeys.length > 1) {
      console.log("🔄 Rotating Unsplash key due to error");
      this.rotateUnsplashKey();
      return true;
    }

    return false;
  }

  static async refreshKeys() {
    console.log("🔄 Refreshing API keys from database...");
    await this.loadApiKeys();
  }

  static async resetDailyUsage() {
    try {
      const storage = await getStorage();
      await storage.resetDailyUsage();
      console.log("✓ Daily API usage reset completed");
    } catch (error) {
      console.error("Failed to reset daily usage:", error);
    }
  }

  static getKeyStats() {
    return {
      gemini: {
        total: this.geminiKeys.length,
        current: this.currentGeminiIndex + 1
      },
      unsplash: {
        total: this.unsplashKeys.length,
        current: this.currentUnsplashIndex + 1
      },
      lastRotation: new Date(this.lastRotation).toISOString()
    };
  }
}