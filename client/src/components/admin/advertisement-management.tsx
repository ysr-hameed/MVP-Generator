import React, { useState, useEffect } from "react";
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
import { insertAdvertisementSchema, insertAdSettingsSchema, type InsertAdvertisement, type Advertisement } from "@shared/schema";
import { 
  Monitor, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { z } from "zod";

const adFormSchema = insertAdvertisementSchema;
const adSettingsFormSchema = insertAdSettingsSchema;

export function AdvertisementManagement() {
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ads = [], isLoading: adsLoading } = useQuery({
    queryKey: ["/api/admin/advertisements"],
    select: (data: Advertisement[]) => data,
  });

  const { data: adSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/ad-settings"],
  });

  const adForm = useForm<InsertAdvertisement>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      name: "",
      adCode: "",
      width: 300,
      height: 250,
      position: "sidebar",
      isActive: true,
    },
  });

  const settingsForm = useForm<z.infer<typeof adSettingsFormSchema>>({
    resolver: zodResolver(adSettingsFormSchema),
    defaultValues: {
      adCount: adSettings?.adCount || "low",
      enableAds: adSettings?.enableAds || false,
    },
  });

  // Update settings form when data loads
  useEffect(() => {
    if (adSettings) {
      settingsForm.reset({
        adCount: adSettings.adCount,
        enableAds: adSettings.enableAds,
      });
    }
  }, [adSettings, settingsForm]);

  const createAdMutation = useMutation({
    mutationFn: async (data: InsertAdvertisement) => {
      const response = await apiRequest("POST", "/api/admin/advertisements", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Advertisement Created",
        description: "Advertisement has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      adForm.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Advertisement",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAdvertisement> }) => {
      const response = await apiRequest("PUT", `/api/admin/advertisements/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Advertisement Updated",
        description: "Advertisement has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
      setIsEditing(false);
      setSelectedAd(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Advertisement",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/advertisements/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Advertisement Deleted",
        description: "Advertisement has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/advertisements"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Advertisement",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof adSettingsFormSchema>) => {
      const response = await apiRequest("POST", "/api/admin/ad-settings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ad Settings Updated",
        description: "Advertisement settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ad-settings"] });
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

  const handleEdit = (ad: Advertisement) => {
    setSelectedAd(ad);
    adForm.reset({
      name: ad.name,
      adCode: ad.adCode,
      width: ad.width,
      height: ad.height,
      position: ad.position,
      isActive: ad.isActive,
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      deleteAdMutation.mutate(id);
    }
  };

  const onSubmitAd = (data: InsertAdvertisement) => {
    if (isEditing && selectedAd) {
      updateAdMutation.mutate({ id: selectedAd.id, data });
    } else {
      createAdMutation.mutate(data);
    }
  };

  const onSubmitSettings = (data: z.infer<typeof adSettingsFormSchema>) => {
    updateSettingsMutation.mutate(data);
  };

  const getAdCountLabel = (count: string) => {
    switch (count) {
      case "low": return "Low (2 ads)";
      case "medium": return "Medium (4 ads)";
      case "high": return "High (6 ads)";
      default: return count;
    }
  };

  const adPositions = [
    { value: "header", label: "Header" },
    { value: "sidebar", label: "Sidebar" },
    { value: "content", label: "Content" },
    { value: "footer", label: "Footer" },
    { value: "blog-top", label: "Blog Top" },
    { value: "blog-middle", label: "Blog Middle" },
    { value: "blog-bottom", label: "Blog Bottom" },
    { value: "generator-top", label: "Generator Top" },
    { value: "generator-bottom", label: "Generator Bottom" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Advertisement Management</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setIsEditing(false);
              setSelectedAd(null);
              adForm.reset();
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ad
          </Button>
        </div>
      </div>

      {/* Ad Settings */}
      {showSettings && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Advertisement Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...settingsForm}>
              <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={settingsForm.control}
                    name="enableAds"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-slate-300">Enable Advertisements</FormLabel>
                          <div className="text-sm text-slate-400">
                            Show advertisements on the website
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
                    control={settingsForm.control}
                    name="adCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Ad Density</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select ad count" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low (2 ads)</SelectItem>
                            <SelectItem value="medium">Medium (4 ads)</SelectItem>
                            <SelectItem value="high">High (6 ads)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                      "Update Settings"
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

      {/* Ad Form */}
      {(showForm || isEditing) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {isEditing ? "Edit Advertisement" : "Create New Advertisement"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...adForm}>
              <form onSubmit={adForm.handleSubmit(onSubmitAd)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={adForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Ad Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={adForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Position</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {adPositions.map((position) => (
                              <SelectItem key={position.value} value={position.value}>
                                {position.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={adForm.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Width (px)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            className="bg-slate-700 border-slate-600 text-white"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={adForm.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Height (px)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            className="bg-slate-700 border-slate-600 text-white"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={adForm.control}
                  name="adCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Ad Code</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={6}
                          className="bg-slate-700 border-slate-600 text-white resize-none font-mono text-sm"
                          placeholder="Paste your ad code here (HTML, JavaScript, etc.)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={adForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-600 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-slate-300">Active</FormLabel>
                        <div className="text-sm text-slate-400">
                          Enable this advertisement for display
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

                <div className="flex items-center space-x-4">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90"
                    disabled={createAdMutation.isPending || updateAdMutation.isPending}
                  >
                    {(createAdMutation.isPending || updateAdMutation.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      isEditing ? "Update Ad" : "Create Ad"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setSelectedAd(null);
                      adForm.reset();
                    }}
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

      {/* Current Settings Display */}
      {!settingsLoading && adSettings && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Current Ad Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge variant={adSettings.enableAds ? "default" : "secondary"}>
                {adSettings.enableAds ? "Ads Enabled" : "Ads Disabled"}
              </Badge>
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {getAdCountLabel(adSettings.adCount)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advertisements List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Monitor className="w-5 h-5 mr-2" />
            Advertisements ({ads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adsLoading ? (
            <div className="loading-spinner mx-auto"></div>
          ) : ads.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No advertisements yet. Create your first ad!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div key={ad.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{ad.name}</h3>
                        <Badge variant={ad.isActive ? "default" : "secondary"}>
                          {ad.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          {ad.position}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                        <span>Size: {ad.width}x{ad.height}px</span>
                        <span>Created: {new Date(ad.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-slate-300 text-sm bg-slate-800 p-2 rounded font-mono overflow-x-auto">
                        {ad.adCode.substring(0, 100)}{ad.adCode.length > 100 ? "..." : ""}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(ad)}
                        className="text-slate-300 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(ad.id)}
                        className="text-slate-300 hover:text-red-400"
                        disabled={deleteAdMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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