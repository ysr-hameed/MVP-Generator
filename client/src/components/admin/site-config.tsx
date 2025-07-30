
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Globe, Loader2 } from "lucide-react";
import { z } from "zod";

const siteConfigSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Site description is required"),
  siteUrl: z.string().url("Please enter a valid URL"),
  logoUrl: z.string().url("Please enter a valid logo URL").optional().or(z.literal("")),
  favicon: z.string().url("Please enter a valid favicon URL").optional().or(z.literal("")),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
  }),
});

export function SiteConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: siteConfig, isLoading } = useQuery({
    queryKey: ["/api/admin/site-config"],
  });

  const form = useForm<z.infer<typeof siteConfigSchema>>({
    resolver: zodResolver(siteConfigSchema),
    defaultValues: {
      siteName: "MVP Generator AI",
      siteDescription: "Transform your ideas into actionable MVP plans",
      siteUrl: "https://mvp-generator.com",
      logoUrl: "",
      favicon: "",
      maintenanceMode: false,
      maintenanceMessage: "We're currently updating our platform. Please check back soon!",
      socialLinks: {
        twitter: "",
        facebook: "",
        linkedin: "",
        instagram: "",
      },
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (siteConfig) {
      form.reset({
        siteName: siteConfig.siteName || "MVP Generator AI",
        siteDescription: siteConfig.siteDescription || "Transform your ideas into actionable MVP plans",
        siteUrl: siteConfig.siteUrl || "https://mvp-generator.com",
        logoUrl: siteConfig.logoUrl || "",
        favicon: siteConfig.favicon || "",
        maintenanceMode: siteConfig.maintenanceMode || false,
        maintenanceMessage: siteConfig.maintenanceMessage || "We're currently updating our platform. Please check back soon!",
        socialLinks: {
          twitter: siteConfig.socialLinks?.twitter || "",
          facebook: siteConfig.socialLinks?.facebook || "",
          linkedin: siteConfig.socialLinks?.linkedin || "",
          instagram: siteConfig.socialLinks?.instagram || "",
        },
      });
    }
  }, [siteConfig, form]);

  const updateConfigMutation = useMutation({
    mutationFn: async (data: z.infer<typeof siteConfigSchema>) => {
      const response = await apiRequest("POST", "/api/admin/site-config", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Site Configuration Updated",
        description: "Your site settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/site-config"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Configuration",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof siteConfigSchema>) => {
    console.log("Submitting site config:", data);
    updateConfigMutation.mutate(data);
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
        <Settings className="w-6 h-6 mr-3 text-primary" />
        <h2 className="text-2xl font-bold text-white">Site Configuration</h2>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Site Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Your site name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Site URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="https://yoursite.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="siteDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Site Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Brief description of your site"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="https://example.com/logo.png"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="favicon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Favicon URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="https://example.com/favicon.ico"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="maintenanceMode"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-slate-300">Maintenance Mode</FormLabel>
                        <div className="text-sm text-slate-400">
                          Enable to show maintenance page to visitors
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
                  name="maintenanceMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Maintenance Message</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Message to show during maintenance"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Social Media Links</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialLinks.twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Twitter</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="https://twitter.com/yourusername"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialLinks.facebook"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Facebook</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="https://facebook.com/yourpage"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialLinks.linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">LinkedIn</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="https://linkedin.com/company/yourcompany"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="socialLinks.instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Instagram</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="https://instagram.com/yourusername"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={updateConfigMutation.isPending}
              >
                {updateConfigMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Configuration"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
