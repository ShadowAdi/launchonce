"use server";

import { db } from "@/db/db";
import { document } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/types/action-response";
import { translateBlocksJsonToHtml } from "@/lib/server-i18n";

export const getTranslatedHtmlBySlug = async (
  slug: string,
  targetLocale: string,
  sourceLocale: string = "en"
): Promise<ActionResponse<{ html: string; blocks?: string; meta: { slug: string; locale: string } }>> => {
  try {
    const result = await db
      .select()
      .from(document)
      .where(eq(document.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return { success: false, error: "Document not found" };
    }

    const doc = result[0];

    const { html, translatedBlocks } = await translateBlocksJsonToHtml({
      slug: doc.slug as string,
      documentId: doc.id as string,
      blocksJson: doc.content as string,
      sourceLocale,
      targetLocale,
    });

    return {
      success: true,
      data: { 
        html, 
        blocks: translatedBlocks,
        meta: { slug: doc.slug as string, locale: targetLocale } 
      },
    };
  } catch (error) {
    console.error("Failed to translate document:", error);
    return { success: false, error: "Translation failed" };
  }
};
