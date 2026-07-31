# Security

Do not report vulnerabilities in public issues. Use GitHub private vulnerability
reporting for the Dockside organization.

Never include live credentials, API keys, webhook URLs, access tokens, private
keys, licensed server binaries, server saves, or personal information in a
template, pull request, test fixture, or log.

Templates execute installer and startup commands with access to their own game
volume. Review image provenance, pin versions where practical, fail installation
on errors, and keep internal management listeners unpublished.
