import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Clock, 
  Globe, 
  PenTool, 
  Settings, 
  Sparkles, 
  TrendingUp,
  Search,
  Target,
  BarChart3,
  Zap,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";

const enhancedBlogSettingsSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  dailyPostCount: z.number().min(1).max(5),
  weeklyPostCount: z.number().min(1).max(7),
  monthlyPostCount: z.number().min(1).max(30),
  useLatestTrends: z.boolean(),
  focusOnMvpGenerator: z.boolean(),
  customTopics: z.string().optional(),
  seoOptimization: z.boolean(),
  useUnsplashImages: z.boolean(),
  targetKeywords: z.string().optional(),
  contentLength: z.enum(["short", "medium", "long"]),
  writingTone: z.enum(["professional", "conversational", "technical", "friendly"]),
  includeCallToAction: z.boolean(),
  autoPublish: z.boolean(),
  generateSocialPosts: z.boolean(),
  affiliateLinks: z.string().optional(),
});

type EnhancedBlogSettings = z.infer<typeof enhancedBlogSettingsSchema>;

export function EnhancedBlogSettings() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EnhancedBlogSettings>({
    resolver: zodResolver(enhancedBlogSettingsSchema),
    defaultValues: {
      enabled: false,
      frequency: "daily",
      dailyPostCount: 1,
      weeklyPostCount: 3,
      monthlyPostCount: 10,
      useLatestTrends: true,
      focusOnMvpGenerator: true,
      seoOptimization: true,
      useUnsplashImages: true,
      contentLength: "medium",
      writingTone: "professional",
      includeCallToAction: true,
      autoPublish: true,
      generateSocialPosts: false,
    },
  });

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/admin/auto-blog-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/auto-blog-settings");
      return response.json();
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        enabled: settings.enabled || false,
        frequency: settings.frequency || "daily",
        dailyPostCount: settings.dailyPostCount || 1,
        weeklyPostCount: settings.weeklyPostCount || 3,
        monthlyPostCount: settings.monthlyPostCount || 10,
        useLatestTrends: settings.useLatestTrends ?? true,
        focusOnMvpGenerator: settings.focusOnMyApp ?? true,
        customTopics: settings.topics?.join(", ") || "",
        seoOptimization: settings.seoOptimization ?? true,
        useUnsplashImages: settings.useUnsplashImages ?? true,
        targetKeywords: settings.targetKeywords || "",
        contentLength: settings.contentLength || "medium",
        writingTone: settings.writingTone || "professional",
        includeCallToAction: settings.includeCallToAction ?? true,
        autoPublish: settings.autoPublish ?? true,
        generateSocialPosts: settings.generateSocialPosts || false,
        affiliateLinks: settings.affiliateLinks || "",
      });
    }
  }, [settings, form]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: EnhancedBlogSettings) => {
      const response = await apiRequest("POST", "/api/admin/auto-blog-settings", {
        enabled: data.enabled,
        frequency: data.frequency,
        dailyPostCount: data.dailyPostCount,
        weeklyPostCount: data.weeklyPostCount,
        monthlyPostCount: data.monthlyPostCount,
        useLatestTrends: data.useLatestTrends,
        focusOnMyApp: data.focusOnMvpGenerator,
        topics: data.customTopics ? data.customTopics.split(",").map(t => t.trim()).filter(Boolean) : [],
        seoOptimization: data.seoOptimization,
        useUnsplashImages: data.useUnsplashImages,
        targetKeywords: data.targetKeywords,
        contentLength: data.contentLength,
        writingTone: data.writingTone,
        includeCallToAction: data.includeCallToAction,
        autoPublish: data.autoPublish,
        generateSocialPosts: data.generateSocialPosts,
        affiliateLinks: data.affiliateLinks,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "Auto-blog settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auto-blog-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  // Generate test post mutation
  const generateTestPostMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/generate-test-blog");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Test Post Generated",
        description: `Successfully generated: "${data.title}"`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate test post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EnhancedBlogSettings) => {
    saveSettingsMutation.mutate(data);
  };

  const handleGenerateTestPost = () => {
    setIsGenerating(true);
    generateTestPostMutation.mutate();
    setTimeout(() => setIsGenerating(false), 3000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading blog settings...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            Enhanced Auto-Blog Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Configuration</h3>
                
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Auto-Blogging</FormLabel>
                        <FormDescription>
                          Automatically generate and publish SEO-optimized blog posts
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posting Frequency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("frequency") === "daily" && (
                    <FormField
                      control={form.control}
                      name="dailyPostCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posts Per Day</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 post</SelectItem>
                              <SelectItem value="2">2 posts</SelectItem>
                              <SelectItem value="3">3 posts</SelectItem>
                              <SelectItem value="4">4 posts</SelectItem>
                              <SelectItem value="5">5 posts</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("frequency") === "weekly" && (
                    <FormField
                      control={form.control}
                      name="weeklyPostCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posts Per Week</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num} post{num > 1 ? 's' : ''}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("frequency") === "monthly" && (
                    <FormField
                      control={form.control}
                      name="monthlyPostCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posts Per Month</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 5, 10, 15, 20, 25, 30].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num} post{num > 1 ? 's' : ''}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <Separator />

              {/* Content Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Content Generation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contentLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Length</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="short">Short (800-1200 words)</SelectItem>
                            <SelectItem value="medium">Medium (1500-2500 words)</SelectItem>
                            <SelectItem value="long">Long (3000+ words)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="writingTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Writing Tone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="conversational">Conversational</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="friendly">Friendly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="customTopics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Topics (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter custom topics separated by commas, e.g., 'SaaS development, Mobile apps, AI integration'"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty to use trending MVP and startup topics
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Keywords (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., MVP development, startup planning, business strategy"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Keywords to focus on for SEO optimization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Advanced Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Advanced Options
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="useLatestTrends"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Use Latest Trends</FormLabel>
                          <FormDescription>
                            Include current tech trends and 2025 topics
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="focusOnMvpGenerator"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Promote MVP Generator</FormLabel>
                          <FormDescription>
                            Naturally mention our tool in content
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seoOptimization"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">SEO Optimization</FormLabel>
                          <FormDescription>
                            Optimize meta tags, keywords, and structure
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="useUnsplashImages"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Professional Images</FormLabel>
                          <FormDescription>
                            Use Unsplash for high-quality images
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="includeCallToAction"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Call-to-Action</FormLabel>
                          <FormDescription>
                            Include CTAs to try MVP Generator
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="autoPublish"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-Publish</FormLabel>
                          <FormDescription>
                            Publish posts automatically when generated
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="affiliateLinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiliate Links (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter affiliate links in JSON format, e.g., [{'text':'Product Name','url':'https://affiliate-link.com','description':'Tool description'}]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        JSON array of affiliate links to include in posts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={saveSettingsMutation.isPending}
                  className="flex-1"
                >
                  {saveSettingsMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateTestPost}
                  disabled={isGenerating || generateTestPostMutation.isPending}
                  className="flex-1"
                >
                  {isGenerating || generateTestPostMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Test Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Status Card */}
      {settings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {settings.enabled ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Pause className="w-3 h-3" />
                      Paused
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {settings.frequency}
                </div>
                <p className="text-sm text-muted-foreground">Frequency</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {settings.frequency === "daily" ? settings.dailyPostCount :
                   settings.frequency === "weekly" ? settings.weeklyPostCount :
                   settings.monthlyPostCount}
                </div>
                <p className="text-sm text-muted-foreground">Posts per {settings.frequency.slice(0, -2)}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {settings.lastRun ? new Date(settings.lastRun).toLocaleDateString() : "Never"}
                </div>
                <p className="text-sm text-muted-foreground">Last Run</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}