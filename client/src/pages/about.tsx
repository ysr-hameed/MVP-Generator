import SEOHead from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Zap,
  Target,
  Award,
  Globe,
  Heart
} from "lucide-react";

export default function About() {
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Co-Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300",
      description: "Former startup founder with 10+ years in product development and AI strategy."
    },
    {
      name: "Michael Chen",
      role: "Co-Founder & CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300",
      description: "AI researcher and software architect with expertise in machine learning and scalable systems."
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&h=300",
      description: "Product strategist with deep experience in user research and startup ecosystems."
    }
  ];

  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Innovation First",
      description: "We believe in pushing the boundaries of what's possible with AI to help entrepreneurs succeed."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Entrepreneur Focused",
      description: "Every feature we build is designed with the entrepreneur's journey and success in mind."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quality & Accuracy",
      description: "We're committed to providing accurate, actionable insights that entrepreneurs can trust."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Accessible to All",
      description: "Great ideas shouldn't be limited by resources. Our platform is free and accessible worldwide."
    }
  ];

  const milestones = [
    {
      year: "2023",
      title: "Company Founded",
      description: "Started with a vision to democratize startup planning using AI technology."
    },
    {
      year: "2024",
      title: "Platform Launch",
      description: "Launched MVP Generator AI with advanced Gemini integration and comprehensive planning features."
    },
    {
      year: "2024",
      title: "10K+ Plans Generated",
      description: "Reached our first major milestone of helping over 10,000 entrepreneurs validate their ideas."
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded to serve entrepreneurs worldwide with multilingual support and localized insights."
    }
  ];

  return (
    <>
      <SEOHead 
        title="About MVP Generator AI - Empowering Entrepreneurs with AI Technology"
        description="Learn about our mission to help entrepreneurs transform ideas into successful startups using AI-powered MVP generation and business planning tools."
        keywords="about MVP Generator AI, startup AI tools, entrepreneur platform, business planning technology"
      />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-max">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-6">
                  About MVP Generator AI
                </h1>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  We're passionate about helping entrepreneurs transform their ideas into successful startups. Our AI-powered platform combines cutting-edge technology with proven business methodology to create comprehensive MVP plans.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Founded by experienced entrepreneurs and AI researchers, we understand the challenges of turning an idea into a viable business. Our tool eliminates guesswork and provides data-driven insights for your startup journey.
                </p>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="metric-card">
                      <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-3xl font-bold text-primary mb-1">10K+</div>
                      <div className="text-xs text-muted-foreground">MVP Plans Generated</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="metric-card">
                      <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-3xl font-bold text-primary mb-1">95%</div>
                      <div className="text-xs text-muted-foreground">Accuracy Rate</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="metric-card">
                      <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-3xl font-bold text-primary mb-1">24/7</div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=600" 
                  alt="Diverse team collaborating in a modern startup workspace" 
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="section-padding">
          <div className="container-max">
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="feature-card">
                <CardContent className="p-8">
                  <div className="feature-icon gradient-primary mb-6">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To democratize startup success by providing every entrepreneur with access to AI-powered business planning tools. We believe great ideas shouldn't be limited by resources or experience – everyone deserves the chance to build something meaningful.
                  </p>
                </CardContent>
              </Card>

              <Card className="feature-card">
                <CardContent className="p-8">
                  <div className="feature-icon gradient-secondary mb-6">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To become the world's leading platform for AI-driven startup planning, where every entrepreneur can transform their vision into a validated, actionable business plan in minutes, not months.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section-padding bg-muted/50">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide everything we do and shape how we serve our community of entrepreneurs.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="feature-card text-center">
                  <CardContent className="p-6">
                    <div className="feature-icon gradient-tertiary mx-auto mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A diverse group of entrepreneurs, researchers, and builders passionate about empowering the next generation of startups.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="feature-card text-center">
                  <CardContent className="p-8">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover border-4 border-primary/20"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                    <Badge variant="outline" className="mb-4">{member.role}</Badge>
                    <p className="text-sm text-muted-foreground">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section-padding bg-muted/50">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                From inception to empowering thousands of entrepreneurs worldwide.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center text-white font-bold">
                        {milestone.year.slice(-2)}
                      </div>
                    </div>
                    <Card className="flex-1 feature-card">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{milestone.title}</h3>
                          <Badge variant="outline">{milestone.year}</Badge>
                        </div>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-gradient-to-r from-primary/10 via-secondary/10 to-tertiary/10">
          <div className="container-max">
            <div className="max-w-4xl mx-auto text-center">
              <Heart className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Join Our Mission
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                We're always looking for passionate individuals to join our team and help shape the future of entrepreneurship. Whether you're a developer, designer, or business strategist, we'd love to hear from you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:careers@mvpgenerator.ai"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  Join Our Team
                </a>
                <a 
                  href="/contact"
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
