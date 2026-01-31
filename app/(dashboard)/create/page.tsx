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
import { FileText, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const formFieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  type: z.enum(["short_text", "long_text", "select", "boolean", "email", "url"]),
  required: z.boolean(),
  options: z.any().optional(),
  order: z.number(),
});

const documentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  subtitle: z.string().max(300, "Subtitle must be less than 300 characters").optional().or(z.literal("")),
  description: z.string().max(500, "Description must be less than 500 characters").optional().or(z.literal("")),
  content: z.string().min(1, "Content is required"),
  coverImage: z.url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["draft", "published"]),
  enableForm: z.boolean(),
  formTitle: z.string().optional(),
  formDescription: z.string().optional(),
  listResponsesPublicly: z.boolean(),
  formFields: z.array(formFieldSchema).optional(),
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
  {
    title: "Form (Optional)",
    description: "Create response form",
  },
];

type FormFieldType = "short_text" | "long_text" | "select" | "boolean" | "email" | "url";

interface FormField {
  label: string;
  description?: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  order: number;
}

const getFieldTypeDisplay = (type: FormFieldType): string => {
  const typeMap: Record<FormFieldType, string> = {
    short_text: "Short Text",
    long_text: "Long Text",
    select: "Dropdown Select",
    boolean: "Yes/No (Checkbox)",
    email: "Email",
    url: "URL",
  };
  return typeMap[type];
};

