import { geminiService } from "./gemini";

interface EnhancedMvpPlan {
  coreFeatures: string[];
  technicalRequirements: {
    frontend: string;
    backend: string;
    database: string;
    thirdPartyServices: string[];
    payment?: string;
    hosting?: string;
    analytics?: string;
  };
  monetizationStrategy: {
    primary: string;
    secondary: string[];
    pricingModel: string;
    revenueProjections: {
      month3: string;
      month6: string;
      year1: string;
    };
  };
  timeline: {
    planning: string;
    mvp: string;
    beta: string;
    launch: string;
    growth: string;
  };
  budgetBreakdown: {
    development: {
      frontend: string;
      backend: string;
      design: string;
      testing: string;
    };
    operational: {
      hosting: string;
      thirdPartyServices: string;
      marketing: string;
      maintenance: string;
    };
    total: {
      initial: string;
      monthly: string;
      yearly: string;
    };
  };
  marketAnalysis: {
    targetMarket: string;
    marketSize: string;
    competition: string[];
    competitiveAdvantage: string;
    risks: string[];
    opportunities: string[];
  };
  userPersonas: {
    name: string;
    demographics: string;
    painPoints: string[];
    motivations: string[];
    behavior: string;
  }[];
  featureRoadmap: {
    phase1: string[];
    phase2: string[];
    phase3: string[];
    futureFeatures: string[];
  };
  metrics: {
    acquisitionTargets: string[];
    retentionTargets: string[];
    revenueTargets: string[];
    keyPerformanceIndicators: string[];
  };
  riskMitigation: {
    technical: string[];
    market: string[];
    financial: string[];
    operational: string[];
  };
  nextSteps: {
    immediate: string[];
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
}

export class EnhancedMvpGenerator {
  async generateComprehensiveMvp(
    idea: string,
    industry?: string,
    targetAudience?: string,
    budget?: string
  ): Promise<EnhancedMvpPlan> {
    const currentYear = new Date().getFullYear();
    const currentTrends = this.getCurrentTechTrends();

    const enhancedPrompt = `
You are an expert startup advisor and technical architect with deep knowledge of successful startups and emerging technologies. Generate the MOST COMPREHENSIVE, INNOVATIVE and BEST-IN-CLASS MVP plan for ${currentYear}.

**SPECIFIC STARTUP IDEA TO ANALYZE:** "${idea}"
**INDUSTRY CONTEXT:** ${industry || "Technology/Software"}
**TARGET AUDIENCE:** ${targetAudience || "General consumers and businesses"}
**BUDGET CONSTRAINT:** ${budget || "Flexible budget"}

CRITICAL INSTRUCTIONS:
- Create the BEST POSSIBLE plan with maximum innovation and earning potential
- Focus on UNIQUE features that competitors don't have
- Include MULTIPLE creative earning strategies (at least 5-7 different revenue streams)
- Think outside the box and suggest cutting-edge solutions
- Include growth hacking strategies and viral mechanisms
- Focus on scalability and long-term value creation
- Base ALL recommendations specifically on "${idea}" - analyze this exact business concept

EMERGING BUSINESS MODELS TO CONSIDER:
- AI-as-a-Service (AIaaS) integration
- Community-driven marketplaces
- Subscription + usage-based hybrid models
- Creator economy integrations
- Web3 and tokenization opportunities
- Micro-SaaS and vertical specialization
- Data monetization strategies
- API marketplace creation

**Current Tech Trends (${currentYear}):** ${currentTrends}

Analyze the specific idea "${idea}" and create a comprehensive MVP plan that includes:

1. **Core Features Analysis** - Identify the 5-8 essential features specifically needed for "${idea}" to work
2. **Technical Architecture** - Recommend technologies that best fit this specific business model
3. **Monetization Strategy** - Revenue models that align with "${idea}" and its target users
4. **Development Timeline** - Realistic phases specifically for building "${idea}"
5. **Budget Analysis** - Costs tailored to the complexity and requirements of "${idea}"
6. **Market Analysis** - Competition and opportunities specific to this business concept
7. **User Personas** - Who would actually use "${idea}" and why
8. **Feature Roadmap** - How to evolve "${idea}" from MVP to full product
9. **Success Metrics** - KPIs that matter for measuring "${idea}" success
10. **Risk Assessment** - Challenges specific to "${idea}" and solutions
11. **Next Steps** - Immediate actions to start building "${idea}"

Focus on:
- Latest ${currentYear} technology trends and best practices
- Realistic cost estimates based on current market rates
- Scalable architecture that can handle growth
- Modern monetization strategies (SaaS, freemium, marketplace, etc.)
- Data-driven decision making and analytics
- Competitive differentiation strategies
- User acquisition and retention strategies

Return response in this exact JSON structure:
{
  "coreFeatures": ["feature 1", "feature 2", "..."],
  "technicalRequirements": {
    "frontend": "recommended frontend technology",
    "backend": "recommended backend technology", 
    "database": "recommended database",
    "thirdPartyServices": ["service 1", "service 2"],
    "payment": "payment processor",
    "hosting": "hosting solution",
    "analytics": "analytics platform"
  },
  "monetizationStrategy": {
    "primary": "main revenue stream",
    "secondary": ["additional revenue streams"],
    "pricingModel": "pricing strategy",
    "revenueProjections": {
      "month3": "3-month revenue estimate",
      "month6": "6-month revenue estimate", 
      "year1": "1-year revenue estimate"
    }
  },
  "timeline": {
    "planning": "planning phase duration",
    "mvp": "MVP development timeline",
    "beta": "beta testing period",
    "launch": "launch preparation time",
    "growth": "growth phase timeline"
  },
  "budgetBreakdown": {
    "development": {
      "frontend": "frontend development cost",
      "backend": "backend development cost",
      "design": "design cost",
      "testing": "testing cost"
    },
    "operational": {
      "hosting": "monthly hosting cost",
      "thirdPartyServices": "monthly service costs",
      "marketing": "monthly marketing budget",
      "maintenance": "monthly maintenance cost"
    },
    "total": {
      "initial": "total initial investment",
      "monthly": "monthly operational cost",
      "yearly": "estimated yearly cost"
    }
  },
  "marketAnalysis": {
    "targetMarket": "detailed target market description",
    "marketSize": "addressable market size",
    "competition": ["competitor 1", "competitor 2", "competitor 3"],
    "competitiveAdvantage": "unique value proposition",
    "risks": ["risk 1", "risk 2"],
    "opportunities": ["opportunity 1", "opportunity 2"]
  },
  "userPersonas": [
    {
      "name": "Primary User Type",
      "demographics": "age, location, income, etc.",
      "painPoints": ["pain point 1", "pain point 2"],
      "motivations": ["motivation 1", "motivation 2"],
      "behavior": "user behavior description"
    }
  ],
  "featureRoadmap": {
    "phase1": ["MVP features"],
    "phase2": ["early growth features"],
    "phase3": ["scale features"],
    "futureFeatures": ["long-term vision features"]
  },
  "metrics": {
    "acquisitionTargets": ["user acquisition goals"],
    "retentionTargets": ["retention goals"],
    "revenueTargets": ["revenue milestones"],
    "keyPerformanceIndicators": ["KPI 1", "KPI 2"]
  },
  "riskMitigation": {
    "technical": ["technical risk solutions"],
    "market": ["market risk solutions"],
    "financial": ["financial risk solutions"],
    "operational": ["operational risk solutions"]
  },
  "nextSteps": {
    "immediate": ["actions for this week"],
    "shortTerm": ["actions for this month"],
    "mediumTerm": ["actions for next 3 months"],
    "longTerm": ["actions for next 6-12 months"]
  }
}

Make recommendations specific to ${currentYear} trends and technologies. Be practical, actionable, and realistic.
`;

    try {
      const response = await geminiService.generateText(enhancedPrompt);
      const cleanedResponse = response.replace(/```json\s*|\s*```/g, '').trim();
      return JSON.parse(cleanedResponse) as EnhancedMvpPlan;
    } catch (error) {
      console.error("Enhanced MVP generation failed:", error);
      // Return a comprehensive fallback plan
      return this.generateFallbackEnhancedPlan(idea, industry, targetAudience, budget);
    }
  }

