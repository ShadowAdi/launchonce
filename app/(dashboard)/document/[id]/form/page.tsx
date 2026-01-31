"use client";

import { useState, useEffect, use } from "react";
import { redirect, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getFormByDocumentId } from "@/actions/form.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import { FormDto } from "@/types/forms/form.dto";

export default function DocumentFormPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [form, setForm] = useState<FormDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!user?.id) {
        toast.error("You must be logged in to view this page");
        router.push("/login");
        return;
      }

      setIsLoading(true);
      try {
        const formResult = await getFormByDocumentId(resolvedParams.id, user.id);

        if (formResult.success && formResult.data) {
          setForm(formResult.data);
        } else {
          const errorMessage = formResult.success ? "Failed to load form" : formResult.error;
          toast.error(errorMessage);
          router.push(`/document/${resolvedParams.id}`);
          return;
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("An unexpected error occurred");
        router.push(`/document/${resolvedParams.id}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id, user?.id, isAuthLoading, router]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      redirect("/document")
    }
  }, [isAuthLoading, isAuthenticated])


  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/document/${resolvedParams.id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Document
            </Button>
          </Link>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant={form.isEnabled ? "default" : "secondary"}>
              {form.isEnabled ? "Enabled" : "Disabled"}
            </Badge>
            <Badge variant={form.listResponsesPublicly ? "default" : "outline"}>
              {form.listResponsesPublicly ? "Public" : "Private"}
            </Badge>

            <div className="flex gap-2 ml-auto">
              <Link href={`/document/${resolvedParams.id}/form/responses`}>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Responses
                </Button>
              </Link>
              {form.isEnabled && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => {
                    const url = `${window.location.origin}/${resolvedParams.id}/form`;
                    navigator.clipboard.writeText(url);
                    toast.success("Form link copied!");
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Form Link
                </Button>
              )}
            </div>
          </div>
        </div>
        {/* Form Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Form Configuration</CardTitle>
            <CardDescription>
              {form.fields.length} field{form.fields.length !== 1 ? "s" : ""} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {form.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{field.label}</h3>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        <Badge variant="outline" className="text-xs ml-auto">
                          {field.type.replace("_", " ")}
                        </Badge>
                      </div>
                      {field.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {field.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
