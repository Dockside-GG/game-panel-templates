# Palworld

Dockside-native template for the Linux Palworld Dedicated Server distributed
through SteamCMD as application `2394010`.

## Support and images

- Host/runtime architecture: Linux x86-64 (amd64).
- Runtime image: `ghcr.io/parkervcp/steamcmd:debian`.
- Installer image: `ghcr.io/parkervcp/installers:debian`.
- Server files are installed anonymously through Valve SteamCMD.
- The configuration helper is downloaded from the published releases of
  `pelican-eggs/Palworld-Config-Parser-Tool` during installation.

## Networking

| Port | Protocol | Exposure | Purpose |
| --- | --- | --- | --- |
| 8211 | UDP | Published, primary | Game traffic |
| 8212 | TCP | Internal only | Palworld REST administration API |

The REST API is intentionally not published. Palworld warns against exposing
its management API directly to the internet. Dockside reaches it over localhost
and authenticates with the configured admin password.

The template starts as a community server so configured cross-play platforms
can discover it. If automatic public-address detection does not work, set the
Public IP variable in Dockside.

## Configuration and commands

Set a non-empty Admin Password before the first start. The configuration helper
writes the Dockside variables into
`Pal/Saved/Config/LinuxServer/PalWorldSettings.ini` before Palworld starts.
Existing configuration and save data are preserved during reinstall/update.

Dockside exposes the Palworld REST operations `info`, `players`, `settings`,
`announce`, `kick`, `ban`, `unban`, `save`, `shutdown`, `stop`, `game-data`, and
`metrics`. The configured graceful stop command is `shutdown 15`.

## Backups

Backups include `Pal/Saved/`, excluding generated logs, crash reports, and the
game's nested automatic-backup copies. The default Dockside retention period is
14 days. Restore the selection to the same relative path before starting the
server.

## Verification checklist

Before publishing a release, verify install, first start, Steam update, graceful
stop, restart, client connection on UDP 8211, REST commands, backup, restore,
and a second concurrent server on the target Dockside host.

Official references:

- [Deploy a dedicated server](https://docs.palworldgame.com/getting-started/deploy-dedicated-server/)
- [Server requirements](https://docs.palworldgame.com/getting-started/requirements/)
- [Configuration parameters](https://docs.palworldgame.com/settings-and-operation/configuration/)
- [REST API](https://docs.palworldgame.com/api/rest-api/palwold-rest-api/)
