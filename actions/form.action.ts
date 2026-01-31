"use server";

import { db } from "@/db/db";
import { document, formAnswers, formFields, formResponses, forms } from "@/db/schema";
import { ActionResponse } from "@/types/action-response";
import { FormDto, FormResponseDto, SubmitFormResponseDto } from "@/types/forms/form.dto";
import { and, desc, eq, inArray } from "drizzle-orm";

export const getFormByDocumentId = async (
  documentId: string,
  userId: string
): Promise<ActionResponse<FormDto>> => {
  try {
    const [docRow] = await db
      .select({ id: document.id, userId: document.userId })
      .from(document)
      .where(eq(document.id, documentId))
      .limit(1);

    if (!docRow) {
      return {
        success: false,
        error: "Document not found",
      };
    }

    if (docRow.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const [formRow] = await db
      .select({
        id: forms.id,
        documentId: forms.documentId,
        title: forms.title,
        description: forms.description,
        isEnabled: forms.isEnabled,
        listResponsesPublicly: forms.listResponsesPublicly,
      })
      .from(forms)
      .where(eq(forms.documentId, docRow.id))
      .limit(1);

    if (!formRow) {
      return {
        success: false,
        error: "Form not found for this document",
      };
    }

    const fields = await db
      .select({
        id: formFields.id,
        label: formFields.label,
        description: formFields.description,
        type: formFields.type,
        required: formFields.required,
        options: formFields.options,
        order: formFields.order,
      })
      .from(formFields)
      .where(eq(formFields.formId, formRow.id))
      .orderBy(formFields.order);

    return {
      success: true,
      data: {
        id: formRow.id as string,
        documentId: formRow.documentId as string,
        title: formRow.title as string,
        description: formRow.description ?? undefined,
        isEnabled: formRow.isEnabled as boolean,
        listResponsesPublicly: formRow.listResponsesPublicly as boolean,
        fields: fields.map((f) => ({
          id: f.id as string,
          label: f.label as string,
          description: f.description ?? undefined,
          type: f.type as FormDto["fields"][0]["type"],
          required: f.required as boolean,
          options: f.options ?? undefined,
          order: f.order as number,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get form by document ID:", error);
    return {
      success: false,
      error: "Failed to get form. Please try again",
    };
  }
};

export const getFormBySlug = async (
  slug: string
): Promise<ActionResponse<FormDto>> => {
  try {
    const [docRow] = await db
      .select({ id: document.id })
      .from(document)
      .where(and(eq(document.slug, slug), eq(document.visibility, "published")))
      .limit(1);

    if (!docRow) {
      return {
        success: false,
        error: "Document not found or not published",
      };
    }

    const [formRow] = await db
      .select({
        id: forms.id,
        documentId: forms.documentId,
        title: forms.title,
        description: forms.description,
        isEnabled: forms.isEnabled,
        listResponsesPublicly: forms.listResponsesPublicly,
      })
      .from(forms)
      .where(eq(forms.documentId, docRow.id))
      .limit(1);

    if (!formRow) {
      return {
        success: false,
        error: "Form not found for this document",
      };
    }

    if (!formRow.isEnabled) {
      return {
        success: false,
        error: "Form is currently disabled",
      };
    }

    const fields = await db
      .select({
        id: formFields.id,
        label: formFields.label,
        description: formFields.description,
        type: formFields.type,
        required: formFields.required,
        options: formFields.options,
        order: formFields.order,
      })
      .from(formFields)
      .where(eq(formFields.formId, formRow.id))
      .orderBy(formFields.order);

    return {
      success: true,
      data: {
        id: formRow.id as string,
        documentId: formRow.documentId as string,
        title: formRow.title as string,
        description: formRow.description ?? undefined,
        isEnabled: formRow.isEnabled as boolean,
        listResponsesPublicly: formRow.listResponsesPublicly as boolean,
        fields: fields.map((f) => ({
          id: f.id as string,
          label: f.label as string,
          description: f.description ?? undefined,
          type: f.type as FormDto["fields"][0]["type"],
          required: f.required as boolean,
          options: f.options ?? undefined,
          order: f.order as number,
        })),
      },
    };
  } catch (error) {
    console.error("Failed to get form by slug:", error);
    return {
      success: false,
      error: "Failed to get form. Please try again",
    };
  }
};

export const submitFormResponse = async (
  slug: string,
  payload: SubmitFormResponseDto
): Promise<ActionResponse<{ id: string }>> => {
  try {
    // Step 1: Verify document exists and is published
    const [docRow] = await db
      .select({ id: document.id })
      .from(document)
      .where(and(eq(document.slug, slug), eq(document.visibility, "published")))
      .limit(1);

    if (!docRow) {
      return {
        success: false,
        error: "Document not found or not published",
      };
    }

    // Step 2: Verify form exists and is enabled
    const [formRow] = await db
      .select({ id: forms.id, isEnabled: forms.isEnabled })
      .from(forms)
      .where(eq(forms.documentId, docRow.id))
      .limit(1);

    if (!formRow) {
      return {
        success: false,
        error: "Form not found for this document",
      };
    }

    if (!formRow.isEnabled) {
      return {
        success: false,
        error: "Form is currently disabled",
      };
    }

    // Step 3: Validate required fields
    const requiredFields = await db
      .select({ id: formFields.id })
      .from(formFields)
      .where(and(eq(formFields.formId, formRow.id), eq(formFields.required, true)));

    const answeredFieldIds = new Set(payload.answers.map((a) => a.fieldId));
    const missingRequired = requiredFields.filter(
      (f) => !answeredFieldIds.has(f.id as string)
    );

    if (missingRequired.length > 0) {
      return {
        success: false,
        error: "Please fill all required fields",
      };
    }

    // Step 4: Validate that all answered fields belong to this form
    if (payload.answers.length > 0) {
      const fieldIds = payload.answers.map((a) => a.fieldId);
      const validFields = await db
        .select({ id: formFields.id })
        .from(formFields)
        .where(and(eq(formFields.formId, formRow.id), inArray(formFields.id, fieldIds)));

      if (validFields.length !== fieldIds.length) {
        return {
          success: false,
          error: "Invalid field IDs provided",
        };
      }
    }

    // Step 5: Create the response
    const [response] = await db
      .insert(formResponses)
      .values({
        formId: formRow.id,
        isPublic: payload.isPublic ?? false,
      })
      .returning({ id: formResponses.id });

    // Step 6: Insert answers if any
    if (payload.answers.length > 0) {
      try {
        await db.insert(formAnswers).values(
          payload.answers.map((a) => ({
            responseId: response.id,
            fieldId: a.fieldId,
            value: a.value,
          }))
        );
      } catch (answerError) {
        // If answers fail to insert, try to clean up the response
        try {
          await db.delete(formResponses).where(eq(formResponses.id, response.id));
        } catch (cleanupError) {
          console.error("Failed to cleanup response after answer insert failure:", cleanupError);
        }
        throw answerError;
      }
    }

    return {
      success: true,
      data: { id: response.id as string },
    };
  } catch (error) {
    console.error("Failed to submit form response:", error);
    return {
      success: false,
      error: "Failed to submit response. Please try again",
    };
  }
};

export const getFormResponsesByDocumentId = async (
  documentId: string,
  userId: string
): Promise<ActionResponse<{ responses: FormResponseDto[] }>> => {
  try {
    const [docRow] = await db
      .select({ id: document.id, userId: document.userId })
      .from(document)
      .where(eq(document.id, documentId))
      .limit(1);

    if (!docRow) {
      return {
        success: false,
        error: "Document not found",
      };
    }

    if (docRow.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized access",
      };
    }

    const [formRow] = await db
      .select({
        id: forms.id,
      })
      .from(forms)
      .where(eq(forms.documentId, docRow.id))
      .limit(1);

    if (!formRow) {
      return {
        success: false,
        error: "Form not found for this document",
      };
    }

    const responses = await db
      .select({
        id: formResponses.id,
        formId: formResponses.formId,
        isPublic: formResponses.isPublic,
        createdAt: formResponses.createdAt,
      })
      .from(formResponses)
      .where(eq(formResponses.formId, formRow.id))
      .orderBy(desc(formResponses.createdAt));

    const formattedResponses: FormResponseDto[] = [];

    for (const resp of responses) {
      const answers = await db
        .select({
          id: formAnswers.id,
          fieldId: formAnswers.fieldId,
          value: formAnswers.value,
          fieldLabel: formFields.label,
        })
        .from(formAnswers)
        .innerJoin(formFields, eq(formAnswers.fieldId, formFields.id))
        .where(eq(formAnswers.responseId, resp.id));

      formattedResponses.push({
        id: resp.id as string,
        formId: resp.formId as string,
        isPublic: resp.isPublic as boolean,
        createdAt: resp.createdAt.toISOString(),
        answers: answers.map((a) => ({
          id: a.id as string,
          fieldId: a.fieldId as string,
          fieldLabel: a.fieldLabel as string,
          value: a.value as string,
        })),
      });
    }

    return {
      success: true,
      data: {
        responses: formattedResponses,
      },
    };
  } catch (error) {
    console.error("Failed to get form responses by document ID:", error);
    return {
      success: false,
      error: "Failed to get responses. Please try again",
    };
  }
};

export const getFormResponses = async (
  slug: string,
  userId?: string
): Promise<ActionResponse<{ responses: FormResponseDto[]; isOwner: boolean }>> => {
  try {
    const [docRow] = await db
      .select({ id: document.id, userId: document.userId })
      .from(document)
      .where(and(eq(document.slug, slug), eq(document.visibility, "published")))
      .limit(1);

    if (!docRow) {
      return {
        success: false,
        error: "Document not found or not published",
      };
    }

    const isOwner = userId !== undefined && docRow.userId === userId;

    const [formRow] = await db
      .select({
        id: forms.id,
        listResponsesPublicly: forms.listResponsesPublicly,
      })
      .from(forms)
      .where(eq(forms.documentId, docRow.id))
      .limit(1);

    if (!formRow) {
      return {
        success: false,
        error: "Form not found for this document",
      };
    }

    if (!isOwner && !formRow.listResponsesPublicly) {
      return {
        success: false,
        error: "Responses are not publicly available",
      };
    }

    const responseFilter = isOwner
      ? eq(formResponses.formId, formRow.id)
      : and(eq(formResponses.formId, formRow.id), eq(formResponses.isPublic, true));

    const responses = await db
      .select({
        id: formResponses.id,
        formId: formResponses.formId,
        isPublic: formResponses.isPublic,
        createdAt: formResponses.createdAt,
      })
      .from(formResponses)
      .where(responseFilter)
      .orderBy(desc(formResponses.createdAt));

    const formattedResponses: FormResponseDto[] = [];

    for (const resp of responses) {
      const answers = await db
        .select({
          id: formAnswers.id,
          fieldId: formAnswers.fieldId,
          value: formAnswers.value,
          fieldLabel: formFields.label,
        })
        .from(formAnswers)
        .innerJoin(formFields, eq(formAnswers.fieldId, formFields.id))
        .where(eq(formAnswers.responseId, resp.id));

      formattedResponses.push({
        id: resp.id as string,
        formId: resp.formId as string,
        isPublic: resp.isPublic as boolean,
        createdAt: resp.createdAt.toISOString(),
        answers: answers.map((a) => ({
          id: a.id as string,
          fieldId: a.fieldId as string,
          fieldLabel: a.fieldLabel as string,
          value: a.value as string,
        })),
      });
    }

    return {
      success: true,
      data: {
        responses: formattedResponses,
        isOwner,
      },
    };
  } catch (error) {
    console.error("Failed to get form responses:", error);
    return {
      success: false,
      error: "Failed to get responses. Please try again",
    };
  }
};
