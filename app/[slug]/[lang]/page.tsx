"use client";

import { use, useEffect, useState } from "react";
import { getDocumentBySlug } from "@/actions/document.action";
import { getTranslatedHtmlBySlug } from "@/actions/translation.action";
import { LanguageSelector } from "@/components/global/LanguageSelector";
import Image from "next/image";
import dynamic from "next/dynamic";
import { PartialBlock } from "@blocknote/core";

const BlockNoteEditor = dynamic(
  () => import("@/components/global/BlockNoteEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse space-y-3 pt-8">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    ),
  }
);

interface PageProps {
  params: Promise<{ slug: string; lang: string }>;
}

export default function DocumentTranslatedPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [doc, setDoc] = useState<any>(null);
  const [translatedBlocks, setTranslatedBlocks] = useState<PartialBlock[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getDocumentBySlug(resolvedParams.slug);
        if (!result.success || !result.data) {
          return;
        }
        setDoc(result.data);

        const translated = await getTranslatedHtmlBySlug(
          resolvedParams.slug,
          resolvedParams.lang,
          "en"
        );

        if (translated.success && translated.data?.blocks) {
          setTranslatedBlocks(JSON.parse(translated.data.blocks));
        }
      } catch (error) {
        console.error("Error fetching translation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.slug, resolvedParams.lang]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded w-3/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!doc) return null;


  return (
    <main className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      {doc.coverImage && (
        <div className="w-full h-[60vh] relative bg-muted">
          <Image src={doc.coverImage} alt={doc.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`${doc.coverImage ? "-mt-32 relative z-10" : "pt-20"} pb-8`}>
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              {doc.title}
            </h1>
            {doc.subtitle && (
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                {doc.subtitle}
              </p>
            )}
            <div className="flex items-center justify-between gap-4 py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                  {doc.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-foreground">{doc.userName}</div>
                </div>
              </div>
              <LanguageSelector slug={doc.slug} currentLang={resolvedParams.lang} />
            </div>

            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {doc.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {doc.description && (
          <div className="mb-8">
            <p className="text-lg text-foreground/80 leading-relaxed">{doc.description}</p>
          </div>
        )}

        {translatedBlocks ? (
          <BlockNoteEditor initialContent={translatedBlocks} editable={false} />
        ) : (
          <p className="text-muted-foreground">Translation unavailable.</p>
        )}
      </article>

      <div className="border-t bg-muted/20 mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
              {doc.userName.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">Written by {doc.userName}</p>
              <p className="text-xs text-muted-foreground">Powered by LaunchOnce</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
