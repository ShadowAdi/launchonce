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
    <main className="min-h-screen bg-background">
      {/* Cover Image */}
      {doc.coverImage && (
        <div className="w-full h-[50vh] relative bg-muted">
          <Image
            src={doc.coverImage}
            alt={doc.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Section */}
        <div className={`${doc.coverImage ? 'py-12' : 'pt-20 pb-8'}`}>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            {doc.title}
          </h1>
          
          {doc.subtitle && (
            <p className="text-xl text-muted-foreground mb-6">
              {doc.subtitle}
            </p>
          )}

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground py-6 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {doc.userName.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{doc.userName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(doc.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{doc.viewCount} views</span>
            </div>
          </div>

          {/* Tags */}
          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-6">
              {doc.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {doc.description && (
          <div className="py-8 border-b">
            <p className="text-lg text-foreground/80 leading-relaxed">
              {doc.description}
            </p>
          </div>
        )}

        {/* Content */}
        <article className="py-12 pb-20">
          <div
            className="prose prose-lg max-w-none dark:prose-invert
              prose-headings:font-bold
              prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-6
              prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:font-semibold
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-muted prose-pre:rounded-lg prose-pre:border
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-2
              prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
              prose-hr:my-12
              prose-table:border-collapse prose-table:my-8
              prose-th:bg-muted prose-th:border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
              prose-td:border prose-td:px-4 prose-td:py-2"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </article>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Created by <span className="font-medium text-foreground">{doc.userName}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Powered by LaunchOnce
          </p>
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
