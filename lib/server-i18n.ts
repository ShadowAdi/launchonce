import crypto from "node:crypto";
import { lingoDotDev } from "@/lib/lingo";
import { db } from "@/db/db";
import { translations } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// Minimal lossy converter from BlockNote JSON to HTML.
// Covers common block types; safely degrades to plain paragraphs.
export function blocksJsonToHtmlLossy(json: string): string {
	try {
		const blocks = JSON.parse(json);

		if (!Array.isArray(blocks)) {
			return `<p>${escapeHtml(String(json))}</p>`;
		}

		const html = blocks
			.map((block) => renderBlock(block))
			.join("\n");

		return html;
	} catch {
		// Fallback: treat content as plain text paragraph
		return `<p>${escapeHtml(String(json))}</p>`;
	}
}

function renderBlock(block: any): string {
	const type = block?.type ?? "paragraph";
	const content = block?.content ?? "";

	const text = renderInline(content);

	switch (type) {
		case "heading": {
			const level = Math.min(Math.max(Number(block.props?.level ?? 1), 1), 6);
			return `<h${level}>${text}</h${level}>`;
		}
		case "paragraph": {
			return `<p>${text}</p>`;
		}
		case "bulletList": {
			const items = Array.isArray(block.children)
				? block.children.map((c: any) => `<li>${renderInline(c?.content ?? "")}</li>`).join("")
				: `<li>${text}</li>`;
			return `<ul>${items}</ul>`;
		}
		case "orderedList": {
			const items = Array.isArray(block.children)
				? block.children.map((c: any) => `<li>${renderInline(c?.content ?? "")}</li>`).join("")
				: `<li>${text}</li>`;
			return `<ol>${items}</ol>`;
		}
		case "blockquote": {
			return `<blockquote>${text}</blockquote>`;
		}
		case "codeBlock": {
			const language = escapeHtml(block.props?.language ?? "");
			return `<pre><code${language ? ` class=\"language-${language}\"` : ""}>${escapeHtml(stripHtml(text))}</code></pre>`;
		}
		case "image": {
			const src = escapeAttr(block.props?.src ?? "");
			const alt = escapeAttr(block.props?.alt ?? "");
			return src ? `<figure><img src="${src}" alt="${alt}" /></figure>` : "";
		}
		default: {
			// Unknown types render as paragraphs
			return `<p>${text}</p>`;
		}
	}
}

function renderInline(content: any): string {
	// Content can be a string or an array of inline nodes
	if (typeof content === "string") return escapeHtml(content);
	if (!Array.isArray(content)) return escapeHtml(String(content ?? ""));

	return content
		.map((node) => {
			const text = escapeHtml(String(node?.text ?? ""));
			const styles = node?.styles ?? node?.marks ?? [];

			let out = text;
			if (Array.isArray(styles)) {
				styles.forEach((s: any) => {
					const type = typeof s === "string" ? s : s?.type;
					switch (type) {
						case "bold":
							out = `<strong>${out}</strong>`;
							break;
						case "italic":
							out = `<em>${out}</em>`;
							break;
						case "underline":
							out = `<u>${out}</u>`;
							break;
						case "strike":
							out = `<s>${out}</s>`;
							break;
						case "code":
							out = `<code>${out}</code>`;
							break;
						case "link": {
							const href = escapeAttr(s?.href ?? s?.url ?? "#");
							out = `<a href="${href}">${out}</a>`;
							break;
						}
						default:
							break;
					}
				});
			}
			return out;
		})
		.join("");
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
	return escapeHtml(s).replace(/`/g, "&#96;");
}

function stripHtml(s: string): string {
	return s.replace(/<[^>]+>/g, "");
}

export function computeContentHash(blocksJson: string, sourceLocale: string): string {
	return crypto.createHash("sha256").update(`${sourceLocale}::${blocksJson}`).digest("hex");
}

export async function translateBlocksJsonToHtml(opts: {
	slug: string;
	documentId: string;
	blocksJson: string;
	sourceLocale: string;
	targetLocale: string;
}): Promise<{ html: string }>
{
	const { slug, documentId, blocksJson, sourceLocale, targetLocale } = opts;

	const contentHash = computeContentHash(blocksJson, sourceLocale);

	// Check cache
	const cached = await db
		.select()
		.from(translations)
		.where(and(eq(translations.slug, slug), eq(translations.locale, targetLocale)))
		.limit(1);

	if (cached.length > 0 && cached[0].contentHash === contentHash) {
		return { html: cached[0].html as string };
	}

	// Convert JSON -> HTML (lossy, server-safe)
	const html = blocksJsonToHtmlLossy(blocksJson);

	// Translate HTML via lingo.dev (server-side only)
	const localized = await lingoDotDev.localizeHtml(html, {
		sourceLocale,
		targetLocale,
	});

	// Upsert cache
	const existing = cached[0];
	if (existing) {
		await db
			.update(translations)
			.set({
				html: localized,
				contentHash,
				sourceLocale,
			})
			.where(and(eq(translations.slug, slug), eq(translations.locale, targetLocale)));
	} else {
		await db.insert(translations).values({
			documentId,
			slug,
			locale: targetLocale,
			sourceLocale,
			html: localized,
			contentHash,
		});
	}

	return { html: localized };
}
