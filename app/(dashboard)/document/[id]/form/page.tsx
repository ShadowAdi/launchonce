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
import { ArrowLeft, Calendar, Eye, FileText, Download, ExternalLink } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-lg text-muted-foreground max-w-2xl">{form.description}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={form.isEnabled ? "default" : "secondary"} className="px-4 py-1.5">
                {form.isEnabled ? "✓ Enabled" : "✗ Disabled"}
              </Badge>
              <Badge variant={form.listResponsesPublicly ? "default" : "outline"} className="px-4 py-1.5">
                {form.listResponsesPublicly ? "🌐 Public Responses" : "🔒 Private Responses"}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{responses.length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Public Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{responses.filter(r => r.isPublic).length}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Form Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{form.fields.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Form Fields Summary */}
        <Card className="mb-8 shadow-sm">
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
                  className="p-4 border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all"
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
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Responses</CardTitle>
                <CardDescription className="mt-1">
                  {responses.length} total submission{responses.length !== 1 ? "s" : ""}
                </CardDescription>
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
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[180px] font-semibold">Submitted At</TableHead>
                        <TableHead className="w-[120px] font-semibold">Status</TableHead>
                        {form.fields.map((field) => (
                          <TableHead key={field.id} className="font-semibold">
                            {field.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((response) => (
                        <TableRow 
                          key={response.id}
                          className="hover:bg-muted/50 cursor-pointer transition-colors"
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
                            <Badge variant={response.isPublic ? "default" : "secondary"} className="text-xs">
                              {response.isPublic ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Public
                                </>
                              ) : (
                                "Private"
                              )}
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
                  <Card className="mt-6 border-2 border-primary/20">
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
                          <div key={answer.id} className="border-l-2 border-primary/30 pl-4 py-2">
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
