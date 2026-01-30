import { getDocumentBySlug } from "@/actions/document.action";
import { getTranslatedHtmlBySlug } from "@/actions/translation.action";
import { LanguageSelector } from "@/components/global/LanguageSelector";
import Image from "next/image";

interface PageProps {
  params: Promise<{ slug: string; lang: string }>;
}

export default async function DocumentTranslatedPage({ params }: PageProps) {
  const { slug, lang } = await params;

  const result = await getDocumentBySlug(slug);
  if (!result.success || !result.data) {
    // In a real app, use notFound() or redirect
    return null;
  }

  const doc = result.data;

  const translated = await getTranslatedHtmlBySlug(slug, lang, "en");
  const translatedHtml = translated.success && translated.data ? translated.data.html : null;

  const cleanHtml = translatedHtml?.replace(/<\/?(html|body)[^>]*>/g, "");


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
              <LanguageSelector slug={doc.slug} currentLang={lang} />
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

        {translatedHtml && cleanHtml ? (
          <div 
            className="prose prose-lg prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
              prose-p:text-base prose-p:leading-7 prose-p:mb-4
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:font-semibold prose-strong:text-foreground
              prose-code:text-sm prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:border prose-pre:border-border
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
              prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-1 prose-img:rounded-lg prose-img:shadow-md
              prose-table:border-collapse prose-table:w-full prose-td:border prose-td:p-2 prose-th:border prose-th:p-2"
            dangerouslySetInnerHTML={{ __html: cleanHtml }} 
          />
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
