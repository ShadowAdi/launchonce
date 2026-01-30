import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar, index, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text().notNull(),
    email: text().notNull().unique(),
    password: text().notNull(),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date())
})

export const document = pgTable("docuements", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId").references(() => users.id).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    coverImage: text("cover_image"),
    content: text("content").notNull(),
    tags: text("tags").array(),
    viewCount: integer("view_count").notNull().default(0),
    visibility: varchar("visibility", { length: 10 }).notNull().default("draft"),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date())
})

// Cache of translated HTML per document & locale
export const translations = pgTable("translations", {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id").references(() => document.id, { onDelete: "cascade" }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    locale: varchar("locale", { length: 20 }).notNull(),
    sourceLocale: varchar("source_locale", { length: 20 }).notNull(),
    html: text("html").notNull(),
    translatedBlocks: text("translated_blocks"), // Store translated BlockNote JSON
    contentHash: varchar("content_hash", { length: 128 }).notNull(),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date())
});

export const forms = pgTable("forms", {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id").references(() => document.id, { onDelete: "cascade" }).notNull().unique(),

    title: varchar("title", { length: 225 }).notNull(),
    description: text("description"),

    listResponsesPublicly: boolean("list_responses_publicly").default(false),
    isEnabled: boolean("is_enabled").notNull().default(false),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date())

});


export const formFieldType = pgEnum("form_field_type", [
  "short_text",
  "long_text",
  "select",
  "boolean",
  "email",
  "url",
]);


export const formFields = pgTable("form_fields", {
    id: uuid("id").defaultRandom().primaryKey(),
    formId: uuid("form_id").references(() => forms.id, { onDelete: "cascade" }).notNull(),

    label: varchar("label", { length: 225 }).notNull(),
    description: text("description"),
    type: formFieldType("type").notNull(),

    required: boolean("required").notNull().default(false),
    options: jsonb("options"),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date())
}, (t) => ({
  formOrderIdx: index("form_fields_form_order_idx").on(t.formId, t.order),
  formOrderUnique: uniqueIndex("form_fields_form_order_unique").on(t.formId, t.order),
}))

export const formResponses = pgTable("form_responses", {
  id: uuid("id").defaultRandom().primaryKey(),

  formId: uuid("form_id")
    .references(() => forms.id, { onDelete: "cascade" })
    .notNull(),

  isPublic: boolean("is_public").notNull().default(false),

  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (t) => ({
  formPublicIdx: index("form_responses_form_public_idx").on(t.formId, t.isPublic),
}));

export const formAnswers = pgTable("form_answers", {
  id: uuid("id").defaultRandom().primaryKey(),

  responseId: uuid("response_id")
    .references(() => formResponses.id, { onDelete: "cascade" })
    .notNull(),

  fieldId: uuid("field_id")
    .references(() => formFields.id, { onDelete: "cascade" })
    .notNull(),

  value: text("value").notNull(),
}, (t) => ({
  responseFieldUnique: uniqueIndex("form_answers_response_field_unique").on(t.responseId, t.fieldId),
  answersResponseIdx: index("form_answers_response_idx").on(t.responseId),
}));