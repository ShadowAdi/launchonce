"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getDocumentById, deleteDocument } from "@/actions/document.action";
import { Button } from "@/components/ui/button";
import { GetDocumentPublicDto } from "@/types/docuement/create-document.dto";
import { Trash2, Edit, ArrowLeft, Eye } from "lucide-react";

interface DocumentWithUser extends GetDocumentPublicDto {
  userName: string;
  userEmail: string;
}

export default function DocumentPage({ params }: { params: { id: string } }) {
  const [document, setDocument] = useState<DocumentWithUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDocument = async () => {
      if (!user?.id) {
        toast.error("You must be logged in to view this document");
        router.push("/login");
        return;
      }

      setIsLoading(true);
      try {
        const result = await getDocumentById(params.id, user.id);

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
  }, [params.id, user?.id, router]);

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
        router.push("/");
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
    router.push(`/${document?.id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Document not found</h1>
          <Button onClick={() => router.push("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push("/")} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit} size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            size="sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {document.viewCount} views
          </span>
          <span>•</span>
          <span>
            {new Date(document.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span>•</span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              document.visibility === "published"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            }`}
          >
            {document.visibility}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          By {document.userName} ({document.userEmail})
        </p>
      </div>

      {/* Cover image */}
      {document.coverImage && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={document.coverImage}
            alt={document.title}
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>
      )}

      {/* Document content */}
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-2">{document.title}</h1>

        {document.subtitle && (
          <p className="text-xl text-muted-foreground mb-4">{document.subtitle}</p>
        )}

        {document.description && (
          <p className="text-lg text-muted-foreground mb-6 pb-6 border-b">
            {document.description}
          </p>
        )}

        <div className="whitespace-pre-wrap">{document.content}</div>
      </article>

      {/* Tags */}
      {document.tags && document.tags.length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-sm font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}