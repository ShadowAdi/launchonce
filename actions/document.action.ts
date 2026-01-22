"use server"

import { db } from "@/db/db";
import { document, users } from "@/db/schema";
import { ActionResponse } from "@/types/action-response";
import { CreateDocumentDto, GetDocumentPublicDto } from "@/types/docuement/create-document.dto";
import { and, eq } from "drizzle-orm";

export const createDocument = async (payload: CreateDocumentDto, userId: string): Promise<ActionResponse<{
    id: string;
    title: string
}>> => {
    try {
        if (!payload.title || !payload.content) {
            return {
                success: false,
                error: "Title and content are required"
            };
        }

        const existingDoc = await db
            .select()
            .from(document)
            .where(eq(document.title, payload.title))
            .limit(1);

        if (existingDoc.length > 0) {
            return {
                success: false,
                error: "User with this title already exists"
            };
        }

        const [docuement] = await db.insert(document).values({
            ...payload,
            userId,
            slug: payload.title.split(" ")[0].toLowerCase()
        }).returning({
            id: document.id,
            title: document.title
        });

        return {
            success: true,
            data: docuement
        }
    } catch (error) {
        console.error(`Failed to create document:`, error);

        if (error instanceof Error) {
            if (error.message.includes("connection")) {
                return {
                    success: false,
                    error: "Database connection failed. Please try again later"
                };
            }
        }

        return {
            success: false,
            error: "Failed to create Document. Please try again"
        };
    }
}

export const getAllDocs = async (userId: string): Promise<ActionResponse<{
    documents: GetDocumentPublicDto[];
    totalDocs: number;
}>> => {
    try {

        const docs = await db
            .select({
                id: document.id,
                userId: document.userId,
                slug: document.slug,
                title: document.title,
                subtitle: document.subtitle,
                description: document.description,
                coverImage: document.coverImage,
                content: document.content,
                tags: document.tags,
                viewCount: document.viewCount,
                visibility: document.visibility,
                createdAt: document.createdAt,
            })
            .from(document)
            .where(eq(document.userId, userId));

        const formattedDocs: GetDocumentPublicDto[] = docs.map(doc => ({
            ...doc,
            userId: doc.userId as string,
            id: doc.id as string,
            slug: doc.slug as string,
            title: doc.title as string,
            subtitle: doc.subtitle ?? undefined,
            description: doc.description ?? undefined,
            content: doc.content as string,
            coverImage: doc.coverImage ?? undefined,
            tags: doc.tags as [string] | undefined,
            viewCount: doc.viewCount as number,
            visibility: (doc.visibility as "draft" | "published") ?? "draft",
            createdAt: doc.createdAt.toISOString(),
        }));

        return {
            success: true,
            data: {
                documents: formattedDocs,
                totalDocs: formattedDocs.length
            }
        }
    } catch (error) {
        console.error(`Failed to get all documents:`, error);

        if (error instanceof Error) {
            if (error.message.includes("connection")) {
                return {
                    success: false,
                    error: "Database connection failed. Please try again later"
                };
            }
        }

        return {
            success: false,
            error: "Failed to get all documents. Please try again"
        };
    }
}

// Get one document with user info
export const getDocumentById = async (docId: string, userId: string): Promise<ActionResponse<GetDocumentPublicDto & {
    userName: string;
    userEmail: string;
}>> => {
    try {
        const result = await db
            .select({
                id: document.id,
                userId: document.userId,
                slug: document.slug,
                title: document.title,
                subtitle: document.subtitle,
                description: document.description,
                coverImage: document.coverImage,
                content: document.content,
                tags: document.tags,
                viewCount: document.viewCount,
                visibility: document.visibility,
                createdAt: document.createdAt,
                userName: users.name,
                userEmail: users.email,
            })
            .from(document)
            .innerJoin(users, eq(document.userId, users.id))
            .where(and(eq(document.id, docId), eq(document.userId, userId)))
            .limit(1);

        if (result.length === 0) {
            return {
                success: false,
                error: "Document not found"
            };
        }

        const doc = result[0];
        const formattedDoc = {
            id: doc.id as string,
            userId: doc.userId as string,
            slug: doc.slug as string,
            title: doc.title as string,
            subtitle: doc.subtitle ?? undefined,
            description: doc.description ?? undefined,
            content: doc.content as string,
            coverImage: doc.coverImage ?? undefined,
            tags: doc.tags as [string] | undefined,
            viewCount: doc.viewCount as number,
            visibility: (doc.visibility as "draft" | "published") ?? "draft",
            createdAt: doc.createdAt.toISOString(),
            userName: doc.userName as string,
            userEmail: doc.userEmail as string,
        };

        return {
            success: true,
            data: formattedDoc
        };
    } catch (error) {
        console.error(`Failed to get document:`, error);

        if (error instanceof Error) {
            if (error.message.includes("connection")) {
                return {
                    success: false,
                    error: "Database connection failed. Please try again later"
                };
            }
        }

        return {
            success: false,
            error: "Failed to get document. Please try again"
        };
    }
}

