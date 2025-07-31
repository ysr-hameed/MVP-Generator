// Fallback MVP generation when AI services are unavailable
export function generateFallbackMvp(idea: string, industry: string, targetAudience: string, budget: string) {
  const budgetAmount = budget.includes("free") || budget.includes("$0") || budget.includes("Free") ? "free" :
                      budget.includes("low-budget") || budget.includes("$1,000") || budget.includes("$5,000") ? "low" :
                      budget.includes("under-10k") || budget.includes("$15,000") ? "medium" : "high";
  
  // Generate features based on the specific idea
  const generateIdeaSpecificFeatures = (idea: string) => {
    const baseFeatures = [
      "User registration and authentication",
      "User dashboard and profile management",
      "Search and discovery functionality",
      "Mobile-responsive design",
      "Basic analytics and reporting"
    ];
    
    // Add idea-specific features based on keywords
    const ideaLower = idea.toLowerCase();
    const specificFeatures = [];
    
    if (ideaLower.includes('social') || ideaLower.includes('community')) {
      specificFeatures.push("Social networking features", "User-generated content", "Community forums");
    }
    if (ideaLower.includes('e-commerce') || ideaLower.includes('shop') || ideaLower.includes('buy') || ideaLower.includes('sell')) {
      specificFeatures.push("Product catalog", "Shopping cart", "Payment processing", "Order management");
    }
    if (ideaLower.includes('booking') || ideaLower.includes('appointment') || ideaLower.includes('schedule')) {
      specificFeatures.push("Calendar integration", "Booking system", "Notification system");
    }
    if (ideaLower.includes('delivery') || ideaLower.includes('food') || ideaLower.includes('restaurant')) {
      specificFeatures.push("Location-based services", "Real-time tracking", "Delivery management");
    }
    if (ideaLower.includes('learning') || ideaLower.includes('education') || ideaLower.includes('course')) {
      specificFeatures.push("Content management", "Progress tracking", "Interactive learning tools");
    }
    
    return [...baseFeatures, ...specificFeatures].slice(0, 8);
  };
  
  const features = generateIdeaSpecificFeatures(idea);
  
  const techStacks = {
    "Food & Beverage": {
      frontend: "React Native for mobile app",
      backend: "Node.js with Express",
      database: "PostgreSQL",
      payment: "Stripe for payments",
      hosting: "Digital Ocean or AWS"
    },
    "E-commerce": {
      frontend: "Next.js or Shopify",
      backend: "Node.js with Express",
      database: "PostgreSQL",
      payment: "Stripe or PayPal",
      hosting: "Vercel or AWS"
    },
    "SaaS": {
      frontend: "React with TypeScript",
      backend: "Node.js or Python Django",
      database: "PostgreSQL",
      payment: "Stripe Billing",
      hosting: "AWS or Google Cloud"
    },
    "Health & Fitness": {
      frontend: "React Native for mobile app",
      backend: "Node.js with Express",
      database: "PostgreSQL",
      payment: "Stripe for subscriptions",
      hosting: "AWS or Digital Ocean"
    },
    "default": {
      frontend: "React with TypeScript",
      backend: "Node.js with Express",
      database: "PostgreSQL",
      payment: "Stripe",
      hosting: "Vercel or Railway"
    }
  };

  const selectedTech = techStacks[industry] || techStacks.default;

  const timelines = {
    free: { mvp: "16-24 weeks", launch: "6-8 months", growth: "12-18 months" },
    low: { mvp: "12-16 weeks", launch: "4-5 months", growth: "8-12 months" },
    medium: { mvp: "8-12 weeks", launch: "3-4 months", growth: "6-10 months" },
    high: { mvp: "6-10 weeks", launch: "2-3 months", growth: "4-8 months" }
  };

  const costs = {
    free: { development: "$0 - $500 (DIY approach)", monthly: "$0 - $50" },
    low: { development: "$1,000 - $8,000", monthly: "$100 - $300" },
    medium: { development: "$8,000 - $25,000", monthly: "$300 - $1,000" },
    high: { development: "$25,000 - $75,000", monthly: "$1,000 - $5,000" }
  };

  const industryFeatures = {
    "Health & Fitness": [
      "User profile with health metrics tracking",
      "Workout planning and scheduling system", 
      "Progress tracking with charts and analytics",
      "AI-powered personalized recommendations",
      "Social features for community engagement",
      "Integration with wearable devices",
      "Video content library for exercises",
      "Goal setting and achievement system"
    ],
    "E-commerce": [
      "Product catalog with search and filters",
      "Shopping cart and checkout system",
      "User accounts and order history",
      "Payment processing integration",
      "Inventory management dashboard",
      "Customer review and rating system",
      "Email notifications and order tracking"
    ],
    "default": [
      "User registration and authentication system",
      "Core functionality tailored to your business idea",
      "Intuitive user dashboard and interface",
      "Mobile-responsive design for all devices",
      "Basic analytics and user behavior tracking",
      "Search and filtering capabilities",
      "Admin panel for content management"
    ]
  };

  const features = industryFeatures[industry] || industryFeatures.default;

  return {
    coreFeatures: features,
    techStack: selectedTech,
    monetizationStrategy: `For ${industry.toLowerCase()}: Start with freemium model to build user base, then implement subscription tiers ($9.99-$49.99/month). Consider transaction fees (2-5%) for marketplace features, premium analytics, and white-label solutions for enterprise clients.`,
    
    howItWorks: `Your ${idea} will solve real problems by: 1) Identifying core user pain points in ${industry.toLowerCase()}, 2) Providing intuitive solutions through modern technology, 3) Creating seamless user experiences that save time and increase efficiency, 4) Building community features to enhance engagement and retention.`,
    
    competitiveAdvantage: `What makes this unique: Focus on user experience over feature complexity, leverage AI/ML for personalization, implement modern mobile-first design, provide superior customer support, and build strong community features that competitors lack.`,
    
    whyItWorks: `This concept succeeds because: ${targetAudience} increasingly demand digital solutions, the ${industry.toLowerCase()} market is growing rapidly, technology costs have decreased making development accessible, and there's proven demand for innovative approaches in this space.`,
    
    marketOpportunity: `Market potential: ${industry} sector valued at billions with 15-25% annual growth. Target audience of ${targetAudience.toLowerCase()} represents millions of potential users. Early market entry advantage with room for rapid scaling and geographic expansion.`,
    timeline: timelines[budgetAmount] || timelines.high,
    estimatedCost: costs[budgetAmount] || costs.high,
    marketAnalysis: {
      targetMarket: `${targetAudience} represents a growing market segment with increasing demand for digital solutions`,
      competition: `${industry} has established players but room for innovation and niche positioning`,
      opportunity: "Focus on unique value proposition and superior user experience to differentiate"
    },
    nextSteps: [
      "Conduct user interviews to validate the concept",
      "Create detailed wireframes and user flows",
      "Set up development environment and basic infrastructure",
      "Build core MVP features in priority order",
      "Test with beta users and gather feedback",
      "Prepare for launch with marketing and support systems"
    ]
  };
}