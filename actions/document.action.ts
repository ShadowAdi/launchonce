"use server"

import { db } from "@/db/db";
import { document } from "@/db/schema";
import { ActionResponse } from "@/types/action-response";
import { CreateDocumentDto, GetDocumentPublicDto } from "@/types/docuement/create-document.dto";
import { eq } from "drizzle-orm";

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