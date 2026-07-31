# Contributing templates

Use the panel's visual template editor whenever practical, test the resulting
server, and choose **Export Dockside JSON** from the template detail page.

Before submitting a definition, verify:

- installation from an empty server volume;
- first start, graceful stop, restart, kill, and unexpected-stop recovery;
- every published TCP and UDP allocation from a second machine;
- stdin, RCON, or HTTP REST commands as declared by the template;
- a backup and restore using the declared default include/exclude rules;
- a second server on the same host without port collisions;
- blank resource limits remain unlimited.

Do not submit secrets or user-specific values. Defaults suggesting a password,
token, API key, or webhook must be blank and marked secret.
