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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send, Loader2, Beaker } from "lucide-react";
import { z } from "zod";

const emailConfigSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.number().min(1, "SMTP port is required"),
  smtpUsername: z.string().min(1, "SMTP username is required"),
  smtpPassword: z.string().min(1, "SMTP password is required"),
  smtpSecurity: z.enum(["none", "tls", "ssl"]),
  fromEmail: z.string().email("Please enter a valid email"),
  fromName: z.string().min(1, "From name is required"),
  replyToEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  enableNotifications: z.boolean().default(true),
  contactFormRecipient: z.string().email("Please enter a valid email"),
  emailSignature: z.string().optional(),
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
      smtpHost: "",
      smtpPort: 587,
      smtpUsername: "",
      smtpPassword: "",
      smtpSecurity: "tls",
      fromEmail: "",
      fromName: "MVP Generator AI",
      replyToEmail: "",
      enableNotifications: true,
      contactFormRecipient: "",
      emailSignature: "",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (emailConfig) {
      form.reset({
        smtpHost: emailConfig.smtpHost || "",
        smtpPort: emailConfig.smtpPort || 587,
        smtpUsername: emailConfig.smtpUsername || "",
        smtpPassword: emailConfig.smtpPassword || "",
        smtpSecurity: emailConfig.smtpSecurity || "tls",
        fromEmail: emailConfig.fromEmail || "",
        fromName: emailConfig.fromName || "MVP Generator AI",
        replyToEmail: emailConfig.replyToEmail || "",
        enableNotifications: emailConfig.enableNotifications ?? true,
        contactFormRecipient: emailConfig.contactFormRecipient || "",
        emailSignature: emailConfig.emailSignature || "",
      });
    }
  }, [emailConfig, form]);

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
                name="enableNotifications"
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
                  name="smtpSecurity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">SMTP Security</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select security" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
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

                 <FormField
                  control={form.control}
                  name="contactFormRecipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Contact Form Recipient</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="admin@yoursite.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


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
                      name="smtpUsername"
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
                  </div>

               <FormField
                  control={form.control}
                  name="emailSignature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Email Signature</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-slate-700 border-slate-600 text-white font-mono"
                          placeholder="Your email signature"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        <Beaker className="w-4 h-4 mr-2" />
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