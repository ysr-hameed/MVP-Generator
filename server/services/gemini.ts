import { GoogleGenAI } from "@google/genai";
import { storage } from "../storage";

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
  private genAI: GoogleGenAI | null = null;
  private currentKeyIndex = 0;
  private apiKeys: string[] = [];

  constructor() {
    this.initializeApiKeys();
  }

  private async initializeApiKeys() {
    try {
      const keys = await storage.getActiveApiKeys("gemini");
      this.apiKeys = keys.map(k => k.key);

      // Fallback to environment variable if no keys in database
      if (this.apiKeys.length === 0 && process.env.GEMINI_API_KEY) {
        this.apiKeys = [process.env.GEMINI_API_KEY];
      }

      if (this.apiKeys.length > 0) {
        this.genAI = new GoogleGenAI({ apiKey: this.apiKeys[0] });
      }
    } catch (error) {
      console.error("Failed to initialize Gemini API keys:", error);
      if (process.env.GEMINI_API_KEY) {
        this.apiKeys = [process.env.GEMINI_API_KEY];
        this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      }
    }
  }

  private async rotateApiKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    this.genAI = new GoogleGenAI({ apiKey: this.apiKeys[this.currentKeyIndex] });
  }

  async generateMvpPlan(
    idea: string,
    industry: string,
    targetAudience: string,
    budget: string
  ): Promise<MvpPlan> {
    if (!this.genAI) {
      throw new Error("Gemini API not initialized. Please configure API keys.");
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
      const response = await this.genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });
      const text = response.text;

      // Parse JSON response
      const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
      const mvpPlan = JSON.parse(cleanedText) as MvpPlan;

      return mvpPlan;
    } catch (error: any) {
      console.error("Gemini API error:", error);

      // Try rotating API key if rate limited
      if (error.message?.includes("quota") || error.message?.includes("limit")) {
        if (this.apiKeys.length > 1) {
          await this.rotateApiKey();
          // Retry once with new key
          try {
            const response = await this.genAI!.models.generateContent({
              model: "gemini-1.5-flash",
              contents: prompt,
            });
            const text = response.text;

            const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
            const mvpPlan = JSON.parse(cleanedText) as MvpPlan;

            return mvpPlan;
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            throw new Error("AI service temporarily unavailable. Please try again later.");
          }
        }
      }

      throw new Error("Failed to generate MVP plan. Please try again.");
    }
  }

  async generateContent(prompt: string): Promise<string> {
    const apiKey = await storage.getActiveApiKey("gemini");
    if (!apiKey) {
      throw new Error("No active Gemini API key found");
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("No content generated by Gemini");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini content generation error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();