export default function CreateDocumentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const router = useRouter();
  const { user, logout } = useAuth();

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
      enableForm: false,
      formTitle: "",
      formDescription: "",
      listResponsesPublicly: false,
      formFields: [],
    },
  });

  const onSubmit = async (data: DocumentFormValues) => {
    if (!user?.id) {
      toast.error("You must be logged in to create a document");
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const payload: any = {
        title: data.title,
        subtitle: data.subtitle || undefined,
        description: data.description || undefined,
        content: data.content,
        coverImage: data.coverImage || undefined,
        tags: data.tags ? data.tags : [],
        visibility: data.visibility,
      };

      if (data.enableForm && formFields.length > 0) {
        payload.form = {
          title: data.formTitle || "Responses",
          description: data.formDescription || undefined,
          isEnabled: true,
          listResponsesPublicly: data.listResponsesPublicly,
          fields: formFields,
        };
      }

      const result = await createDocument(payload, user.id);

      if (result.success) {
        toast.success(`Document "${result.data.title}" created successfully!`);
        form.reset();
        router.push("/document");
      } else {
        // Check if error is related to user not found
        if (result.error?.includes("User not found") || result.error?.includes("User account not found")) {
          toast.error("Your session is invalid. Please log in again.");
          logout();
          router.push("/login");
        } else {
          toast.error(result.error || "Failed to create document");
        }
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
    } else if (currentStep === 2) {
      fieldsToValidate = ["coverImage", "tags", "visibility"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === 3) {
        form.setValue("formFields", formFields);
      }
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  const addFormField = (field: FormField) => {
    setFormFields([...formFields, { ...field, order: formFields.length }]);
  };

  const startEditingField = (index: number) => {
    setEditingFieldIndex(index);
    setEditingField({ ...formFields[index] });
  };

  const saveFormField = (index: number) => {
    if (editingField) {
      const updated = [...formFields];
      updated[index] = { ...editingField, order: index };
      setFormFields(updated);
      setEditingFieldIndex(null);
      setEditingField(null);
    }
  };

  const cancelEditingField = () => {
    setEditingFieldIndex(null);
    setEditingField(null);
  };

  const deleteFormField = (index: number) => {
    const updated = formFields.filter((_, i) => i !== index);
    setFormFields(updated.map((f, i) => ({ ...f, order: i })));
  };

  const moveFieldUp = (index: number) => {
    if (index === 0) return;
    const updated = [...formFields];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setFormFields(updated.map((f, i) => ({ ...f, order: i })));
  };

  const moveFieldDown = (index: number) => {
    if (index === formFields.length - 1) return;
    const updated = [...formFields];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setFormFields(updated.map((f, i) => ({ ...f, order: i })));
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
                    {field.value && (
                      <div className="mt-4 rounded-lg border overflow-hidden">
                        <img
                          src={field.value}
                          alt="Cover preview"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
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

          {/* Step 4: Form Builder */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="enableForm"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Form</FormLabel>
                      <FormDescription>
                        Allow viewers to submit responses via a form
                      </FormDescription>
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

              {form.watch("enableForm") && (
                <>
                  <FormField<DocumentFormValues>
                    control={form.control}
                    name="formTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Feedback Form" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField<DocumentFormValues>
                    control={form.control}
                    name="formDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this form is for"
                            {...field}
                            className="min-h-20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField<DocumentFormValues>
                    control={form.control}
                    name="listResponsesPublicly"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Public Responses
                          </FormLabel>
                          <FormDescription>
                            Allow public responses to be viewable by anyone
                          </FormDescription>
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

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Form Fields</h3>
                        <p className="text-sm text-muted-foreground">
                          Add fields to collect responses
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newField: FormField = {
                            label: "New Field",
                            type: "short_text",
                            required: false,
                            order: formFields.length,
                          };
                          addFormField(newField);
                          setEditingFieldIndex(formFields.length);
                          setEditingField(newField);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    {formFields.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                          No fields yet. Click "Add Field" to get started.
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      {formFields.map((field, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          {editingFieldIndex === index && editingField ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Label *</Label>
                                <Input
                                  value={editingField.label}
                                  onChange={(e) =>
                                    setEditingField({
                                      ...editingField,
                                      label: e.target.value,
                                    })
                                  }
                                  placeholder="Field label"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                  value={editingField.description || ""}
                                  onChange={(e) =>
                                    setEditingField({
                                      ...editingField,
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Optional description"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Field Type</Label>
                                <Select
                                  value={editingField.type}
                                  onValueChange={(value) =>
                                    setEditingField({
                                      ...editingField,
                                      type: value as FormFieldType,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="short_text">
                                      Short Text
                                    </SelectItem>
                                    <SelectItem value="long_text">
                                      Long Text
                                    </SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="url">URL</SelectItem>
                                    <SelectItem value="select">
                                      Dropdown Select
                                    </SelectItem>
                                    <SelectItem value="boolean">
                                      Yes/No (Checkbox)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {editingField.type === "select" && (
                                <div className="space-y-2">
                                  <Label>Options</Label>
                                  <TagsInput
                                    value={editingField.options || []}
                                    onChange={(options) =>
                                      setEditingField({
                                        ...editingField,
                                        options,
                                      })
                                    }
                                    placeholder="Type an option and press Enter"
                                  />
                                  <p className="text-sm text-muted-foreground">
                                    Add multiple options for the dropdown select
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                  checked={editingField.required}
                                  onCheckedChange={(checked) =>
                                    setEditingField({
                                      ...editingField,
                                      required: checked,
                                    })
                                  }
                                />
                                <Label>Required field</Label>
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => saveFormField(index)}
                                >
                                  Save
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditingField}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">
                                      {field.label}
                                    </span>
                                    {field.required && (
                                      <Badge variant="secondary" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  {field.description && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {field.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {getFieldTypeDisplay(field.type)}
                                    </Badge>
                                    {field.type === "select" &&
                                      field.options &&
                                      field.options.length > 0 && (
                                        <>
                                          <span className="text-xs text-muted-foreground">•</span>
                                          <span className="text-xs text-muted-foreground">
                                            {field.options.length} option{field.options.length !== 1 ? 's' : ''}:
                                          </span>
                                          <div className="flex flex-wrap gap-1">
                                            {field.options.slice(0, 3).map((option, idx) => (
                                              <Badge key={idx} variant="secondary" className="text-xs">
                                                {option}
                                              </Badge>
                                            ))}
                                            {field.options.length > 3 && (
                                              <Badge variant="secondary" className="text-xs">
                                                +{field.options.length - 3} more
                                              </Badge>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    {field.type === "boolean" && (
                                      <>
                                        <span className="text-xs text-muted-foreground">•</span>
                                        <span className="text-xs text-muted-foreground">
                                          Checkbox input
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveFieldUp(index)}
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveFieldDown(index)}
                                  disabled={index === formFields.length - 1}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditingField(index)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteFormField(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </MultiStepForm>
      </Form>
    </div>
  );
}