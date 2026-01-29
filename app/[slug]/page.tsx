import { getDocumentBySlug } from '@/actions/document.action';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Eye } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DocumentPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getDocumentBySlug(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const doc = result.data;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Section */}
        <div className={`${doc.coverImage ? '-mt-32 relative z-10' : 'pt-20'} pb-8`}>
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              {doc.title}
            </h1>

            {doc.subtitle && (
              <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed">
                {doc.subtitle}
              </p>
            )}

            {/* Author Card */}
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

            {/* Tags */}
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {doc.tags.map((tag, index) => (
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


        {/* Content */}
        <div className="py-12 pb-20">
          <div
            className="prose prose-lg sm:prose-xl max-w-none dark:prose-invert
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-6
              prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-5
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:leading-relaxed prose-p:mb-6 prose-p:text-foreground/90
              prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4
              prose-strong:font-semibold prose-strong:text-foreground
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:font-mono prose-code:text-base prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted/50 prose-pre:rounded-xl prose-pre:border prose-pre:shadow-sm
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:rounded-r-lg
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-2 prose-li:text-foreground/90
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-10 prose-img:border
              prose-hr:my-12 prose-hr:border-muted
              prose-table:border-collapse prose-table:my-8 prose-table:rounded-lg prose-table:overflow-hidden
              prose-th:bg-muted/50 prose-th:border prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-semibold
              prose-td:border prose-td:px-4 prose-td:py-3 prose-td:text-foreground/90"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </div>
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

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const result = await getDocumentBySlug(slug);

  if (!result.success || !result.data) {
    return {
      title: 'Document Not Found',
    };
  }

  const doc = result.data;

  return {
    title: doc.title,
    description: doc.description || doc.subtitle || `Read ${doc.title} on LaunchOnce`,
    openGraph: {
      title: doc.title,
      description: doc.description || doc.subtitle,
      images: doc.coverImage ? [doc.coverImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: doc.title,
      description: doc.description || doc.subtitle,
      images: doc.coverImage ? [doc.coverImage] : [],
    },
  };
}
