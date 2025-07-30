import { useState, useEffect } from "react";
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
import { 
  Shield, 
  LogOut, 
  BarChart3, 
  FileText, 
  Settings, 
  Key,
  Palette,
  MessageSquare
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();

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

  if (isLoading) {
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
            <TabsList className="grid w-full grid-cols-6 bg-slate-800 border border-slate-700">
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
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">API Key Management</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 mb-4">
          Manage your Gemini API keys for AI-powered MVP generation.
        </p>
        <Button className="btn-primary">Add New API Key</Button>
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
            <p className="text-slate-400">Manage general site settings and configurations.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">SEO Settings</h4>
            <p className="text-slate-400">Configure meta tags and SEO optimization settings.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Email Configuration</h4>
            <p className="text-slate-400">Set up email notifications and SMTP settings.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}