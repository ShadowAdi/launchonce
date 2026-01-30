"use server"

import { db } from "@/db/db";
import { document, formFields, forms, translations, users } from "@/db/schema";
import { ActionResponse } from "@/types/action-response";
import { CreateDocumentDto, GetDocumentPublicDto } from "@/types/docuement/create-document.dto";
import {
    DocumentUpdateDto,
    UpdateFormDto,
    UpdateFormFieldsDto,
    FormFieldCreateDto,
    FormFieldUpdateDto,
} from "@/types/docuement/update-document.dto";
import { and, eq, inArray } from "drizzle-orm";

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

        const result = await db.transaction(async (tx) => {
            const [createDocument] = await tx.insert(document).values({
                title: payload.title,
                subtitle: payload.subtitle,
                description: payload.description,
                content: payload.content,
                coverImage: payload.coverImage,
                tags: payload.tags,
                visibility: payload.visibility ?? "draft",
                userId,
                slug: payload.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, ""),
            }).returning({
                id: document.id,
                title: document.title,
            });

            if (payload.form) {
                const [createdForm] = await tx.insert(forms).values({
                    documentId: createDocument.id,
                    title: payload.form.title,
                    description: payload.form.description,
                    listResponsesPublicly:
                        payload.form.listResponsesPublicly ?? false,
                    isEnabled: payload.form.isEnabled ?? false,
                }).returning({ id: forms.id });

                if (payload.form.fields?.length > 0) {
                    await tx.insert(formFields).values(
                        payload.form.fields.map((field) => ({
                            formId: createdForm.id,
                            label: field.label,
                            description: field.description,
                            type: field.type,
                            required: field.required ?? false,
                            options: field.options,
                            order: field.order,
                        }))
                    )
                }
            }
            return createDocument
        })

        return {
            success: true,
            data: {
                id: result.id,
                title: result.title
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
            error: "Failed to create document. Please try again"
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
        const doc = existingDoc[0];
        await db
            .delete(translations)
            .where(eq(translations.slug, doc.slug))
            .returning({ id: document.id });
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
        const result = await db.transaction(async (tx) => {
            const [existingDoc] = await tx
                .select({ id: document.id })
                .from(document)
                .where(and(eq(document.id, docId), eq(document.userId, userId)))
                .limit(1);

            if (!existingDoc) {
                throw new Error("NOT_FOUND");
            }

            const { form, ...documentPayload } = payload;

            const updateData: any = { ...documentPayload };

            if (payload.title) {
                updateData.slug = payload.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
            }

            const [updatedDoc] = await tx
                .update(document)
                .set(updateData)
                .where(and(eq(document.id, docId), eq(document.userId, userId)))
                .returning({
                    id: document.id,
                    title: document.title,
                });

            if (form) {
                const [existingForm] = await tx
                    .select({ id: forms.id })
                    .from(forms)
                    .where(eq(forms.documentId, docId))
                    .limit(1);

                if (existingForm) {
                    // Update form metadata
                    await tx.update(forms).set({
                        title: form.title,
                        description: form.description,
                        listResponsesPublicly: form.listResponsesPublicly,
                        isEnabled: form.isEnabled,
                    }).where(eq(forms.id, existingForm.id));
                } else {
                    const [newForm] = await tx
                        .insert(forms)
                        .values({
                            documentId: docId,
                            title: form.title ?? "Responses",
                            description: form.description ?? null,
                            listResponsesPublicly: form.listResponsesPublicly ?? false,
                            isEnabled: form.isEnabled ?? false,
                        })
                        .returning({ id: forms.id });
                    if (form.fields && form.fields.length > 0) {
                        await tx.insert(formFields).values(
                            form.fields.map((f) => ({
                                formId: newForm.id,
                                label: f.label,
                                description: f.description ?? null,
                                type: f.type,
                                required: f.required ?? false,
                                options: f.options ?? null,
                                order: f.order,
                            }))
                        );
                    }
                }
            }

            return updatedDoc;
        });

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            return {
                success: false,
                error: "Document not found or you don't have permission to update it",
            };
        }

        console.error("Failed to update document:", error);

        return {
            success: false,
            error: "Failed to update document. Please try again",
        };
    }
};

