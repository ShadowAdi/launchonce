import { getDocumentBySlug } from "@/actions/document.action";
import { getTranslatedHtmlBySlug } from "@/actions/translation.action";
import Image from "next/image";

interface PageProps {
  params: { slug: string; lang: string };
}

export default async function DocumentTranslatedPage({ params }: PageProps) {
  const { slug, lang } = params;

  const result = await getDocumentBySlug(slug);
  if (!result.success || !result.data) {
    // In a real app, use notFound() or redirect
    return null;
  }

  const doc = result.data;

  const translated = await getTranslatedHtmlBySlug(slug, lang, "en");
  const translatedHtml = translated.success && translated.data ? translated.data.html : null;

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
            <div className="flex items-center gap-4 py-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                {doc.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium text-foreground">{doc.userName}</div>
              </div>
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

        {translatedHtml ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: translatedHtml }} />
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
