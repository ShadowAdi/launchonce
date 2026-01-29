"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { createDocument } from "@/actions/document.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { BlockNoteEditorComponent } from "@/components/global/BlockNoteEditor";
import { MultiStepForm } from "@/components/global/MultiStepForm";
import { FileText } from "lucide-react";

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

const steps = [
  {
    title: "Basic Info",
    description: "Title and description",
  },
  {
    title: "Content",
    description: "Write your content",
  },
  {
    title: "Settings",
    description: "Media and visibility",
  },
];

export default function CreateDocumentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

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

  const onSubmit = async (data: DocumentFormValues) => {
    if (!user?.id) {
      toast.error("You must be logged in to create a document");
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

      const result = await createDocument(payload, user.id);

      if (result.success) {
        toast.success(`Document "${result.data.title}" created successfully!`);
        form.reset();
        router.push("/");
      } else {
        toast.error(result.error || "Failed to create document");
      }
    } catch (error) {
      console.error("Error creating document:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    let fieldsToValidate: (keyof DocumentFormValues)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["title", "subtitle", "description"];
    } else if (currentStep === 1) {
      fieldsToValidate = ["content"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  const canGoNext = () => {
    if (currentStep === 0) {
      return form.watch("title").length > 0;
    }
    if (currentStep === 1) {
      return form.watch("content").length > 0;
    }
    return true;
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Create New Document</h1>
        </div>
        <p className="text-muted-foreground">
          Follow the steps to create your document
        </p>
      </div>

      <Form {...form}>
        <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onNext={handleNext}
          onPrev={handlePrev}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          canGoNext={canGoNext()}
        >
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
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
                    <FormDescription>
                      A short summary of what this document is about
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Content */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content *</FormLabel>
                    <FormControl>
                      <BlockNoteEditorComponent
                        onChange={field.onChange}
                        initialContent={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Write your document content using the rich text editor
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
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
            </div>
          )}
        </MultiStepForm>
      </Form>
    </div>
  );
}
