"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getAllDocs } from '@/actions/document.action';
import { GetDocumentPublicDto } from '@/types/docuement/create-document.dto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus, Search, LogOut, Eye, Calendar } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold">My Documents</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleCreateDocument} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Document
              </Button>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterVisibility === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterVisibility('all')}
            >
              All
            </Button>
            <Button
              variant={filterVisibility === 'published' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterVisibility('published')}
            >
              Published
            </Button>
            <Button
              variant={filterVisibility === 'draft' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterVisibility('draft')}
            >
              Draft
            </Button>
          </div>
        </div>

        {/* Documents List */}
        {isLoadingDocs ? (
          <div className="py-20 text-center">
            <div className="text-muted-foreground">Loading documents...</div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-muted-foreground mb-4">
              {searchQuery || filterVisibility !== 'all' 
                ? 'No documents match your filters' 
                : 'No documents yet'}
            </div>
            {!searchQuery && filterVisibility === 'all' && (
              <Button onClick={handleCreateDocument}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Document
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer bg-card"
                onClick={() => router.push(`/document/${doc.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                        {doc.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          doc.visibility === 'published'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {doc.visibility}
                      </span>
                    </div>
                    
                    {doc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {doc.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(doc.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {doc.viewCount} views
                      </span>
                    </div>

                    {doc.tags && doc.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {doc.tags.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 5 && (
                          <span className="px-2 py-0.5 text-muted-foreground text-xs">
                            +{doc.tags.length - 5} more
                          </span>
                        )}
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
