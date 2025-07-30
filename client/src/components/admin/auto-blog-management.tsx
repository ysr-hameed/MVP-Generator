
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAutoBlogSettingsSchema } from "@shared/schema";
import { 
  Bot, 
  Clock, 
  FileText, 
  Link,
  Plus,
  Trash2,
  Play,
  Pause,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { z } from "zod";

const autoBlogSettingsSchema = insertAutoBlogSettingsSchema.extend({
  topics: z.array(z.string()).optional(),
  affiliateLinks: z.array(z.object({
    url: z.string().url(),
    text: z.string(),
    placement: z.string()
  })).optional(),
});

export function AutoBlogManagement() {
  const [showSettings, setShowSettings] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newAffiliateLink, setNewAffiliateLink] = useState({ url: "", text: "", placement: "content" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: autoBlogData, isLoading } = useQuery({
    queryKey: ["/api/admin/auto-blog"],
  });

  const settings = autoBlogData?.settings;
  const queue = autoBlogData?.queue || [];

  const form = useForm<z.infer<typeof autoBlogSettingsSchema>>({
    resolver: zodResolver(autoBlogSettingsSchema),
    defaultValues: {
      enabled: settings?.enabled || false,
      frequency: settings?.frequency || "daily",
      topics: settings?.topics || [],
      affiliateLinks: settings?.affiliateLinks || [],
    },
  });

  // Update form when data loads
  React.useEffect(() => {
    if (settings) {
      form.reset({
        enabled: settings.enabled,
        frequency: settings.frequency,
        topics: settings.topics || [],
        affiliateLinks: settings.affiliateLinks || [],
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof autoBlogSettingsSchema>) => {
      const response = await apiRequest("POST", "/api/admin/auto-blog/settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Auto-Blog Settings Updated",
        description: "Auto-blog settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auto-blog"] });
      setShowSettings(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Settings",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateBlogMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await apiRequest("POST", "/api/admin/auto-blog/generate", { topic });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Blog Generation Queued",
        description: "Blog post has been queued for generation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/auto-blog"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Queue Blog",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof autoBlogSettingsSchema>) => {
    updateSettingsMutation.mutate(data);
  };

  const addTopic = () => {
    if (newTopic.trim()) {
      const currentTopics = form.getValues("topics") || [];
      form.setValue("topics", [...currentTopics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const removeTopic = (index: number) => {
    const currentTopics = form.getValues("topics") || [];
    form.setValue("topics", currentTopics.filter((_, i) => i !== index));
  };

  const addAffiliateLink = () => {
    if (newAffiliateLink.url && newAffiliateLink.text) {
      const currentLinks = form.getValues("affiliateLinks") || [];
      form.setValue("affiliateLinks", [...currentLinks, { ...newAffiliateLink }]);
      setNewAffiliateLink({ url: "", text: "", placement: "content" });
    }
  };

  const removeAffiliateLink = (index: number) => {
    const currentLinks = form.getValues("affiliateLinks") || [];
    form.setValue("affiliateLinks", currentLinks.filter((_, i) => i !== index));
  };

  const generateRandomBlog = () => {
    const topics = [
      "Essential MVP Development Strategies for 2024",
      "How to Validate Your Startup Idea Before Building",
      "Budget-Friendly MVP Development: Maximum Impact, Minimum Cost"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    generateBlogMutation.mutate(randomTopic);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      pending: "outline"
    };
    return variants[status] || "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Auto-Blog Management</h2>
        <div className="flex space-x-2">
          <Button
            onClick={generateRandomBlog}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            disabled={generateBlogMutation.isPending}
          >
            <Play className="w-4 h-4 mr-2" />
            Generate Now
          </Button>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-primary hover:bg-primary/90"
          >
            <Bot className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Current Settings Display */}
      {!isLoading && settings && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              Auto-Blog Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge variant={settings.enabled ? "default" : "secondary"}>
                {settings.enabled ? "Enabled" : "Disabled"}
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {settings.frequency.charAt(0).toUpperCase() + settings.frequency.slice(1)}
              </Badge>
              {settings.lastRun && (
                <span className="text-sm text-slate-400">
                  Last run: {new Date(settings.lastRun).toLocaleDateString()}
                </span>
              )}
              {settings.nextRun && (
                <span className="text-sm text-slate-400">
                  Next run: {new Date(settings.nextRun).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Form */}
      {showSettings && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Auto-Blog Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-slate-300">Enable Auto-Blogging</FormLabel>
                          <div className="text-sm text-slate-400">
                            Automatically generate and publish blog posts
                          </div>
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
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Publishing Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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
                </div>

                {/* Topics Management */}
                <div className="space-y-4">
                  <FormLabel className="text-slate-300">Blog Topics</FormLabel>
                  <div className="flex space-x-2">
                    <Input
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Enter a blog topic"
                      className="bg-slate-700 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
                    />
                    <Button type="button" onClick={addTopic} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.watch("topics") || []).map((topic, index) => (
                      <Badge key={index} variant="secondary" className="pr-1">
                        {topic}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
                          onClick={() => removeTopic(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Affiliate Links Management */}
                <div className="space-y-4">
                  <FormLabel className="text-slate-300">Affiliate Links</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      value={newAffiliateLink.url}
                      onChange={(e) => setNewAffiliateLink({ ...newAffiliateLink, url: e.target.value })}
                      placeholder="URL"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input
                      value={newAffiliateLink.text}
                      onChange={(e) => setNewAffiliateLink({ ...newAffiliateLink, text: e.target.value })}
                      placeholder="Link text"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Select
                      value={newAffiliateLink.placement}
                      onValueChange={(value) => setNewAffiliateLink({ ...newAffiliateLink, placement: value })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">In Content</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addAffiliateLink} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(form.watch("affiliateLinks") || []).map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Link className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="text-sm text-white">{link.text}</div>
                            <div className="text-xs text-slate-400">{link.url}</div>
                          </div>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">
                            {link.placement}
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAffiliateLink(index)}
                          className="text-slate-300 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Save Settings"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowSettings(false)}
                    className="text-slate-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Generation Queue */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Generation Queue ({queue.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="loading-spinner mx-auto"></div>
          ) : queue.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No queued blog posts. Generate your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => (
                <div key={item.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(item.status)}
                        <h3 className="text-lg font-semibold text-white">{item.topic}</h3>
                        <Badge variant={getStatusBadge(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
                        {item.processedAt && (
                          <span>Processed: {new Date(item.processedAt).toLocaleString()}</span>
                        )}
                        {item.publishedPostId && (
                          <span>Published: Post ID {item.publishedPostId}</span>
                        )}
                      </div>
                      {item.error && (
                        <div className="mt-2 text-sm text-red-400 bg-red-900/20 p-2 rounded">
                          Error: {item.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
