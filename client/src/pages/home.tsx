import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/seo-head";
import { AdDisplay } from "@/components/ad-display";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MVP Generator AI",
    "url": window.location.origin,
    "description": "AI-powered tool that transforms startup ideas into comprehensive MVP plans with tech stacks, features, and roadmaps.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "MVP Generator AI"
    }
  };

  return (
    <>
      <SEOHead 
        title="MVP Generator AI - Transform Ideas into Startup Plans | Prompt to MVP"
        structuredData={structuredData}
      />

      <div className="pt-16">
        {/* Header Ads */}
        <AdDisplay position="header" className="bg-slate-50 py-2" />

        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
          <AdDisplay position="homepage-hero" className="mb-8" />
          {/* Hero content */}

          <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <h1 className="hero-font text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight text-balance">
                Transform Ideas into 
                <span className="block text-primary">Startup Plans</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Generate comprehensive startup plans with AI. Get features, tech stacks, monetization strategies, and roadmaps in minutes, not months.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/mvp-generator">
                  <Button 
                    className="btn-primary group w-full sm:w-auto"
                    data-testid="button-start-generating"
                    size="lg"
                  >
                    Start Generating
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button 
                    variant="outline" 
                    className="btn-secondary w-full sm:w-auto"
                    data-testid="button-learn-more"
                    size="lg"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>No signup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Instant results</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding bg-muted">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose MVP Generator AI?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transform your startup ideas into actionable plans with our AI-powered platform. No more guesswork, just data-driven insights.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="feature-card">
                <div className="feature-icon">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">AI-Powered Analysis</h3>
                <p className="text-muted-foreground">
                  Advanced AI analyzes your idea and generates comprehensive MVP plans with market insights, features, and technical recommendations.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon bg-primary">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Comprehensive Plans</h3>
                <p className="text-muted-foreground">
                  Get detailed feature lists, technology stacks, monetization strategies, timelines, and development roadmaps all in one place.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon bg-primary">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Instant Results</h3>
                <p className="text-muted-foreground">
                  No more weeks of research and planning. Get your complete MVP plan in minutes with actionable next steps to start building.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Simple, fast, and effective. Transform your startup idea into a comprehensive plan in three easy steps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3 className="text-xl font-semibold mb-4">Describe Your Idea</h3>
                <p className="text-muted-foreground">
                  Tell us about your startup idea, target audience, industry, and budget. The more details, the better your plan will be.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">2</div>
                <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our advanced AI analyzes your idea, researches the market, and generates a comprehensive MVP plan tailored to your needs.
                </p>
              </div>

              <div className="step-card">
                <div className="step-number">3</div>
                <h3 className="text-xl font-semibold mb-4">Get Your Plan</h3>
                <p className="text-muted-foreground">
                  Receive a detailed MVP plan with features, tech stack, monetization strategy, timeline, and actionable next steps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-padding bg-muted/50">
          <div className="container-max">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Why Startups Choose Our Platform
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Join thousands of entrepreneurs who have successfully launched their startups using our AI-powered MVP planning platform.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Risk Reduction</h4>
                      <p className="text-muted-foreground">Validate your idea before investing time and money with data-driven insights and market analysis.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Expert Insights</h4>
                      <p className="text-muted-foreground">Get professional-level business planning without hiring expensive consultants or advisors.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Growth Focus</h4>
                      <p className="text-muted-foreground">Plans designed for scalability with clear roadmaps for growth and expansion strategies.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600" 
                  alt="Successful startup team celebrating" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50K+</div>
                <p className="text-muted-foreground">MVP Plans Generated</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">95%</div>
                <p className="text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">24/7</div>
                <p className="text-muted-foreground">AI Availability</p>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100+</div>
                <p className="text-muted-foreground">Industries Covered</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-to-br from-primary to-secondary text-white">
          <div className="container-max text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Idea?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of successful entrepreneurs who started with our AI-powered MVP generator. Your startup journey begins here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mvp-generator">
                <Button className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg">
                  Generate Your MVP Plan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-card border-t">
          <div className="container-max py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4">MVP Generator AI</h3>
                <p className="text-muted-foreground mb-4">
                  Transform your startup ideas into comprehensive MVP plans with AI-powered insights and recommendations.
                </p>
                <div className="flex space-x-4">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link href="/mvp-generator" className="hover:text-foreground">MVP Generator</Link></li>
                  <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
                  <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                  <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                  <li><a href="#" className="hover:text-foreground">FAQ</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-foreground">Cookie Policy</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
              <p>&copy; 2024 MVP Generator AI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}