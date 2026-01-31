"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getFormBySlug, submitFormResponse } from "@/actions/form.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import { FormDto } from "@/types/forms/form.dto";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function PublicFormPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [form, setForm] = useState<FormDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [makePublic, setMakePublic] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchForm = async () => {
      setIsLoading(true);
      try {
        const result = await getFormBySlug(resolvedParams.slug);

        if (result.success && result.data) {
          setForm(result.data);
          // Initialize form data with empty strings
          const initialData: Record<string, string> = {};
          result.data.fields.forEach((field) => {
            initialData[field.id] = "";
          });
          setFormData(initialData);
        } else {
          const errorMessage = result.success ? "Failed to load form" : result.error;
          toast.error(errorMessage);
          router.push(`/${resolvedParams.slug}`);
        }
      } catch (error) {
        console.error("Error fetching form:", error);
        toast.error("An unexpected error occurred");
        router.push(`/${resolvedParams.slug}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [resolvedParams.slug, router]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    // Validate required fields
    const missingFields = form.fields
      .filter((field) => field.required && !formData[field.id]?.trim())
      .map((field) => field.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const answers = Object.entries(formData)
        .filter(([_, value]) => value.trim() !== "")
        .map(([fieldId, value]) => ({
          fieldId,
          value,
        }));

      const result = await submitFormResponse(resolvedParams.slug, {
        answers,
        isPublic: makePublic,
      });

      if (result.success) {
        toast.success("Form submitted successfully!");
        setIsSubmitted(true);
      } else {
        toast.error(result.error || "Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormDto["fields"][0]) => {
    const value = formData[field.id] || "";

    switch (field.type) {
      case "short_text":
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );

      case "long_text":
        return (
          <Textarea
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
            required={field.required}
            rows={4}
          />
        );

      case "email":
        return (
          <Input
            id={field.id}
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description || "Enter email address"}
            required={field.required}
          />
        );

      case "url":
        return (
          <Input
            id={field.id}
            type="url"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description || "Enter URL"}
            required={field.required}
          />
        );

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={value === "true"}
              onCheckedChange={(checked) =>
                handleFieldChange(field.id, checked ? "true" : "false")
              }
            />
            <Label htmlFor={field.id} className="cursor-pointer">
              {field.description || "Toggle option"}
            </Label>
          </div>
        );

      case "select":
        const options = field.options as string[] | undefined;
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger id={field.id}>
              <SelectValue placeholder={field.description || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options && options.length > 0 ? (
                options.map((option, idx) => (
                  <SelectItem key={idx} value={option}>
                    {option}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.description}
            required={field.required}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-2xl border-2">
            <CardContent className="py-16">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Thank You!</h2>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Your response has been submitted successfully. We appreciate your time and feedback.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Link href={`/${resolvedParams.slug}`}>
                    <Button size="lg" className="w-full sm:w-auto">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Document
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setIsSubmitted(false);
                      // Reset form data
                      const initialData: Record<string, string> = {};
                      form.fields.forEach((field) => {
                        initialData[field.id] = "";
                      });
                      setFormData(initialData);
                      setMakePublic(false);
                    }}
                  >
                    Submit Another Response
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/${resolvedParams.slug}`}>
            <Button variant="ghost" size="sm" className="mb-6 hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Document
            </Button>
          </Link>

          <div className="flex items-start gap-4 mb-4">
            <div className="p-4 rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-lg text-muted-foreground">{form.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-lg border-2">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl">Fill Out the Form</CardTitle>
            <CardDescription className="text-base">
              Fields marked with <span className="text-destructive font-medium">*</span> are required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field, index) => (
                <div 
                  key={field.id} 
                  className="space-y-3 p-5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={field.id} className="text-base font-medium">
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-muted-foreground">{field.description}</p>
                      )}
                      <div className="pt-1">
                        {renderField(field)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Public Response Toggle */}
              {form.listResponsesPublicly && (
                <div className="pt-6 border-t">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="make-public" className="text-base font-medium cursor-pointer">
                        Make my response public
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your response publicly
                      </p>
                    </div>
                    <Switch
                      id="make-public"
                      checked={makePublic}
                      onCheckedChange={setMakePublic}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-base font-medium h-12" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Submit Response
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Your response will be recorded and may be reviewed by the form owner.</p>
        </div>
      </div>
    </div>
  );
}
