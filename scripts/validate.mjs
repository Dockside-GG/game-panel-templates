import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const environments = /^[A-Z_][A-Z0-9_]{0,127}$/;
const imageReference = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*(?::[a-zA-Z0-9._-]+|@sha256:[a-f0-9]{64})?$/;
const secretName = /(PASSWORD|TOKEN|SECRET|API_?KEY|PRIVATE_?KEY)/i;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function slug(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 110).replace(/-$/g, "") || "template";
}

async function readJSON(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${path}: ${error.message}`);
  }
}

function validatePort(port, label) {
  assert(port && typeof port === "object", `${label} must be an object`);
  assert(Number.isInteger(port.container_port) && port.container_port >= 1 && port.container_port <= 65535, `${label}.container_port must be 1-65535`);
  assert(["tcp", "udp"].includes(port.protocol), `${label}.protocol must be tcp or udp`);
  if (port.environment) assert(environments.test(port.environment), `${label}.environment is invalid`);
  if (port.internal_only) {
    assert(!port.primary && !port.required && !port.published, `${label} cannot combine internal_only with primary, required, or published`);
  }
  if (port.required) assert(port.published, `${label}.required ports must be published`);
}

function validateTransport(transport, label) {
  const type = transport?.type ?? "auto";
  assert(["auto", "stdin", "rcon", "http_rest", "disabled"].includes(type), `${label}.type is unsupported`);
  if (type === "rcon") {
    if (transport.rcon_port_env) assert(environments.test(transport.rcon_port_env), `${label}.rcon_port_env is invalid`);
    if (transport.rcon_password_env) assert(environments.test(transport.rcon_password_env), `${label}.rcon_password_env is invalid`);
  }
  if (type === "http_rest") {
    const rest = transport.rest;
    assert(rest && typeof rest === "object", `${label}.rest is required`);
    assert(
      (Number.isInteger(rest.port) && rest.port >= 1 && rest.port <= 65535) ||
      environments.test(rest.port_environment ?? ""),
      `${label}.rest requires an internal port or port_environment`,
    );
    assert(!("host" in rest) && !("url" in rest), `${label}.rest may only target localhost`);
    if (rest.timeout_seconds != null) {
      assert(Number.isInteger(rest.timeout_seconds) && rest.timeout_seconds >= 1 && rest.timeout_seconds <= 60, `${label}.rest.timeout_seconds must be 1-60`);
    }
  }
}

function validateTemplate(document, manifest, directory) {
  const label = `templates/${directory}/template.json`;
  assert(typeof document.name === "string" && document.name.trim().length > 0, `${label}: name is required`);
  assert(document.docker_images && typeof document.docker_images === "object" && !Array.isArray(document.docker_images), `${label}: docker_images is required`);
  const images = Object.values(document.docker_images);
  assert(images.length > 0 && images.every((image) => typeof image === "string" && imageReference.test(image)), `${label}: docker image references are invalid`);
  assert(typeof document.startup === "string" && document.startup.trim().length > 0, `${label}: startup is required`);
  assert(typeof manifest.category === "string" && manifest.category.trim().length > 0, `templates/${directory}/manifest.json: category is required`);
  assert(!manifest.source_kind || manifest.source_kind === "dockside", `templates/${directory}/manifest.json: source_kind must be dockside`);

  const expectedSlug = slug(`dockside-${manifest.category}-${document.name}`);
  if (manifest.slug) assert(manifest.slug === expectedSlug, `templates/${directory}/manifest.json: slug must be ${expectedSlug}`);

  const variables = document.variables ?? [];
  assert(Array.isArray(variables), `${label}: variables must be an array`);
  const seenVariables = new Set();
  for (const [index, variable] of variables.entries()) {
    const variableLabel = `${label}: variables[${index}]`;
    assert(environments.test(variable.env_variable ?? ""), `${variableLabel}.env_variable is invalid`);
    assert(!seenVariables.has(variable.env_variable), `${variableLabel}.env_variable is duplicated`);
    seenVariables.add(variable.env_variable);
    if (variable.secret || secretName.test(`${variable.env_variable} ${variable.name ?? ""}`)) {
      assert(variable.default_value == null || variable.default_value === "", `${variableLabel}: secret defaults must be blank`);
    }
  }

  const dockside = document.dockside ?? {};
  const ports = dockside.network_ports ?? [];
  assert(Array.isArray(ports), `${label}: dockside.network_ports must be an array`);
  ports.forEach((port, index) => validatePort(port, `${label}: dockside.network_ports[${index}]`));
  assert(ports.filter((port) => port.primary).length <= 1, `${label}: only one port can be primary`);
  if (ports.length > 0) assert(ports.some((port) => port.primary), `${label}: one network port must be primary`);
  validateTransport(dockside.command_transport, `${label}: dockside.command_transport`);

  const retention = dockside.backup_defaults?.retention_days;
  if (retention != null) assert(Number.isInteger(retention) && retention >= 1 && retention <= 3650, `${label}: backup retention_days must be 1-3650`);
  for (const key of ["cpu_limit_millicores", "memory_limit_mb", "disk_alert_limit_mb"]) {
    const value = dockside.resource_defaults?.[key];
    assert(value == null || (Number.isInteger(value) && value > 0), `${label}: ${key} must be blank or positive`);
  }
  return { slug: expectedSlug, label };
}

export async function validateRepository() {
  const templatesRoot = new URL("templates/", root);
  const entries = (await readdir(templatesRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((left, right) => left.name.localeCompare(right.name));
  assert(entries.length > 0, "templates/ must contain at least one template directory");
  const result = [];
  const slugs = new Set();
  for (const entry of entries) {
    const directoryURL = new URL(`${entry.name}/`, templatesRoot);
    const document = await readJSON(new URL("template.json", directoryURL));
    const manifest = await readJSON(new URL("manifest.json", directoryURL));
    await readFile(new URL("README.md", directoryURL), "utf8");
    const validated = validateTemplate(document, manifest, entry.name);
    assert(!slugs.has(validated.slug), `${validated.label}: duplicate slug ${validated.slug}`);
    slugs.add(validated.slug);
    result.push({ directory: entry.name, document, manifest, slug: validated.slug });
  }
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const templates = await validateRepository();
    console.log(`Validated ${templates.length} Dockside template${templates.length === 1 ? "" : "s"}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
