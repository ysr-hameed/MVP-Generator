import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SEOHead from "@/components/seo-head";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdDisplay } from "@/components/ad-display";
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

  // Use only real posts from API
  const displayPosts = posts;

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
        {/* Header Ads */}
        <AdDisplay position="header" className="py-4 bg-slate-50" />

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
                          src={featuredPost.imageUrl || "https://source.unsplash.com/1200x600/?startup,business"} 
                          alt={featuredPost.title}
                          className="w-full h-64 md:h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://source.unsplash.com/1200x600/?technology,business";
                          }}
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
          <div className="container-max flex gap-8">
            {/* Main Content */}
            <div className="flex-1">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Latest Articles</h2>
              <p className="text-muted-foreground">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Content Ads */}
            <AdDisplay position="content" className="mb-8" />

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
                {searchTerm ? (
                  <>
                    <p className="text-lg text-muted-foreground">No articles found matching your search.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSearchTerm("")}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <p className="text-lg text-muted-foreground">No blog posts available yet. Check back soon!</p>
                )}
              </div>
            ) : (
              <>
                <AdDisplay position="content" className="flex justify-center mb-8" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredPosts.filter(post => !post.featured).map((post, index) => (
                  <div key={post.id}>
                  {index === Math.floor(filteredPosts.filter(post => !post.featured).length / 2) && (
                    <AdDisplay position="content" className="flex justify-center my-8" />
                  )}
                  <Card key={post.id} className="blog-card cursor-pointer" onClick={() => handleReadMore(post.slug)}>
                    <div className="relative">
                      <img 
                        src={post.imageUrl || "https://source.unsplash.com/800x400/?startup,business"} 
                        alt={post.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://source.unsplash.com/800x400/?technology,innovation";
                        }}
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
                </div>
                ))}
                </div>
              </>
            )}

            {filteredPosts.length > 0 && (
              <div className="text-center mt-12">
                <Button className="btn-primary">
                  Load More Articles
                </Button>
              </div>
            )}
            </div>

            {/* Sidebar with Ads */}
            <div className="w-80 hidden lg:block">
              <div className="sticky top-20">
                <AdDisplay position="sidebar" />
              </div>
            </div>
          </div>
        </section>

        {/* Footer Ads */}
        <AdDisplay position="footer" className="py-8 bg-slate-100" />
      </div>
    </>
  );
}