# Dockside.GG game-panel templates

This public repository is the authoritative template catalog consumed by
[Dockside.GG Game Panel](https://github.com/Dockside-GG/game-panel).

`catalog.json` contains the versioned, validated catalog. The panel downloads
this file directly, checks its schema and every normalized definition, then
atomically replaces the catalog-managed templates in PostgreSQL. Locally
created Dockside templates are never overwritten.

## Catalog releases

The `catalog_version` property follows [Semantic Versioning](https://semver.org/):

- Patch: description, metadata, or compatible template fixes.
- Minor: new templates or backward-compatible Dockside extension fields.
- Major: an incompatible catalog or template contract.

Every catalog update must also set a current RFC 3339 `generated_at` value.

## Contributing

1. Fork this repository and create a branch.
2. Export a Dockside JSON definition from the panel or add a compatible
   definition to the catalog.
3. Never include game-server passwords, tokens, webhook URLs, personal data, or
   other secrets.
4. Increment `catalog_version` and update `generated_at`.
5. Run `node scripts/validate-catalog.mjs`.
6. Open a pull request describing the game, tested image, ports, installation,
   startup, console transport, backup paths, and test results.

Pelican-compatible and Pterodactyl-compatible definitions are accepted. Once a
definition is customized or authored in the panel, its exported source is a
Dockside template with explicit networking, resource, backup, and command
transport extensions.

## License

Repository tooling and original Dockside metadata are licensed under
Apache-2.0. Individual compatible definitions and referenced container images
may retain their own authorship and license metadata.