// Delete document
export const deleteDocument = async (docId: string, userId: string): Promise<ActionResponse<{ message: string }>> => {
    try {
        const result = await db
            .delete(document)
            .where(and(eq(document.id, docId), eq(document.userId, userId)))
            .returning({ id: document.id });

        if (result.length === 0) {
            return {
                success: false,
                error: "Document not found or you don't have permission to delete it"
            };
        }

        return {
            success: true,
            data: { message: "Document deleted successfully" }
        };
    } catch (error) {
        console.error(`Failed to delete document:`, error);

        if (error instanceof Error) {
            if (error.message.includes("connection")) {
                return {
                    success: false,
                    error: "Database connection failed. Please try again later"
                };
            }
        }

        return {
            success: false,
            error: "Failed to delete document. Please try again"
        };
    }
}

// Update document
export const updateDocument = async (
    docId: string,
    userId: string,
    payload: Partial<CreateDocumentDto>
): Promise<ActionResponse<{ id: string; title: string }>> => {
    try {
        // Check if document exists and belongs to user
        const existingDoc = await db
            .select()
            .from(document)
            .where(and(eq(document.id, docId), eq(document.userId, userId)))
            .limit(1);

        if (existingDoc.length === 0) {
            return {
                success: false,
                error: "Document not found or you don't have permission to update it"
            };
        }

        // Update slug if title is changed
        const updateData: any = { ...payload };
        if (payload.title) {
            updateData.slug = payload.title.split(" ")[0].toLowerCase();
        }

        const [updatedDoc] = await db
            .update(document)
            .set(updateData)
            .where(and(eq(document.id, docId), eq(document.userId, userId)))
            .returning({
                id: document.id,
                title: document.title
            });

        return {
            success: true,
            data: updatedDoc
        };
    } catch (error) {
        console.error(`Failed to update document:`, error);

        if (error instanceof Error) {
            if (error.message.includes("connection")) {
                return {
                    success: false,
                    error: "Database connection failed. Please try again later"
                };
            }
        }

        return {
            success: false,
            error: "Failed to update document. Please try again"
        };
    }
}

// Increase view count
export const increaseViewCount = async (docId: string): Promise<ActionResponse<{ viewCount: number }>> => {
    try {
        // First get current view count
        const [currentDoc] = await db
            .select({ viewCount: document.viewCount })
            .from(document)
            .where(eq(document.id, docId))
            .limit(1);

        if (!currentDoc) {
            return {
                success: false,
                error: "Document not found"
            };
        }

        const newViewCount = (currentDoc.viewCount as number) + 1;

        await db
            .update(document)
            .set({ viewCount: newViewCount })
            .where(eq(document.id, docId));

        return {
            success: true,
            data: { viewCount: newViewCount }
        };
    } catch (error) {
        console.error(`Failed to increase view count:`, error);

        return {
            success: false,
            error: "Failed to increase view count. Please try again"
        };
    }
}

// Get document by slug (public access for published documents)
export const getDocumentBySlug = async (slug: string): Promise<ActionResponse<GetDocumentPublicDto & {
    userName: string;
}>> => {
    try {
        const result = await db
            .select({
                id: document.id,
                userId: document.userId,
                slug: document.slug,
                title: document.title,
                subtitle: document.subtitle,
                description: document.description,
                coverImage: document.coverImage,
                content: document.content,
                tags: document.tags,
                viewCount: document.viewCount,
                visibility: document.visibility,
                createdAt: document.createdAt,
                userName: users.name,
            })
            .from(document)
            .innerJoin(users, eq(document.userId, users.id))
            .where(and(eq(document.slug, slug), eq(document.visibility, "published")))
            .limit(1);

        if (result.length === 0) {
            return {
                success: false,
                error: "Document not found or not published"
            };
        }

        const doc = result[0];
        const formattedDoc = {
            id: doc.id as string,
            userId: doc.userId as string,
            slug: doc.slug as string,
            title: doc.title as string,
            subtitle: doc.subtitle ?? undefined,
            description: doc.description ?? undefined,
            content: doc.content as string,
            coverImage: doc.coverImage ?? undefined,
            tags: doc.tags as [string] | undefined,
            viewCount: doc.viewCount as number,
            visibility: (doc.visibility as "draft" | "published") ?? "draft",
            createdAt: doc.createdAt.toISOString(),
            userName: doc.userName as string,
        };

        // Automatically increase view count when document is accessed
        const newViewCount = (doc.viewCount as number) + 1;
        await db
            .update(document)
            .set({ viewCount: newViewCount })
            .where(eq(document.id, doc.id as string));

        return {
            success: true,
            data: { ...formattedDoc, viewCount: newViewCount }
        };
    } catch (error) {
        console.error(`Failed to get document by slug:`, error);

        if (error instanceof Error) {
            if (error.message.includes("connection")) {
                return {
                    success: false,
                    error: "Database connection failed. Please try again later"
                };
            }
        }

        return {
            success: false,
            error: "Failed to get document. Please try again"
        };
    }
}