"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getDocumentById, deleteDocument } from "@/actions/document.action";
import { Button } from "@/components/ui/button";
import { GetDocumentPublicDto } from "@/types/docuement/create-document.dto";
import { Trash2, Edit, ArrowLeft, Eye, Calendar, Share2, ExternalLink, Copy, Globe } from "lucide-react";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { PartialBlock } from "@blocknote/core";
import "@blocknote/mantine/style.css";

interface DocumentWithUser extends GetDocumentPublicDto {
  userName: string;
  userEmail: string;
}

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [document, setDocument] = useState<DocumentWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchDocument = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!user?.id) {
        toast.error("You must be logged in to view this document");
        router.push("/login");
        return;
      }

      setIsLoading(true);
      try {
        const result = await getDocumentById(resolvedParams.id, user.id);

        if (result.success && result.data) {
          setDocument(result.data);
        } else {
          toast.error(!result.success ? result.error : "Failed to load document");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("An unexpected error occurred");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [resolvedParams.id, user?.id, isAuthLoading, router]);

  // Parse BlockNote content
  const initialBlocks = useMemo(() => {
    if (!document?.content || !isMounted) return undefined;
    try {
      return JSON.parse(document.content) as PartialBlock[];
    } catch {
      return [
        {
          type: "paragraph" as const,
          content: document.content,
        },
      ] as PartialBlock[];
    }
  }, [document?.content, isMounted]);

  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
  }, [initialBlocks]);

  const handleDelete = async () => {
    if (!user?.id || !document) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${document.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const result = await deleteDocument(document.id, user.id);

      if (result.success) {
        toast.success("Document deleted successfully");
        router.push("/document");
      } else {
        toast.error(!result.success ? result.error : "Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/document/${document?.id}/edit`);
  };

  const handleCopyLink = () => {
    if (document) {
      const url = `${window.location.origin}/${document.slug}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isAuthLoading || isLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-12 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-muted rounded w-32"></div>
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="space-y-3 pt-8">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document || !editor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-3">Document not found</h1>
          <p className="text-muted-foreground mb-6">
            The document you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/document')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Documents
            </Button>

            <div className="flex items-center gap-2">
              {document?.visibility === 'published' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    className="gap-2"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/${document.slug}`, '_blank')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Preview
                  </Button>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="gap-2"
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Badge & Share Info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${document.visibility === 'published'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}
            >
              {document.visibility === 'published' ? <Globe className="h-3.5 w-3.5" /> : null}
              {document.visibility}
            </span>
            {document.visibility === 'published' && (
              <span className="text-sm text-muted-foreground">
                Public at /{document.slug}
              </span>
            )}
          </div>
        </div>


        {/* Title */}
        <h1 className="text-5xl font-bold mb-3 leading-tight">
          {document.title}
        </h1>

        {/* Subtitle */}
        {document.subtitle && (
          <p className="text-xl text-muted-foreground mb-8">
            {document.subtitle}
          </p>
        )}

        {/* Author and metadata */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-12 pb-12 border-b">
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {document.userName.charAt(0).toUpperCase()}
          </div>
          <span>{document.userName}</span>
          <span>·</span>
          <time dateTime={document.createdAt}>
            {new Date(document.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>

        {/* Cover Image */}
        {document.coverImage && (
          <div className="mb-12 max-h-75 overflow-hidden">
            <img
              src={document.coverImage}
              alt={document.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Description */}
        {document.description && (
          <div className="mb-8">
            <p className="text-lg text-foreground/80 leading-relaxed">
              {document.description}
            </p>
          </div>
        )}

        {/* BlockNote Content */}
        <div className="mb-12">
          <BlockNoteView
            editor={editor}
            editable={false}
            theme="light"
          />
        </div>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="pt-8 border-t">
            <div className="flex flex-wrap gap-2">
              {document.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-muted text-muted-foreground rounded-md text-sm hover:bg-muted/80 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
