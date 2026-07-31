# Contributing

Contributions must be original Dockside-native definitions and must not include
copied proprietary scripts, credentials, private data, or incompatible catalog
entries.

Before opening a pull request:

1. Test install, first start, graceful stop, restart, command transport, backup,
   restore, and a second concurrent server.
2. Confirm every published port and protocol from a separate client.
3. Keep resource defaults blank/unlimited unless the server has a documented
   hard minimum.
4. Mark management endpoints `internal_only` unless external access is required.
5. Add useful file-selection backup defaults.
6. Run `npm run check` and commit the regenerated `catalog.json`.

Describe the host OS, architecture, game/server version, Docker image, test
steps, and results in the pull request. Never paste live secrets or webhook URLs.
