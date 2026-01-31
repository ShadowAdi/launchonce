"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getFormByDocumentId, getFormResponsesByDocumentId } from "@/actions/form.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calendar, FileText, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FormDto, FormResponseDto } from "@/types/forms/form.dto";

export default function DocumentFormPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [form, setForm] = useState<FormDto | null>(null);
  const [responses, setResponses] = useState<FormResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<FormResponseDto | null>(null);
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

  const exportToCSV = () => {
    if (!form || responses.length === 0) return;

    const headers = form.fields.map(f => f.label);
    const rows = responses.map(response => {
      return form.fields.map(field => {
        const answer = response.answers.find(a => a.fieldLabel === field.label);
        return answer ? answer.value : '';
      });
    });

    const csvContent = [
      ['Submitted At', 'Public/Private', ...headers].join(','),
      ...rows.map((row, idx) => [
        new Date(responses[idx].createdAt).toLocaleString(),
        responses[idx].isPublic ? 'Public' : 'Private',
        ...row.map(cell => `"${cell.replace(/"/g, '""')}"`)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Document
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-lg text-muted-foreground max-w-2xl">{form.description}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={form.isEnabled ? "default" : "secondary"}>
                {form.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Badge variant={form.listResponsesPublicly ? "default" : "outline"}>
                {form.listResponsesPublicly ? "Public" : "Private"}
              </Badge>
              {form.isEnabled && (
                <Button
                  size="sm"
                  variant="outline"
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

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Form Fields</CardTitle>
                <CardDescription className="mt-1">
                  {form.fields.length} field{form.fields.length !== 1 ? "s" : ""} configured
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {form.fields.map((field) => (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{field.label}</h3>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs px-2 py-0">
                            Required
                          </Badge>
                        )}
                      </div>
                      {field.description && (
                        <p className="text-sm text-muted-foreground">
                          {field.description}
                        </p>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {field.type.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Responses Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Responses ({responses.length})</CardTitle>
              </div>
              {responses.length > 0 && (
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Responses will appear here once users submit the form
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Submitted At</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        {form.fields.map((field) => (
                          <TableHead key={field.id}>
                            {field.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((response) => (
                        <TableRow 
                          key={response.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(response.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={response.isPublic ? "default" : "secondary"}>
                              {response.isPublic ? "Public" : "Private"}
                            </Badge>
                          </TableCell>
                          {form.fields.map((field) => {
                            const answer = response.answers.find(a => a.fieldLabel === field.label);
                            return (
                              <TableCell key={field.id} className="max-w-xs">
                                <div className="truncate text-sm" title={answer?.value || '-'}>
                                  {answer?.value || <span className="text-muted-foreground">-</span>}
                                </div>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Selected Response Detail Modal */}
                {selectedResponse && (
                  <Card className="mt-6">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Response Details</CardTitle>
                          <CardDescription>
                            Submitted on {new Date(selectedResponse.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedResponse(null)}
                        >
                          ✕
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedResponse.answers.map((answer) => (
                          <div key={answer.id} className="border-l-2 pl-4 py-2">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              {answer.fieldLabel}
                            </p>
                            <p className="text-base">{answer.value}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