  private getCurrentTechTrends(): string {
    return `
- AI Integration (LLMs, Vector Databases, RAG)
- Edge Computing and CDN optimization
- Progressive Web Apps (PWAs)
- Serverless Architecture (Vercel, Netlify, AWS Lambda)
- Real-time features (WebSockets, Server-Sent Events)
- Modern CSS (Container Queries, CSS Grid, Tailwind CSS)
- TypeScript adoption and type safety
- Mobile-first responsive design
- API-first development (GraphQL, tRPC)
- Micro-frontends and component libraries
- Modern payment systems (Stripe, PayPal, crypto)
- Advanced analytics and user tracking
- Security-first development (Zero Trust, OAuth 2.1)
- Cloud-native deployment (Docker, Kubernetes)
- Performance optimization (Core Web Vitals)
`;
  }

  private generateFallbackEnhancedPlan(
    idea: string,
    industry?: string,
    targetAudience?: string,
    budget?: string
  ): EnhancedMvpPlan {
    return {
      coreFeatures: [
        "User authentication and profiles",
        "Core functionality based on your idea",
        "Dashboard for user management",
        "Basic analytics and reporting",
        "Mobile-responsive interface"
      ],
      technicalRequirements: {
        frontend: "React 18 with TypeScript and Tailwind CSS",
        backend: "Node.js with Express and TypeScript",
        database: "PostgreSQL with Drizzle ORM",
        thirdPartyServices: ["Authentication (Auth0/Clerk)", "Email service", "Analytics"],
        payment: "Stripe for payment processing",
        hosting: "Vercel for frontend, Railway/Render for backend",
        analytics: "Google Analytics 4 and Mixpanel"
      },
      monetizationStrategy: {
        primary: "Subscription-based SaaS model",
        secondary: ["Transaction fees", "Premium features", "API access"],
        pricingModel: "Freemium with tiered pricing",
        revenueProjections: {
          month3: "$2,500 - $5,000 MRR",
          month6: "$10,000 - $20,000 MRR",
          year1: "$50,000 - $100,000 ARR"
        }
      },
      timeline: {
        planning: "2-3 weeks",
        mvp: "8-12 weeks",
        beta: "4-6 weeks",
        launch: "2-4 weeks",
        growth: "6-12 months"
      },
      budgetBreakdown: {
        development: {
          frontend: "$8,000 - $15,000",
          backend: "$10,000 - $20,000",
          design: "$3,000 - $8,000",
          testing: "$2,000 - $5,000"
        },
        operational: {
          hosting: "$100 - $500/month",
          thirdPartyServices: "$200 - $800/month",
          marketing: "$1,000 - $5,000/month",
          maintenance: "$500 - $2,000/month"
        },
        total: {
          initial: "$25,000 - $50,000",
          monthly: "$1,800 - $8,300",
          yearly: "$46,600 - $149,600"
        }
      },
      marketAnalysis: {
        targetMarket: targetAudience || "Digital-first consumers and businesses",
        marketSize: "Estimated $50M - $500M addressable market",
        competition: ["Established players", "New startups", "Enterprise solutions"],
        competitiveAdvantage: "Modern UX, AI integration, competitive pricing",
        risks: ["Market saturation", "Technical challenges", "Funding requirements"],
        opportunities: ["Growing market", "Technology adoption", "Remote work trends"]
      },
      userPersonas: [
        {
          name: "Early Adopter",
          demographics: "25-45 years old, tech-savvy, urban/suburban",
          painPoints: ["Current solutions are outdated", "Lack of integration", "High costs"],
          motivations: ["Efficiency", "Cost savings", "Better user experience"],
          behavior: "Research-driven, willing to try new solutions, price-sensitive"
        }
      ],
      featureRoadmap: {
        phase1: ["Core MVP features", "User management", "Basic analytics"],
        phase2: ["Advanced features", "Integrations", "Mobile app"],
        phase3: ["Enterprise features", "API platform", "Advanced analytics"],
        futureFeatures: ["AI automation", "Marketplace", "White-label solution"]
      },
      metrics: {
        acquisitionTargets: ["100 users in month 1", "1,000 users in month 6"],
        retentionTargets: ["80% monthly retention", "60% yearly retention"],
        revenueTargets: ["$10K MRR by month 6", "$100K ARR by year 1"],
        keyPerformanceIndicators: ["User activation rate", "Customer lifetime value", "Churn rate"]
      },
      riskMitigation: {
        technical: ["Thorough testing", "Scalable architecture", "Regular backups"],
        market: ["Market research", "Customer feedback", "Pivot readiness"],
        financial: ["Conservative budgeting", "Multiple funding sources", "Revenue diversification"],
        operational: ["Team redundancy", "Process documentation", "Vendor alternatives"]
      },
      nextSteps: {
        immediate: ["Validate idea with target users", "Create detailed wireframes", "Set up development environment"],
        shortTerm: ["Build MVP", "Gather user feedback", "Iterate on core features"],
        mediumTerm: ["Launch beta", "Acquire first paying customers", "Scale infrastructure"],
        longTerm: ["Raise growth funding", "Expand feature set", "Enter new markets"]
      }
    };
  }

  private generatePrompt(idea: string, industry: string, targetAudience: string, budget: string): string {
    return `You are an expert startup advisor. Generate a UNIQUE, CUSTOMIZED MVP plan specifically for this startup idea. DO NOT use generic templates or copy previous responses.

SPECIFIC STARTUP REQUIREMENTS:
Idea: ${idea}
Industry: ${industry}
Target Audience: ${targetAudience}
Budget: ${budget}

Analyze this specific idea thoroughly and create a tailored, industry-specific MVP plan. Consider the unique aspects of this idea, target market dynamics, and budget constraints. Generate a comprehensive MVP plan with the following sections. Respond with valid JSON only:
`;
  }
}

export const enhancedMvpGenerator = new EnhancedMvpGenerator();