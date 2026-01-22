"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getAllDocs } from '@/actions/document.action';
import { GetDocumentPublicDto } from '@/types/docuement/create-document.dto';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<GetDocumentPublicDto[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (user?.id) {
        setIsLoadingDocs(true);
        try {
          const result = await getAllDocs(user.id);
          if (result.success && result.data) {
            setDocuments(result.data.documents);
          } else {
            toast.error('error' in result ? result.error : 'Failed to load documents');
          }
        } catch (error) {
          console.error('Error fetching documents:', error);
          toast.error('Failed to load documents');
        } finally {
          setIsLoadingDocs(false);
        }
      }
    };

    if (isAuthenticated && user) {
      fetchDocuments();
    }
  }, [user, isAuthenticated]);

  const handleCreateDocument = () => {
    router.push('/dashboard/create-document');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-gray-600 mt-1">{user?.email}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCreateDocument} size="lg">
            Create New Document
          </Button>
          <Button onClick={handleLogout} variant="outline" size="lg">
            Logout
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Your Documents</h3>
          <p className="text-sm text-gray-600 mt-1">
            Total: {documents.length} document{documents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {isLoadingDocs ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-600">Loading documents...</div>
          </div>
        ) : documents.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-600 mb-4">No documents yet</div>
            <Button onClick={handleCreateDocument}>
              Create Your First Document
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/document/${doc.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {doc.title}
                    </h4>
                    {doc.subtitle && (
                      <p className="text-sm text-gray-600 mt-1">{doc.subtitle}</p>
                    )}
                    {doc.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {doc.viewCount} views
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.visibility === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {doc.visibility}
                      </span>
                      <span>
                        {new Date(doc.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {doc.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
