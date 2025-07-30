import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SEOHead from "@/components/seo-head";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { ContentManagement } from "@/components/admin/content-management";
import { AdvertisementManagement } from "@/components/admin/advertisement-management";
import { AutoBlogManagement } from "@/components/admin/auto-blog-management";
import { 
  Shield, 
  LogOut, 
  BarChart3, 
  FileText, 
  Settings, 
  Key,
  Palette,
  MessageSquare,
  Monitor,
  Bot
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { SiteConfig } from "@/components/admin/site-config";
import { SeoSettings } from "@/components/admin/seo-settings";
import { EmailConfig } from "@/components/admin/email-config";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("analytics");
  const { toast } = useToast();
  const { isLoggedIn, logout, isLoading: authLoading } = useAuth();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      localStorage.removeItem('adminToken');
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel.",
      });
      setLocation('/admin/login');
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Check authentication on component mount
  const { data: authCheck, isLoading } = useQuery({
    queryKey: ["admin-auth-check"],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('/api/admin/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        localStorage.removeItem('adminToken');
        throw new Error('Authentication failed');
      }

      return response.json();
    },
    retry: false
  });

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      setLocation('/admin/login');
    }
  }, [setLocation]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !authCheck) {
      setLocation('/admin/login');
    }
  }, [authCheck, isLoading, setLocation]);

  if (isLoading || authLoading) {
    return (
      <div className="container-max py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!authCheck) {
    return null; // Will redirect to login
  }

  return (
    <>
      <SEOHead 
        title="Admin Dashboard - MVP Generator AI"
        description="MVP Generator AI admin dashboard for managing content, analytics, and system settings."
      />

      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-800">
          <div className="container-max">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-xs text-slate-400">MVP Generator AI</p>
                </div>
              </div>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-slate-300 hover:text-white hover:bg-slate-700"
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container-max section-padding">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 bg-slate-800 border border-slate-700">
              <TabsTrigger 
                value="analytics" 
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="content"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger 
                value="ads"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Ads
              </TabsTrigger>
              <TabsTrigger 
                value="auto-blog"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Bot className="w-4 h-4 mr-2" />
                Auto-Blog
              </TabsTrigger>
              <TabsTrigger 
                value="contacts"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contacts
              </TabsTrigger>
              <TabsTrigger 
                value="api-keys"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger 
                value="theme"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Palette className="w-4 h-4 mr-2" />
                Theme
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <ContentManagement />
            </TabsContent>

            <TabsContent value="ads" className="space-y-6">
              <AdvertisementManagement />
            </TabsContent>

            <TabsContent value="auto-blog" className="space-y-6">
              <AutoBlogManagement />
            </TabsContent>

            <TabsContent value="contacts" className="space-y-6">
              <ContactsManagement />
            </TabsContent>

            <TabsContent value="api-keys" className="space-y-6">
              <ApiKeysManagement />
            </TabsContent>

            <TabsContent value="theme" className="space-y-6">
              <ThemeManagement />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <GeneralSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

// Placeholder components for additional admin sections
function ContactsManagement() {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["/api/admin/contacts"],
  });

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Contact Messages</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : contacts.length === 0 ? (
          <p className="text-slate-400">No contact messages yet.</p>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact: any) => (
              <div key={contact.id} className="p-4 bg-slate-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white">
                    {contact.firstName} {contact.lastName}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {new Date(contact.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">{contact.email}</p>
                <p className="text-sm text-slate-300 mb-2">Subject: {contact.subject}</p>
                <p className="text-slate-400">{contact.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApiKeysManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const { toast } = useToast();

  const { data: apiKeys = [], refetch } = useQuery({
    queryKey: ["/api/admin/api-keys"],
  });

  const addApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKey })
      });

      if (!response.ok) {
        throw new Error('Failed to add API key');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "API Key Added",
        description: "The API key has been successfully added.",
      });
      setNewApiKey("");
      setShowAddForm(false);
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add API key. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddApiKey = () => {
    if (newApiKey.trim()) {
      addApiKeyMutation.mutate(newApiKey.trim());
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">API Key Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-400">
          Manage your Gemini API keys for AI-powered MVP generation.
        </p>

        {!showAddForm ? (
          <Button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            Add New API Key
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400"
              />
              <Button 
                onClick={handleAddApiKey}
                disabled={addApiKeyMutation.isPending || !newApiKey.trim()}
                className="btn-primary"
              >
                {addApiKeyMutation.isPending ? "Adding..." : "Add"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewApiKey("");
                }}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {apiKeys.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-white">Current API Keys</h4>
            {apiKeys.map((key: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                <span className="text-slate-300 font-mono">
                  {key.key.substring(0, 8)}...{key.key.substring(key.key.length - 8)}
                </span>
                <span className="text-xs text-slate-400">
                  Added {new Date(key.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ThemeManagement() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Theme Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 mb-4">
          Customize the appearance and branding of your MVP Generator platform.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-700 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Primary Color</h4>
            <div className="w-full h-12 gradient-primary rounded"></div>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Secondary Color</h4>
            <div className="w-full h-12 gradient-secondary rounded"></div>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Accent Color</h4>
            <div className="w-full h-12 gradient-tertiary rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GeneralSettings() {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-white mb-2">Site Configuration</h4>
            <SiteConfig />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">SEO Settings</h4>
            <SeoSettings />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Email Configuration</h4>
            <EmailConfig />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

