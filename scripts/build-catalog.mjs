import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { validateRepository } from "./validate.mjs";

const root = new URL("../", import.meta.url);
const catalogPath = new URL("catalog.json", root);

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function semanticVersion(value) {
  return /^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?$/.test(value);
}

const existing = JSON.parse(await readFile(catalogPath, "utf8"));
const catalogVersion = process.env.CATALOG_VERSION || existing.catalog_version;
if (!semanticVersion(catalogVersion)) throw new Error("CATALOG_VERSION must use Semantic Versioning");

const templates = await validateRepository();
const catalogEntries = templates.map(({ document, manifest, slug }) => {
  const sourceJSON = JSON.stringify(document);
  return {
    slug,
    name: document.name,
    category: manifest.category.trim(),
    source_kind: "dockside",
    upstream_url: manifest.upstream_url?.trim() ?? "",
    author: document.author?.trim() ?? "",
    description: document.description?.trim() ?? "",
    source_digest: digest(sourceJSON),
    source_document: document,
    canonical_document: {},
    compatibility_report: {
      compatible: true,
      warnings: [],
    },
  };
});

const combinedDigest = digest(catalogEntries.map((entry) => entry.source_digest).join("\n"));
const sourceEpoch = process.env.SOURCE_DATE_EPOCH;
const generatedAt = sourceEpoch
  ? new Date(Number(sourceEpoch) * 1000).toISOString()
  : existing.generated_at;

const catalog = {
  format_version: 1,
  catalog_version: catalogVersion,
  generated_at: generatedAt,
  sources: [{ kind: "dockside", digest: combinedDigest, count: catalogEntries.length }],
  templates: catalogEntries,
};
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`Built catalog ${catalogVersion} with ${catalogEntries.length} template${catalogEntries.length === 1 ? "" : "s"}.`);
