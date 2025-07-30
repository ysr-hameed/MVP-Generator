// Fallback MVP generation when AI services are unavailable
export function generateFallbackMvp(idea: string, industry: string, targetAudience: string, budget: string) {
  const budgetAmount = budget.includes("$10,000") ? "low" : 
                      budget.includes("$50,000") ? "medium" : "high";
  
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
    "default": {
      frontend: "React or Vue.js",
      backend: "Node.js with Express",
      database: "PostgreSQL or MongoDB",
      payment: "Stripe",
      hosting: "Vercel or Netlify"
    }
  };

  const selectedTech = techStacks[industry] || techStacks.default;

  const timelines = {
    low: { mvp: "8-12 weeks", launch: "3-4 months", growth: "6-12 months" },
    medium: { mvp: "6-10 weeks", launch: "2-3 months", growth: "4-8 months" },
    high: { mvp: "4-8 weeks", launch: "1-2 months", growth: "3-6 months" }
  };

  const costs = {
    low: { development: "$8,000 - $15,000", monthly: "$200 - $500" },
    medium: { development: "$15,000 - $35,000", monthly: "$500 - $1,500" },
    high: { development: "$35,000 - $75,000", monthly: "$1,500 - $5,000" }
  };

  return {
    coreFeatures: [
      "User registration and authentication",
      "Core functionality based on your idea",
      "Basic user interface and experience",
      "Payment processing (if applicable)",
      "Admin dashboard for management"
    ],
    techStack: selectedTech,
    monetizationStrategy: `For ${industry.toLowerCase()}, consider: subscription model for recurring revenue, transaction fees if marketplace, freemium model to attract users, and premium features for advanced functionality.`,
    timeline: timelines[budgetAmount],
    estimatedCost: costs[budgetAmount],
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