"use client";

import { useState, useEffect, use } from "react";
import { redirect, useRouter } from "next/navigation";
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
import { ArrowLeft, Calendar, FileText, Download } from "lucide-react";
import Link from "next/link";
import { FormDto, FormResponseDto } from "@/types/forms/form.dto";

export default function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [form, setForm] = useState<FormDto | null>(null);
  const [responses, setResponses] = useState<FormResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<FormResponseDto | null>(null);
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

  if (!isAuthLoading && !isAuthenticated) {
    redirect("/document")
  }

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
            <div className="h-64 bg-muted rounded"></div>
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
        <div className="mb-8">
          <Link href={`/document/${resolvedParams.id}/form`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Form Settings
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{form.title} - Responses</h1>
              <p className="text-muted-foreground">
                View and manage all form submissions
              </p>
            </div>
            {responses.length > 0 && (
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Responses ({responses.length})</CardTitle>
            <CardDescription>
              {responses.filter(r => r.isPublic).length} public, {responses.filter(r => !r.isPublic).length} private
            </CardDescription>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                <p className="text-muted-foreground">
                  Responses will appear here once users submit the form
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-45">Submitted At</TableHead>
                        <TableHead className="w-25">Status</TableHead>
                        {form.fields.map((field) => (
                          <TableHead key={field.id} className="min-w-50">
                            {field.label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responses.map((response) => (
                        <TableRow
                          key={response.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(response.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={response.isPublic ? "default" : "secondary"} className="text-xs">
                              {response.isPublic ? "Public" : "Private"}
                            </Badge>
                          </TableCell>
                          {form.fields.map((field) => {
                            const answer = response.answers.find(a => a.fieldLabel === field.label);
                            return (
                              <TableCell key={field.id}>
                                <div className="max-w-[300px] truncate" title={answer?.value || '-'}>
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

                {selectedResponse && (
                  <Card className="mt-6 border">
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
