
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Plus, Trash2, Loader2 } from "lucide-react";
import { z } from "zod";

const seoSettingsSchema = z.object({
  defaultTitle: z.string().min(1, "Default title is required"),
  defaultDescription: z.string().min(1, "Default description is required"),
  defaultKeywords: z.array(z.string()),
  sitemap: z.boolean().default(true),
  robotsTxt: z.string().optional(),
  googleAnalytics: z.string().optional(),
  googleSearchConsole: z.string().optional(),
  facebookPixel: z.string().optional(),
  twitterCard: z.string().optional(),
  openGraph: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    type: z.string().default("website"),
  }),
});

export function SeoSettings() {
  const [newKeyword, setNewKeyword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: seoSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/seo-settings"],
  });

  const form = useForm<z.infer<typeof seoSettingsSchema>>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      defaultTitle: seoSettings?.defaultTitle || "MVP Generator AI - Transform Ideas into Plans",
      defaultDescription: seoSettings?.defaultDescription || "Create comprehensive MVP plans with AI assistance. Validate your startup ideas and get actionable development roadmaps.",
      defaultKeywords: seoSettings?.defaultKeywords || ["MVP", "startup", "business plan", "AI"],
      sitemap: seoSettings?.sitemap !== false,
      robotsTxt: seoSettings?.robotsTxt || "",
      googleAnalytics: seoSettings?.googleAnalytics || "",
      googleSearchConsole: seoSettings?.googleSearchConsole || "",
      facebookPixel: seoSettings?.facebookPixel || "",
      twitterCard: seoSettings?.twitterCard || "summary_large_image",
      openGraph: {
        title: seoSettings?.openGraph?.title || "",
        description: seoSettings?.openGraph?.description || "",
        image: seoSettings?.openGraph?.image || "",
        type: seoSettings?.openGraph?.type || "website",
      },
    },
  });

  const updateSeoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof seoSettingsSchema>) => {
      const response = await apiRequest("POST", "/api/admin/seo-settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "SEO Settings Updated",
        description: "Your SEO configuration has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seo-settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update SEO Settings",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof seoSettingsSchema>) => {
    updateSeoMutation.mutate(data);
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const currentKeywords = form.getValues("defaultKeywords") || [];
      form.setValue("defaultKeywords", [...currentKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (index: number) => {
    const currentKeywords = form.getValues("defaultKeywords") || [];
    form.setValue("defaultKeywords", currentKeywords.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Search className="w-6 h-6 mr-3 text-primary" />
        <h2 className="text-2xl font-bold text-white">SEO Settings</h2>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Search Engine Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="defaultTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Default Page Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Your site's default title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Default Meta Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Brief description for search engines"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel className="text-slate-300">Default Keywords</FormLabel>
                  <div className="flex space-x-2">
                    <Input
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Add a keyword"
                      className="bg-slate-700 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.watch("defaultKeywords") || []).map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="pr-1">
                        {keyword}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
                          onClick={() => removeKeyword(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Analytics & Tracking</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="googleAnalytics"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Google Analytics ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="G-XXXXXXXXXX"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="googleSearchConsole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Search Console Verification</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="verification code"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="facebookPixel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Facebook Pixel ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Facebook Pixel ID"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twitterCard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Twitter Card Type</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="summary_large_image"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Open Graph Settings</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="openGraph.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">OG Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Open Graph title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="openGraph.image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">OG Image URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="https://example.com/og-image.jpg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="openGraph.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">OG Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Open Graph description"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="robotsTxt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Robots.txt Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-slate-700 border-slate-600 text-white font-mono"
                        placeholder="User-agent: *&#10;Disallow:"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={updateSeoMutation.isPending}
              >
                {updateSeoMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save SEO Settings"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
