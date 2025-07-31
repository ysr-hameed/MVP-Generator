// Unsplash image service for blog content
export class UnsplashService {
  private static readonly BASE_URL = 'https://api.unsplash.com';
  private static readonly ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '5Whf8VZKlSygYOSPFwAYaUEFwGBK-ZODFBn1vxguRgA';
  
  // Generate Unsplash image URL with specific parameters using proper API
  static async getImageUrl(searchTerm: string, width: number = 1200, height: number = 600): Promise<string> {
    try {
      // Clean search term
      const cleanTerm = searchTerm.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '+');
      
      // Use Unsplash API for high-quality, relevant images
      const response = await fetch(`${this.BASE_URL}/photos/random?query=${cleanTerm}&orientation=landscape&client_id=${this.ACCESS_KEY}`, {
        headers: {
          'Accept': 'application/json',
          'Accept-Version': 'v1'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Unsplash API response:', data);
        // Return the regular image URL with proper dimensions
        return `${data.urls.raw}&w=${width}&h=${height}&fit=crop&crop=entropy&auto=format&q=80`;
      } else {
        console.log('Unsplash API response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('Unsplash API error, using fallback:', error);
    }
    
    // Enhanced fallback with proper URL structure
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