# Dockside Game Panel Templates

This repository is the public, Dockside-native template catalog consumed by
Dockside Game Panel installations. It must contain only original Dockside
templates. Pelican- and Pterodactyl-compatible definitions remain supported by
the panel, but do not belong in this catalog.

## Repository layout

```text
.
|-- catalog.json
|-- schemas/
|   `-- dockside-template-v1.schema.json
|-- scripts/
|   |-- build-catalog.mjs
|   `-- validate.mjs
`-- templates/
    `-- example-dedicated-server/
        |-- manifest.json
        |-- README.md
        `-- template.json
```

Each template owns a directory containing:

- `template.json`: the portable Dockside template definition.
- `manifest.json`: catalog metadata, including its category and optional source
  URL.
- `README.md`: game-specific install, networking, test, and maintenance notes.

Do not commit credentials, tokens, webhook URLs, private game files, proprietary
server binaries, or generated backups.

## Add a template

1. Copy `templates/example-dedicated-server`.
2. Rename the directory for the game/server software.
3. Edit `manifest.json`, `template.json`, and the template README.
4. Run `npm run validate`.
5. Run `npm run build`.
6. Commit the template and regenerated `catalog.json` together.

`catalog.json` is deterministic except for `generated_at`. The build script uses
`SOURCE_DATE_EPOCH` when supplied by CI; otherwise it uses the current time.

## Versions

The repository and generated catalog use Semantic Versioning:

- Patch: documentation, validation, or compatible template corrections.
- Minor: new templates or backward-compatible properties.
- Major: a breaking catalog or template contract change.

Set `CATALOG_VERSION` when building a release:

```bash
CATALOG_VERSION=0.2.0 npm run build
```

PowerShell:

```powershell
$env:CATALOG_VERSION = "0.2.0"
npm run build
```

## Validation contract

The repository scripts intentionally use only Node.js built-ins. They validate
repository structure, JSON syntax, required properties, template names, images,
startup commands, network policies, command transports, backup defaults,
resource defaults, secret defaults, unique slugs, and the generated catalog.

The panel performs authoritative normalization and validation again before it
accepts a catalog. A catalog update is atomic: one invalid template rejects the
entire update while locally stored and bundled templates remain available.

## License

Apache License 2.0. See `LICENSE`.
