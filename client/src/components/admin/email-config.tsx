
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send, Loader2, TestTube } from "lucide-react";
import { z } from "zod";

const emailConfigSchema = z.object({
  provider: z.enum(["smtp", "sendgrid", "mailgun", "ses"]),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpSecure: z.boolean().default(true),
  apiKey: z.string().optional(),
  fromEmail: z.string().email("Please enter a valid email"),
  fromName: z.string().min(1, "From name is required"),
  replyToEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  enabled: z.boolean().default(false),
  templates: z.object({
    contactForm: z.object({
      subject: z.string(),
      template: z.string(),
    }),
    welcome: z.object({
      subject: z.string(),
      template: z.string(),
    }),
  }),
});

export function EmailConfig() {
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emailConfig, isLoading } = useQuery({
    queryKey: ["/api/admin/email-config"],
  });

  const form = useForm<z.infer<typeof emailConfigSchema>>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      provider: emailConfig?.provider || "smtp",
      smtpHost: emailConfig?.smtpHost || "",
      smtpPort: emailConfig?.smtpPort || 587,
      smtpUser: emailConfig?.smtpUser || "",
      smtpPassword: emailConfig?.smtpPassword || "",
      smtpSecure: emailConfig?.smtpSecure !== false,
      apiKey: emailConfig?.apiKey || "",
      fromEmail: emailConfig?.fromEmail || "",
      fromName: emailConfig?.fromName || "MVP Generator AI",
      replyToEmail: emailConfig?.replyToEmail || "",
      enabled: emailConfig?.enabled || false,
      templates: {
        contactForm: {
          subject: emailConfig?.templates?.contactForm?.subject || "New Contact Form Submission",
          template: emailConfig?.templates?.contactForm?.template || "You have received a new contact form submission from {{name}} ({{email}}).\n\nMessage:\n{{message}}\n\nReply directly to this email to respond.",
        },
        welcome: {
          subject: emailConfig?.templates?.welcome?.subject || "Welcome to MVP Generator AI",
          template: emailConfig?.templates?.welcome?.template || "Thank you for joining MVP Generator AI! We're excited to help you transform your ideas into actionable MVP plans.",
        },
      },
    },
  });

  const updateEmailConfigMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailConfigSchema>) => {
      const response = await apiRequest("POST", "/api/admin/email-config", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Configuration Updated",
        description: "Your email settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-config"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Email Configuration",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/admin/email-config/test", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Check your inbox for the test email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Test Email",
        description: error.message || "Please check your configuration.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof emailConfigSchema>) => {
    updateEmailConfigMutation.mutate(data);
  };

  const sendTestEmail = () => {
    if (testEmail) {
      testEmailMutation.mutate(testEmail);
    }
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
        <Mail className="w-6 h-6 mr-3 text-primary" />
        <h2 className="text-2xl font-bold text-white">Email Configuration</h2>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Email Provider Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-slate-300">Enable Email System</FormLabel>
                      <div className="text-sm text-slate-400">
                        Turn on email functionality for contact forms and notifications
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

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Email Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="smtp">SMTP</SelectItem>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="ses">Amazon SES</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">From Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="noreply@yoursite.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">From Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Your Site Name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="replyToEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Reply-To Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="support@yoursite.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("provider") === "smtp" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">SMTP Configuration</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">SMTP Host</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="smtp.gmail.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">SMTP Port</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="587"
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smtpUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">SMTP Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="your-email@gmail.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">SMTP Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="your-app-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="smtpSecure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-slate-300">Use SSL/TLS</FormLabel>
                          <div className="text-sm text-slate-400">
                            Enable secure connection to SMTP server
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
                </div>
              )}

              {form.watch("provider") !== "smtp" && (
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">API Key</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Your API key"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Email Templates</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="templates.contactForm.subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Contact Form Subject</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="New Contact Form Submission"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="templates.contactForm.template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Contact Form Template</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="bg-slate-700 border-slate-600 text-white font-mono"
                              placeholder="Email template with {{name}}, {{email}}, {{message}} variables"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="templates.welcome.subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Welcome Email Subject</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Welcome to MVP Generator AI"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="templates.welcome.template"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Welcome Email Template</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="bg-slate-700 border-slate-600 text-white font-mono"
                              placeholder="Welcome email template"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={updateEmailConfigMutation.isPending}
                >
                  {updateEmailConfigMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>

                <div className="flex items-center space-x-2">
                  <Input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className="bg-slate-700 border-slate-600 text-white w-48"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={sendTestEmail}
                    disabled={testEmailMutation.isPending || !testEmail}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    {testEmailMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
