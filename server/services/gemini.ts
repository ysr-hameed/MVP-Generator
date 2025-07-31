import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStorage } from "../storage";

interface MvpPlan {
  coreFeatures: string[];
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    payment?: string;
    hosting?: string;
  };
  monetizationStrategy: string;
  timeline: {
    mvp: string;
    launch: string;
    growth: string;
  };
  estimatedCost: {
    development: string;
    monthly: string;
  };
  marketAnalysis: {
    targetMarket: string;
    competition: string;
    opportunity: string;
  };
  nextSteps: string[];
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private currentKeyIndex = 0;
  private apiKeys: string[] = [];

  constructor() {
    this.initializeApiKeys();
  }

  private async initializeApiKeys() {
    try {
      const storage = await getStorage();
      const keys = await storage.getActiveApiKeys("gemini");
      this.apiKeys = keys.map(k => k.key);

      // Fallback to environment variable if no keys in database
      if (this.apiKeys.length === 0 && process.env.GEMINI_API_KEY) {
        this.apiKeys = [process.env.GEMINI_API_KEY];
      }

      if (this.apiKeys.length > 0) {
        this.genAI = new GoogleGenerativeAI(this.apiKeys[0]);
      }
    } catch (error) {
      console.error("Failed to initialize Gemini API keys:", error);
      if (process.env.GEMINI_API_KEY) {
        this.apiKeys = [process.env.GEMINI_API_KEY];
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      }
    }
  }

  private async rotateApiKey() {
    const startIndex = this.currentKeyIndex;
    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      const apiKey = this.apiKeys[this.currentKeyIndex];

      // Check if this key has exceeded daily limits
      const storage = await getStorage();
      const keyData = await storage.getApiKeyByValue(apiKey);
      if (keyData && (keyData.dailyUsage || 0) < 50) { // Assuming 50 requests per day limit for free tier
        this.genAI = new GoogleGenerativeAI(apiKey);
        return;
      }
    } while (this.currentKeyIndex !== startIndex);

    // If all keys are at limit, use the first one anyway (it will fail but that's expected)
    this.genAI = new GoogleGenAI({ apiKey: this.apiKeys[0] });
  }

  async generateMvpPlan(
    idea: string,
    industry: string,
    targetAudience: string,
    budget: string
  ): Promise<MvpPlan> {
    // Ensure API is initialized before use
    if (!this.genAI || this.apiKeys.length === 0) {
      await this.initializeApiKeys();
    }
    
    if (!this.genAI) {
      console.log("Gemini API not available, using fallback MVP generation");
      const { generateFallbackMvp } = await import("./fallbackMvp");
      return generateFallbackMvp(idea, industry, targetAudience, budget);
    }

    const prompt = `
You are an expert startup advisor and product strategist. Based on the following startup idea, generate a comprehensive MVP plan.

Startup Idea: ${idea}
Industry: ${industry}
Target Audience: ${targetAudience}
Budget Range: ${budget}

Please provide a detailed MVP plan with the following structure. Respond ONLY with valid JSON:

{
  "coreFeatures": ["list of 5-8 essential features for MVP"],
  "techStack": {
    "frontend": "recommended frontend technology",
    "backend": "recommended backend technology", 
    "database": "recommended database",
    "payment": "payment processor if applicable",
    "hosting": "hosting/deployment platform"
  },
  "monetizationStrategy": "detailed monetization approach with specific revenue models",
  "timeline": {
    "mvp": "time to build MVP",
    "launch": "time to market launch",
    "growth": "growth phase timeline"
  },
  "estimatedCost": {
    "development": "development cost estimate",
    "monthly": "monthly operational cost estimate"
  },
  "marketAnalysis": {
    "targetMarket": "size and characteristics of target market",
    "competition": "key competitors and differentiation",
    "opportunity": "market opportunity and potential"
  },
  "nextSteps": ["list of immediate actionable steps to get started"]
}

Focus on practical, actionable advice that considers the budget constraints and industry context. Be specific and realistic in your recommendations.
`;

    try {
      const model = this.genAI!.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Track API usage
      if (this.apiKeys[this.currentKeyIndex]) {
        const storage = await getStorage();
        const keyData = await storage.getApiKeyByValue(this.apiKeys[this.currentKeyIndex]);
        if (keyData) {
          await storage.incrementApiUsage(keyData.id);
        }
      }

      // Parse JSON response
      const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
      const mvpPlan = JSON.parse(cleanedText) as MvpPlan;

      return mvpPlan;
    } catch (error: any) {
      console.error("Gemini API error:", error);

      // Try rotating API key if rate limited, service unavailable, or overloaded
      if (error.message?.includes("quota") || error.message?.includes("limit") || error.message?.includes("429") || error.message?.includes("503") || error.message?.includes("overloaded") || error.message?.includes("UNAVAILABLE")) {
        if (this.apiKeys.length > 1) {
          console.log(`API key limit reached, rotating to next key. Current index: ${this.currentKeyIndex}`);
          await this.rotateApiKey();

          // Retry with new key
          try {
            const model = this.genAI!.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Track API usage for retry
            if (this.apiKeys[this.currentKeyIndex]) {
              const storage = await getStorage();
              const keyData = await storage.getApiKeyByValue(this.apiKeys[this.currentKeyIndex]);
              if (keyData) {
                await storage.incrementApiUsage(keyData.id);
              }
            }

            const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
            const mvpPlan = JSON.parse(cleanedText) as MvpPlan;

            return mvpPlan;
          } catch (retryError: any) {
            console.error("Retry failed:", retryError);
            if (retryError.message?.includes("quota") || retryError.message?.includes("limit")) {
              throw new Error("All API keys have reached their daily limits. Please try again tomorrow or add more API keys.");
            }
            throw new Error("AI service temporarily unavailable. Please try again later.");
          }
        } else {
          console.log("All API keys exhausted, using fallback MVP generation");
          // Use fallback MVP generation if all AI services fail
          const { generateFallbackMvp } = await import("./fallbackMvp");
          return generateFallbackMvp(idea, industry, targetAudience, budget);
        }
      }

      // Use fallback MVP generation if AI fails
      const { generateFallbackMvp } = await import("./fallbackMvp");
      console.log("Using fallback MVP generation due to AI service issues");
      return generateFallbackMvp(idea, industry, targetAudience, budget);
    }
  }

  async generateContent(prompt: string): Promise<string> {
    // Ensure API is initialized before use
    if (!this.genAI || this.apiKeys.length === 0) {
      await this.initializeApiKeys();
    }
    
    if (!this.genAI || this.apiKeys.length === 0) {
      throw new Error("No valid Gemini API keys available");
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Track API usage
      if (this.apiKeys[this.currentKeyIndex]) {
        const storage = await getStorage();
        const keyData = await storage.getApiKeyByValue(this.apiKeys[this.currentKeyIndex]);
        if (keyData) {
          await storage.incrementApiUsage(keyData.id);
        }
      }

      return text;
    } catch (error: any) {
      console.error("Gemini content generation error:", error);
      
      // Try rotating API key if rate limited
      if (error.message?.includes("quota") || error.message?.includes("limit") || error.message?.includes("429")) {
        if (this.apiKeys.length > 1) {
          console.log("API key limit reached, rotating to next key");
          await this.rotateApiKey();
          
          // Retry with new key
          try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            throw new Error("All API keys exhausted or invalid");
          }
        }
      }
      
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

export const geminiService = new GeminiService();