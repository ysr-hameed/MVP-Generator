import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SEOHead from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Clock, ArrowRight, TrendingUp } from "lucide-react";
import { type BlogPost } from "@shared/schema";
import { useLocation } from 'wouter';

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/blog/posts"],
    select: (data: BlogPost[]) => data,
  });

  // Sample blog posts for demonstration
  const samplePosts: BlogPost[] = [
    {
      id: "1",
      title: "How to Validate Your Startup Idea Before Building an MVP",
      slug: "validate-startup-idea-before-mvp",
      excerpt: "Learn proven methods to validate your startup idea using AI tools and market research before investing time and money into development.",
      content: "",
      author: "Sarah Johnson",
      publishedAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      featured: true,
      metaTitle: "How to Validate Your Startup Idea Before Building an MVP",
      metaDescription: "Learn proven methods to validate your startup idea using AI tools and market research before investing time and money into development.",
      keywords: ["startup validation", "MVP", "market research"],
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400",
    },
    {
      id: "2",
      title: "AI-Powered Business Planning: The Future of Startup Development",
      slug: "ai-powered-business-planning-future-startup-development",
      excerpt: "Discover how artificial intelligence is revolutionizing business planning and MVP development for modern entrepreneurs.",
      content: "",
      author: "Michael Chen",
      publishedAt: new Date("2024-01-12"),
      updatedAt: new Date("2024-01-12"),
      featured: false,
      metaTitle: "AI-Powered Business Planning: The Future of Startup Development",
      metaDescription: "Discover how artificial intelligence is revolutionizing business planning and MVP development for modern entrepreneurs.",
      keywords: ["AI", "business planning", "startup development"],
      imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400",
    },
    {
      id: "3",
      title: "Essential Metrics Every MVP Should Track From Day One",
      slug: "essential-metrics-mvp-track-day-one",
      excerpt: "Learn which key performance indicators and metrics you should monitor to ensure your MVP's success and growth.",
      content: "",
      author: "Emily Rodriguez",
      publishedAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
      featured: false,
      metaTitle: "Essential Metrics Every MVP Should Track From Day One",
      metaDescription: "Learn which key performance indicators and metrics you should monitor to ensure your MVP's success and growth.",
      keywords: ["MVP metrics", "KPIs", "startup analytics"],
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400",
    },
  ];

  // Use sample posts if no data from API
  const displayPosts = posts.length > 0 ? posts : samplePosts;

  const filteredPosts = displayPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleReadMore = (slug: string) => {
    setLocation(`/blog/${slug}`);
  };

  return (
    <>
      <SEOHead 
        title="Startup Blog - AI Tools, MVP Development & Business Insights | MVP Generator AI"
        description="Expert insights on MVP development, AI tools for startups, and comprehensive guides for entrepreneurs. Learn how to build successful startups with AI."
        keywords="startup blog, MVP development, AI tools, business insights, entrepreneur guides, startup tips"
      />

      <div className="pt-16">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
          <div className="container-max">
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Startup Insights & AI Tools Blog
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Expert insights on MVP development, AI tools for startups, and comprehensive guides for entrepreneurs.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-base"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {filteredPosts.find(post => post.featured) && (
          <section className="section-padding">
            <div className="container-max">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-primary" />
                  Featured Article
                </h2>
              </div>

              {(() => {
                const featuredPost = filteredPosts.find(post => post.featured)!;
                return (
                  <Card className="blog-card max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative">
                        <img 
                          src={featuredPost.imageUrl || "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400"} 
                          alt={featuredPost.title}
                          className="w-full h-64 md:h-full object-cover"
                        />
                        <Badge className="absolute top-4 left-4 gradient-primary text-white">
                          Featured
                        </Badge>
                      </div>
                      <CardContent className="p-8 flex flex-col justify-center">
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <Calendar className="w-4 h-4 mr-1" />
                          <time>{formatDate(featuredPost.publishedAt!)}</time>
                          <span className="mx-2">•</span>
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{getReadingTime(featuredPost.content)} min read</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                          {featuredPost.title}
                        </h3>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{featuredPost.author}</span>
                          <Button variant="ghost" className="group" onClick={() => handleReadMore(featuredPost.slug)}>
                            Read more
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })()}
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="section-padding bg-muted/50">
          <div className="container-max">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Latest Articles</h2>
              <p className="text-muted-foreground">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="w-full h-48 bg-muted"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No articles found matching your search.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8">
                {filteredPosts.filter(post => !post.featured).map((post) => (
                  <Card key={post.id} className="blog-card cursor-pointer" onClick={() => handleReadMore(post.slug)}>
                    <div className="relative">
                      <img 
                        src={post.imageUrl || "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=400"} 
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4 mr-1" />
                        <time>{formatDate(post.publishedAt!)}</time>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{getReadingTime(post.content)} min read</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{post.author}</span>
                        <Button variant="ghost" size="sm" className="group" onClick={() => handleReadMore(post.slug)}>
                          Read more
                          <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredPosts.length > 0 && (
              <div className="text-center mt-12">
                <Button className="btn-primary">
                  Load More Articles
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}