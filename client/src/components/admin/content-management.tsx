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
import { insertBlogPostSchema, type InsertBlogPost, type BlogPost } from "@shared/schema";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Loader2
} from "lucide-react";

export function ContentManagement() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/blog/posts"],
    select: (data: BlogPost[]) => data,
  });

  const form = useForm<InsertBlogPost>({
    resolver: zodResolver(insertBlogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "",
      featured: false,
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      imageUrl: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      const response = await apiRequest("POST", "/api/admin/blog/posts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Blog post has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      form.reset();
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBlogPost> }) => {
      const response = await apiRequest("PUT", `/api/admin/blog/posts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Updated",
        description: "Blog post has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
      setIsEditing(false);
      setSelectedPost(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/blog/posts/${id}`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post Deleted",
        description: "Blog post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete Post",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    form.reset({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      author: post.author,
      featured: post.featured || false,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      keywords: post.keywords || [],
      imageUrl: post.imageUrl || "",
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(id);
    }
  };

  const onSubmit = (data: InsertBlogPost) => {
    if (isEditing && selectedPost) {
      updatePostMutation.mutate({ id: selectedPost.id, data });
    } else {
      createPostMutation.mutate(data);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Content Management</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setIsEditing(false);
            setSelectedPost(null);
            form.reset();
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Blog Post Form */}
      {(showForm || isEditing) && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">
              {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Title</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-slate-700 border-slate-600 text-white"
                            onChange={(e) => {
                              field.onChange(e);
                              if (!isEditing) {
                                form.setValue("slug", generateSlug(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Slug</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Excerpt</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""}
                          rows={3}
                          className="bg-slate-700 border-slate-600 text-white resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={10}
                          className="bg-slate-700 border-slate-600 text-white resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Author</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-slate-700 border-slate-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} className="bg-slate-700 border-slate-600 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90"
                      disabled={createPostMutation.isPending || updatePostMutation.isPending}
                    >
                      {(createPostMutation.isPending || updatePostMutation.isPending) ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isEditing ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        isEditing ? "Update Post" : "Create Post"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false);
                        setIsEditing(false);
                        setSelectedPost(null);
                        form.reset();
                      }}
                      className="text-slate-300 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Blog Posts List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Blog Posts ({posts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="loading-spinner mx-auto"></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No blog posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                        {post.featured && (
                          <Badge className="bg-primary text-white">Featured</Badge>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{post.excerpt}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                        </span>
                        <span>By {post.author}</span>
                        <span>{post.slug}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(post)}
                        className="text-slate-300 hover:text-white"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(post.id)}
                        className="text-slate-300 hover:text-red-400"
                        disabled={deletePostMutation.isPending}
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