export const updateFormMeta = async (
    docId: string,
    userId: string,
    payload: UpdateFormDto
): Promise<ActionResponse<{ id: string }>> => {
    try {
        const result = await db.transaction(async (tx) => {
            const [docRow] = await tx
                .select({ id: document.id })
                .from(document)
                .where(and(eq(document.id, docId), eq(document.userId, userId)))
                .limit(1);

            if (!docRow) throw new Error("NOT_FOUND");

            const [formRow] = await tx
                .select({ id: forms.id })
                .from(forms)
                .where(eq(forms.documentId, docId))
                .limit(1);

            if (!formRow) {
                const [createdForm] = await tx
                    .insert(forms)
                    .values({
                        documentId: docId,
                        title: payload.title ?? "Responses",
                        description: payload.description ?? null,
                        isEnabled: payload.isEnabled ?? false,
                        listResponsesPublicly: payload.listResponsesPublicly ?? false,
                    })
                    .returning({ id: forms.id });
                return createdForm;
            }

            const updateSet: Partial<{
                title: string;
                description: string | null;
                isEnabled: boolean;
                listResponsesPublicly: boolean;
            }> = {};
            if (payload.title !== undefined) updateSet.title = payload.title as string;
            if (payload.description !== undefined) updateSet.description = payload.description ?? null;
            if (payload.isEnabled !== undefined) updateSet.isEnabled = payload.isEnabled;
            if (payload.listResponsesPublicly !== undefined)
                updateSet.listResponsesPublicly = payload.listResponsesPublicly;

            const [updated] = await tx
                .update(forms)
                .set(updateSet)
                .where(eq(forms.id, formRow.id))
                .returning({ id: forms.id });
            return updated;
        });

        return { success: true, data: result };
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            return {
                success: false,
                error: "Document not found or you don't have permission to update it",
            };
        }
        console.error("Failed to update form:", error);
        return { success: false, error: "Failed to update form. Please try again" };
    }
};

export const updateFormFields = async (
    docId: string,
    userId: string,
    payload: UpdateFormFieldsDto
): Promise<
    ActionResponse<{
        formId: string;
        updatedCount: number;
        createdCount: number;
        deletedCount: number;
    }>
> => {
    try {
        const res = await db.transaction(async (tx) => {
            const [docRow] = await tx
                .select({ id: document.id })
                .from(document)
                .where(and(eq(document.id, docId), eq(document.userId, userId)))
                .limit(1);
            if (!docRow) throw new Error("NOT_FOUND");

            let [formRow] = await tx
                .select({ id: forms.id })
                .from(forms)
                .where(eq(forms.documentId, docId))
                .limit(1);

            if (!formRow) {
                if (!payload.formMetaIfMissing) throw new Error("FORM_MISSING");
                const [createdForm] = await tx
                    .insert(forms)
                    .values({
                        documentId: docId,
                        title: payload.formMetaIfMissing.title,
                        description: payload.formMetaIfMissing.description ?? null,
                        isEnabled: payload.formMetaIfMissing.isEnabled ?? false,
                        listResponsesPublicly:
                            payload.formMetaIfMissing.listResponsesPublicly ?? false,
                    })
                    .returning({ id: forms.id });
                formRow = createdForm;
            }

            let updatedCount = 0;
            let createdCount = 0;
            let deletedCount = 0;

            if (payload.updates && payload.updates.length > 0) {
                for (const u of payload.updates) {
                    const setObj: Partial<{
                        label: string;
                        description: string | null;
                        type: FormFieldCreateDto["type"];
                        required: boolean;
                        options: unknown | null;
                        order: number;
                    }> = {};
                    if (u.label !== undefined) setObj.label = u.label;
                    if (u.description !== undefined) setObj.description = u.description ?? null;
                    if (u.type !== undefined) setObj.type = u.type;
                    if (u.required !== undefined) setObj.required = u.required;
                    if (u.options !== undefined) setObj.options = u.options ?? null;
                    if (u.order !== undefined) setObj.order = u.order;

                    const res = await tx
                        .update(formFields)
                        .set(setObj)
                        .where(and(eq(formFields.id, u.id), eq(formFields.formId, formRow.id)))
                        .returning({ id: formFields.id });
                    if (res.length > 0) updatedCount += 1;
                }
            }

            if (payload.creates && payload.creates.length > 0) {
                await tx.insert(formFields).values(
                    payload.creates.map((c) => ({
                        formId: formRow.id,
                        label: c.label,
                        description: c.description ?? null,
                        type: c.type,
                        required: c.required ?? false,
                        options: c.options ?? null,
                        order: c.order,
                    }))
                );
                createdCount = payload.creates.length;
            }

            if (payload.deletes && payload.deletes.length > 0) {
                const resDel = await tx
                    .delete(formFields)
                    .where(and(eq(formFields.formId, formRow.id), inArray(formFields.id, payload.deletes)))
                    .returning({ id: formFields.id });
                deletedCount = resDel.length;
            }

            return {
                formId: formRow.id as string,
                updatedCount,
                createdCount,
                deletedCount,
            };
        });

        return { success: true, data: res };
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            return {
                success: false,
                error: "Document not found or you don't have permission to update it",
            };
        }
        if (error instanceof Error && error.message === "FORM_MISSING") {
            return {
                success: false,
                error: "Form not found. Provide formMetaIfMissing to create one.",
            };
        }
        console.error("Failed to update form fields:", error);
        return {
            success: false,
            error: "Failed to update form fields. Please try again",
        };
    }
};

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