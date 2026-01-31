"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getFormByDocumentId, getFormResponsesByDocumentId } from "@/actions/form.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Eye, FileText } from "lucide-react";
import Link from "next/link";
import { FormDto, FormResponseDto } from "@/types/forms/form.dto";

export default function DocumentFormPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [form, setForm] = useState<FormDto | null>(null);
  const [responses, setResponses] = useState<FormResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

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
        const [formResult, responsesResult] = await Promise.all([
          getFormByDocumentId(resolvedParams.id, user.id),
          getFormResponsesByDocumentId(resolvedParams.id, user.id),
        ]);

        if (formResult.success && formResult.data) {
          setForm(formResult.data);
        } else {
          const errorMessage = formResult.success ? "Failed to load form" : formResult.error;
          toast.error(errorMessage);
          router.push(`/document/${resolvedParams.id}`);
          return;
        }

        if (responsesResult.success && responsesResult.data) {
          setResponses(responsesResult.data.responses);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
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
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/document/${resolvedParams.id}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Document
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{form.title}</h1>
              {form.description && (
                <p className="text-muted-foreground mt-2">{form.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={form.isEnabled ? "default" : "secondary"}>
                {form.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Badge variant={form.listResponsesPublicly ? "default" : "outline"}>
                {form.listResponsesPublicly ? "Public Responses" : "Private Responses"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Form Fields</CardTitle>
              <CardDescription>
                {form.fields.length} field{form.fields.length !== 1 ? "s" : ""} configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {form.fields.map((field) => (
                  <div
                    key={field.id}
                    className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{field.label}</h3>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {field.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {field.type.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              Responses ({responses.length})
            </h2>
          </div>

          {responses.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                  <p className="text-muted-foreground">
                    Responses will appear here once users submit the form
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Response #{response.id.slice(0, 8)}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(response.createdAt).toLocaleDateString()}
                        </div>
                        <Badge variant={response.isPublic ? "default" : "secondary"}>
                          {response.isPublic ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Public
                            </>
                          ) : (
                            "Private"
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {response.answers.map((answer) => (
                        <div key={answer.id} className="border-l-2 border-primary/20 pl-4">
                          <p className="text-sm font-medium text-muted-foreground">
                            {answer.fieldLabel}
                          </p>
                          <p className="mt-1">{answer.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
