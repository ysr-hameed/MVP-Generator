import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Loader2 } from "lucide-react";
import { z } from "zod";

const seoSettingsSchema = z.object({
  defaultMetaTitle: z.string().min(1, "Default meta title is required"),
  defaultMetaDescription: z.string().min(1, "Default meta description is required"),
  defaultKeywords: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  googleSearchConsoleId: z.string().optional(),
  bingWebmasterToolsId: z.string().optional(),
  facebookAppId: z.string().optional(),
  twitterHandle: z.string().optional(),
  canonicalUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  robotsTxt: z.string().optional(),
  sitemapUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export function SeoSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: seoSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/seo-settings"],
  });

  const form = useForm<z.infer<typeof seoSettingsSchema>>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      defaultMetaTitle: "MVP Generator AI",
      defaultMetaDescription: "Transform your ideas into actionable MVP plans",
      defaultKeywords: "",
      googleAnalyticsId: "",
      googleSearchConsoleId: "",
      bingWebmasterToolsId: "",
      facebookAppId: "",
      twitterHandle: "",
      canonicalUrl: "",
      robotsTxt: "",
      sitemapUrl: "",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (seoSettings) {
      form.reset({
        defaultMetaTitle: seoSettings.defaultMetaTitle || "MVP Generator AI",
        defaultMetaDescription: seoSettings.defaultMetaDescription || "Transform your ideas into actionable MVP plans",
        defaultKeywords: seoSettings.defaultKeywords || "",
        googleAnalyticsId: seoSettings.googleAnalyticsId || "",
        googleSearchConsoleId: seoSettings.googleSearchConsoleId || "",
        bingWebmasterToolsId: seoSettings.bingWebmasterToolsId || "",
        facebookAppId: seoSettings.facebookAppId || "",
        twitterHandle: seoSettings.twitterHandle || "",
        canonicalUrl: seoSettings.canonicalUrl || "",
        robotsTxt: seoSettings.robotsTxt || "",
        sitemapUrl: seoSettings.sitemapUrl || "",
      });
    }
  }, [seoSettings, form]);

  const updateSeoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof seoSettingsSchema>) => {
      const response = await apiRequest("POST", "/api/admin/seo-settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "SEO Settings Updated",
        description: "Your SEO settings have been saved successfully.",
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
                  name="defaultMetaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Default Meta Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Your site's default meta title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultMetaDescription"
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

                <FormField
                  control={form.control}
                  name="defaultKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Default Keywords (comma separated)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Keywords for search engines"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Analytics & Tracking</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="googleAnalyticsId"
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
                    name="googleSearchConsoleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Search Console Verification ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Verification ID"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bingWebmasterToolsId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Bing Webmaster Tools ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Verification ID"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="facebookAppId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Facebook App ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Facebook App ID"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twitterHandle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Twitter Handle</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="@yourtwitterhandle"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canonicalUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Canonical URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="https://example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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

              <FormField
                control={form.control}
                name="sitemapUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Sitemap URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="https://example.com/sitemap.xml"
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