import { getStorage } from "../storage";

// Unsplash image service for blog content with API key rotation
export class UnsplashService {
  private static readonly BASE_URL = 'https://api.unsplash.com';
  private static currentKeyIndex = 0;
  private static accessKeys: string[] = [];

  // Initialize API keys from database and environment
  private static async initializeApiKeys() {
    try {
      const storage = await getStorage();
      const keys = await storage.getActiveApiKeys("unsplash");
      this.accessKeys = keys.map(k => k.key);

      // Fallback to environment variables if no keys in database
      if (this.accessKeys.length === 0) {
        const envKeys = [
          process.env.UNSPLASH_ACCESS_KEY,
          process.env.UNSPLASH_ACCESS_KEY_2,
          process.env.UNSPLASH_ACCESS_KEY_3
        ].filter(Boolean) as string[];

        this.accessKeys = envKeys;
      }

      // Use fallback key if no other keys available
      if (this.accessKeys.length === 0) {
        this.accessKeys = ['5Whf8VZKlSygYOSPFwAYaUEFwGBK-ZODFBn1vxguRgA'];
      }

      console.log(`Initialized ${this.accessKeys.length} Unsplash API keys`);
    } catch (error) {
      console.error("Failed to initialize Unsplash API keys:", error);
      // Fallback to environment or default key
      this.accessKeys = [
        process.env.UNSPLASH_ACCESS_KEY || '5Whf8VZKlSygYOSPFwAYaUEFwGBK-ZODFBn1vxguRgA'
      ];
    }
  }

  // Rotate to next available API key
  private static async rotateApiKey() {
    const startIndex = this.currentKeyIndex;
    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.accessKeys.length;
      const apiKey = this.accessKeys[this.currentKeyIndex];

      // Check if this key has exceeded daily limits
      try {
        const storage = await getStorage();
        const keyData = await storage.getApiKeyByValue(apiKey);
        if (keyData && (keyData.dailyUsage || 0) < 50) { // Assuming 50 requests per day limit
          console.log(`Rotated to API key index ${this.currentKeyIndex}`);
          return apiKey;
        }
      } catch (error) {
        console.log("Error checking key usage, continuing with rotation");
      }
    } while (this.currentKeyIndex !== startIndex);

    // Return current key even if at limit
    return this.accessKeys[this.currentKeyIndex];
  }

  // Get current API key with rotation support
  private static async getCurrentApiKey(): Promise<string> {
    if (this.accessKeys.length === 0) {
      await this.initializeApiKeys();
    }

    if (this.accessKeys.length === 0) {
      throw new Error("No Unsplash API keys available");
    }

    return this.accessKeys[this.currentKeyIndex];
  }

  // Track API usage
  private static async trackApiUsage(apiKey: string) {
    try {
      const storage = await getStorage();
      const keyData = await storage.getApiKeyByValue(apiKey);
      if (keyData) {
        await storage.incrementApiUsage(keyData.id);
      }
    } catch (error) {
      console.log("Failed to track API usage:", error);
    }
  }

  // Generate Unsplash image URL with specific parameters using proper API
  static async getImageUrl(searchTerm: string, width: number = 1200, height: number = 600): Promise<string> {
    let currentKey = await this.getCurrentApiKey();
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        // Clean and simplify search term - use only single word keywords
        let cleanTerm = searchTerm.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(' ')[0] // Take only first word
          .substring(0, 20); // Limit length
        
        // Map complex terms to simple ones
        const termMapping = {
          'validate': 'planning',
          'startup': 'business',
          'development': 'coding',
          'teamwork': 'office',
          'marketing': 'advertising',
          'finance': 'money',
          'technology': 'computer',
          'budgetfriendly': 'budget',
          'maximum': 'growth'
        };
        
        cleanTerm = termMapping[cleanTerm] || cleanTerm;

        console.log(`Fetching Unsplash image for: ${cleanTerm}`);

        // Use Unsplash API for high-quality, relevant images
        const response = await fetch(`${this.BASE_URL}/photos/random?query=${cleanTerm}&orientation=landscape&client_id=${currentKey}`, {
          headers: {
            'Accept': 'application/json',
            'Accept-Version': 'v1'
          }
        });

        if (response.ok) {
          const data = await response.json();

          // Track successful API usage
          await this.trackApiUsage(currentKey);

          // Return the regular image URL with proper dimensions
          const imageUrl = `${data.urls.raw}&w=${width}&h=${height}&fit=crop&crop=entropy&auto=format&q=80`;
          console.log(`Successfully fetched Unsplash image: ${imageUrl}`);
          return imageUrl;
        } else if (response.status === 403 || response.status === 429) {
          // Rate limit or quota exceeded, try rotating key
          console.log(`Unsplash API rate limit hit (${response.status}), rotating key...`);
          currentKey = await this.rotateApiKey();
          retryCount++;
          continue;
        } else {
          console.log(`Unsplash API response not ok: ${response.status} ${response.statusText}`);
          break;
        }
      } catch (error) {
        console.log(`Unsplash API error (attempt ${retryCount + 1}):`, error);
        retryCount++;
        if (retryCount < maxRetries) {
          // Try rotating key and retry
          currentKey = await this.rotateApiKey();
        }
      }
    }

    // Enhanced fallback with proper URL structure
    console.log(`Using fallback image source for: ${searchTerm}`);
    const cleanTerm = searchTerm.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '%20');
    return `https://source.unsplash.com/${width}x${height}/?${cleanTerm}`;
  }

  // Synchronous version for immediate use (fallback method)
  static getImageUrlSync(searchTerm: string, width: number = 1200, height: number = 600): string {
    // Clean search term for URL
    const cleanTerm = searchTerm.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '%20');

    // Use Unsplash Source API for random images
    return `https://source.unsplash.com/${width}x${height}/?${cleanTerm}`;
  }

  // Get hero image for article
  static getHeroImage(topic: string): string {
    const searchTerms = this.extractSearchTerms(topic);
    return this.getImageUrlSync(searchTerms[0] || 'business', 1200, 600);
  }

  // Get section images for article content
  static getSectionImages(topic: string, count: number = 3): string[] {
    const searchTerms = this.extractSearchTerms(topic);
    const images: string[] = [];

    // Generate different images for sections
    const sectionKeywords = [
      'startup+office', 'technology+innovation', 'business+meeting',
      'mobile+app+development', 'team+collaboration', 'digital+transformation',
      'entrepreneurship', 'product+development', 'user+experience'
    ];

    for (let i = 0; i < count; i++) {
      const keyword = searchTerms[i] || sectionKeywords[i] || 'business';
      images.push(this.getImageUrlSync(keyword, 800, 400));
    }

    return images;
  }

  // Get high-quality image using API (async version)
  static async getHighQualityImage(topic: string, width: number = 1200, height: number = 600): Promise<string> {
    const searchTerms = this.extractSearchTerms(topic);
    return await this.getImageUrl(searchTerms[0] || 'business', width, height);
  }

  // Extract relevant search terms from topic
  private static extractSearchTerms(topic: string): string[] {
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'why', 'when', 'where'];

    return topic
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5); // Take first 5 relevant terms
  }

  // Generate image with specific dimensions for different use cases
  static getCustomImage(searchTerm: string, width: number, height: number): string {
    return this.getImageUrlSync(searchTerm, width, height);
  }
}