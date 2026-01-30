"use client";

import { useState, useEffect, use, useMemo } from 'react';
import { getDocumentBySlug } from '@/actions/document.action';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PartialBlock } from "@blocknote/core";
import { toast } from "sonner";
import { LanguageSelector } from '@/components/global/LanguageSelector';
import "@blocknote/mantine/style.css";

// Dynamic import to prevent SSR issues with BlockNote
const BlockNoteEditor = dynamic(
  () => import('@/components/global/BlockNoteEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-3 pt-8">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    )
  }
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function DocumentPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  // Client should not run translation; render original content only

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      try {
        const result = await getDocumentBySlug(resolvedParams.slug);

        if (result.success && result.data) {
          setDoc(result.data);
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
  }, [resolvedParams.slug, router]);

  const initialBlocks = useMemo(() => {
    if (!doc?.content || !isMounted) return undefined;
    try {
      return JSON.parse(doc.content) as PartialBlock[];
    } catch {
      return [
        {
          type: "paragraph" as const,
          content: doc.content,
        },
      ] as PartialBlock[];
    }
  }, [doc?.content, isMounted]);

  // Removed client-side translation. SEO-friendly translations are served from server routes.

  if (isLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="flex items-center gap-4 py-6">
              <div className="h-12 w-12 rounded-full bg-muted"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-3 bg-muted rounded w-48"></div>
              </div>
            </div>
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

  if (!doc) {
    return null;
  }


  return (
    <main className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      {/* Cover Image */}
      {doc.coverImage && (
        <div className="w-full h-[60vh] relative bg-muted">
          <Image
            src={doc.coverImage}
            alt={doc.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${doc.coverImage ? '-mt-32 relative z-10' : 'pt-20'} pb-8`}>
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight flex-1">
                {doc.title}
              </h1>
              <LanguageSelector slug={doc.slug} currentLang="en" />
            </div>

            {doc.subtitle && (
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                {doc.subtitle}
              </p>
            )}

            <div className="flex items-center gap-4 py-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                {doc.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-foreground">{doc.userName}</div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(doc.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {doc.viewCount} views
                  </span>
                </div>
              </div>
            </div>

            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {doc.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {doc.description && (
          <div className="mb-8">
            <p className="text-lg text-foreground/80 leading-relaxed">
              {doc.description}
            </p>
          </div>
        )}

        {initialBlocks && <BlockNoteEditor initialContent={initialBlocks} editable={false} />}
      </article>

      {/* Footer */}
      <div className="border-t bg-muted/20 mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
              {doc.userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">
                Written by {doc.userName}
              </p>
              <p className="text-xs text-muted-foreground">
                Powered by LaunchOnce
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
