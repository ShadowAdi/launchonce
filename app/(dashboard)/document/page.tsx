"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getAllDocs } from '@/actions/document.action';
import { GetDocumentPublicDto } from '@/types/docuement/create-document.dto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Search, LogOut, Eye, Calendar, FileText, Sparkles } from 'lucide-react';
import Image from 'next/image';

const DashboardPage = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<GetDocumentPublicDto[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'published' | 'draft'>('all');

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

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = filterVisibility === 'all' || doc.visibility === filterVisibility;

      return matchesSearch && matchesFilter;
    });
  }, [documents, searchQuery, filterVisibility]);

  const handleCreateDocument = () => {
    router.push('/create');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">My Documents</h1>
                <p className="text-xs text-muted-foreground">{user?.name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateDocument} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Document</span>
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">Filter:</span>
            <div className="flex gap-2">
              <Button
                variant={filterVisibility === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVisibility('all')}
                className="rounded-full"
              >
                All ({documents.length})
              </Button>
              <Button
                variant={filterVisibility === 'published' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVisibility('published')}
                className="rounded-full"
              >
                Published ({documents.filter(d => d.visibility === 'published').length})
              </Button>
              <Button
                variant={filterVisibility === 'draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVisibility('draft')}
                className="rounded-full"
              >
                Draft ({documents.filter(d => d.visibility === 'draft').length})
              </Button>
            </div>
          </div>
        </div>

        {isLoadingDocs ? (
          <div className="py-20 text-center">
            <div className="text-muted-foreground">Loading documents...</div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-muted-foreground mb-4">
              {searchQuery || filterVisibility !== 'all'
                ? 'No documents match your filters'
                : 'No documents yet. Start creating!'}
            </div>
            {!searchQuery && filterVisibility === 'all' && (
              <Button onClick={handleCreateDocument} size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Create Your First Document
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group relative border rounded-xl overflow-hidden hover:shadow-lg  transition-all cursor-pointer bg-card"
                onClick={() => router.push(`/document/${doc.id}`)}
              >
                {/* Cover Image */}
                {doc.coverImage ? (
                  <div className="relative h-40 w-full bg-muted overflow-hidden">
                    <Image
                      src={doc.coverImage}
                      alt={doc.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold text-lg line-clamp-2 drop-shadow-lg">
                        {doc.title}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-40 w-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                    <FileText className="h-12 w-12 text-primary/20" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${doc.visibility === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                    >
                      {doc.visibility}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {doc.viewCount}
                    </span>
                  </div>

                  {doc.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.description}
                    </p>
                  )}

                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="px-2 py-0.5 text-muted-foreground text-xs">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                    <Calendar className="h-3 w-3" />
                    {new Date(doc.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
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
