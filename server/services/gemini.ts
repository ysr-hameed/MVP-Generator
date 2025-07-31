import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiKeyManager } from "./apiKeyManager";

export class GeminiService {
  private model = "gemini-1.5-flash";

  constructor() {
    // Initialize API key manager on service creation
    ApiKeyManager.initialize().catch(console.error);
  }

  async generateText(prompt: string, retries = 3): Promise<string> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const currentApiKey = await ApiKeyManager.getCurrentGeminiKey();
        if (!currentApiKey) {
          throw new Error("No Gemini API keys available");
        }

        const genAI = new GoogleGenerativeAI(currentApiKey);
        const model = genAI.getGenerativeModel({ model: this.model });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
      } catch (error: any) {
        console.error(`Gemini API error (attempt ${attempt + 1}/${retries + 1}):`, error.message);

        // Handle API key rotation on errors
        const rotated = await ApiKeyManager.handleApiError("gemini", error);

        if (attempt < retries && rotated) {
          console.log(`🔄 Retrying with rotated API key...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }

        // If no more retries
        if (attempt >= retries) {
          throw new Error(`Gemini API failed after ${retries + 1} attempts: ${error.message}`);
        }
      }
    }

    throw new Error("Unexpected error in generateContent");
  }

  async generateJSON<T = any>(prompt: string, retries = 3): Promise<T> {
    const text = await this.generateText(prompt, retries);
    
    try {
      // Clean the response text to extract JSON
      let cleanedText = text.trim();
      
      // Remove markdown code blocks if present
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.log("Raw response:", text);
      throw new Error("Failed to parse JSON response from Gemini");
    }
  }
}

export const geminiService = new GeminiService();