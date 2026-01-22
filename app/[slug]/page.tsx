import { getDocumentBySlug } from '@/actions/document.action';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Eye, User } from 'lucide-react';

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
    <main className="min-h-screen bg-white">
      {doc.coverImage && (
        <div className="w-full h-[40vh] relative">
          <Image
            src={doc.coverImage}
            alt={doc.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className={`${doc.coverImage ? '-mt-16 relative' : 'pt-20'} pb-4`}>
          <h1 className="text-5xl font-bold text-gray-900 mb-3 leading-tight">
            {doc.title}
          </h1>
          
          {doc.subtitle && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {doc.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{doc.userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(doc.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{doc.viewCount} views</span>
            </div>
          </div>

          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 py-4">
              {doc.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {doc.description && (
          <div className="py-6 border-b border-gray-100">
            <p className="text-lg text-gray-700 leading-relaxed">
              {doc.description}
            </p>
          </div>
        )}

        <article className="py-12 pb-24">
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-4xl prose-h1:mt-12 prose-h1:mb-6
              prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:border prose-pre:border-gray-800
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-gray-700
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-2 prose-li:text-gray-700
              prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
              prose-hr:my-12 prose-hr:border-gray-200
              prose-table:border-collapse prose-table:my-8
              prose-th:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:text-gray-900
              prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-2 prose-td:text-gray-700"
            dangerouslySetInnerHTML={{ __html: doc.content }}
          />
        </article>
      </div>

      <div className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 text-center">
          <p className="text-sm text-gray-500">
            Created by <span className="font-medium text-gray-900">{doc.userName}</span>
          </p>
          <p className="text-xs text-gray-400 mt-2">
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
