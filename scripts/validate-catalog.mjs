import { readFile } from "node:fs/promises";

const document = JSON.parse(await readFile(new URL("../catalog.json", import.meta.url), "utf8"));
const semver = /^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/;
const sourceKinds = new Set(["pelican", "pterodactyl", "dockside"]);

if (document.format_version !== 1) throw new Error("format_version must be 1");
if (!semver.test(document.catalog_version ?? "")) throw new Error("catalog_version must use Semantic Versioning");
if (Number.isNaN(Date.parse(document.generated_at))) throw new Error("generated_at must be RFC 3339");
if (!Array.isArray(document.templates) || document.templates.length < 1 || document.templates.length > 2000) {
  throw new Error("templates must contain 1-2000 definitions");
}

const slugs = new Set();
for (const template of document.templates) {
  if (!template.slug || slugs.has(template.slug)) throw new Error(`duplicate or empty slug: ${template.slug}`);
  if (!sourceKinds.has(template.source_kind)) throw new Error(`unsupported source_kind for ${template.slug}`);
  if (!template.category || !template.name || !template.source_document) {
    throw new Error(`missing required template metadata for ${template.slug}`);
  }
  slugs.add(template.slug);
}

console.log(`Validated ${document.templates.length} templates in catalog v${document.catalog_version}.`);
