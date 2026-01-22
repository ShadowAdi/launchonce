"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getAllDocs } from '@/actions/document.action';
import { GetDocumentPublicDto } from '@/types/docuement/create-document.dto';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
    router.push('/create');
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle className="text-3xl">
                Welcome back, {user?.name || 'User'}!
              </CardTitle>
              <CardDescription className="mt-2">{user?.email}</CardDescription>
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
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Documents</CardTitle>
          <CardDescription>
            Total: {documents.length} document{documents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDocs ? (
            <div className="py-12 text-center">
              <div className="text-gray-600">Loading documents...</div>
            </div>
          ) : documents.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-gray-600 mb-4">No documents yet</div>
              <Button onClick={handleCreateDocument}>
                Create Your First Document
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/document/${doc.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {doc.title}
                    </CardTitle>
                    {doc.subtitle && (
                      <CardDescription>{doc.subtitle}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {doc.description && (
                      <p className="text-sm text-gray-600
                       line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
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
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
