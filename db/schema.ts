import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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
    documentId: uuid("document_id").references(() => document.id).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    locale: varchar("locale", { length: 20 }).notNull(),
    sourceLocale: varchar("source_locale", { length: 20 }).notNull(),
    html: text("html").notNull(),
    contentHash: varchar("content_hash", { length: 128 }).notNull(),
    createdAt: timestamp("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date())
});
