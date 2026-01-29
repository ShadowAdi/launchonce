"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getDocumentById, updateDocument } from "@/actions/document.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TagsInput } from "@/components/global/TagInput";
import { ArrowLeft, FileEdit } from "lucide-react";

const documentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  subtitle: z.string().max(300, "Subtitle must be less than 300 characters").optional().or(z.literal("")),
  description: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
  content: z.string().min(1, "Content is required"),
  coverImage: z.url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["draft", "published"]),
});

type DocumentFormValues = z.infer<typeof documentSchema>;

export default function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      content: "",
      coverImage: "",
      tags: [],
      visibility: "draft",
    },
  });

  useEffect(() => {
    const fetchDocument = async () => {
      // Wait for auth to load first
      if (isAuthLoading) {
        return;
      }

      if (!user?.id) {
        toast.error("You must be logged in to edit this document");
        router.push("/login");
        return;
      }

      setIsFetching(true);
      try {
        const result = await getDocumentById(resolvedParams.id, user.id);

        if (result.success && result.data) {
          const doc = result.data;
          form.reset({
            title: doc.title,
            subtitle: doc.subtitle || "",
            description: doc.description || "",
            content: doc.content,
            coverImage: doc.coverImage || "",
            tags: doc.tags ? Array.from(doc.tags) : [],
            visibility: doc.visibility || "draft",
          });
        } else {
          toast.error(!result.success ? result.error : "Failed to load document");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("An unexpected error occurred");
        router.push("/");
      } finally {
        setIsFetching(false);
      }
    };

    fetchDocument();
  }, [resolvedParams.id, user?.id, isAuthLoading, router, form]);

  const onSubmit = async (data: DocumentFormValues) => {
    if (!user?.id) {
      toast.error("You must be logged in to update a document");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: data.title,
        subtitle: data.subtitle || undefined,
        description: data.description || undefined,
        content: data.content,
        coverImage: data.coverImage || undefined,
        tags: data.tags ? data.tags : [],
        visibility: data.visibility,
      };

      const result = await updateDocument(resolvedParams.id, user.id, payload);

      if (result.success) {
        toast.success(`Document "${result.data.title}" updated successfully!`);
        router.push(`/document/${resolvedParams.id}`);
      } else {
        toast.error(result.error || "Failed to update document");
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || isFetching) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/document/${resolvedParams.id}`)}
          size="sm"
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to document
        </Button>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileEdit className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Edit Document</h1>
        </div>
        <p className="text-muted-foreground">
          Update your document details below
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
          <CardDescription>
            Update the information about your document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document subtitle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of your document"
                        {...field}
                        className="min-h-20"
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
                    <FormLabel>Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your document content here..."
                        {...field}
                        className="min-h-64"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a URL to an image for your document cover
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagsInput
                        value={field.value || []}
                        onChange={field.onChange}
                        placeholder="e.g. technology, tutorial"
                      />
                    </FormControl>
                    <FormDescription>
                      Type a tag and press Enter (multiple tags supported)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Draft documents are only visible to you
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Document"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/document/${resolvedParams.id}`)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}