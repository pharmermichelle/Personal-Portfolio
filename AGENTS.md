# Retro Game Hub

Start with [the project index](docs/retro-game-hub/README.md) and [the prioritized backlog](docs/retro-game-hub/backlog.md). This repository also hosts a personal portfolio and other apps. Scope edits to the arcade feature being worked on.

- Start from current `main` on a development branch. Open a pull request and obtain approval before merging or deploying.
- Preserve existing accounts, saves, gameplay, artwork, deployment settings and AdSense integrations. Keep game-specific progression rules.
- Use synthetic accounts and isolated services for testing. Never apply migrations or change production data without explicit approval. Never commit privileged keys, tokens or personal player data.
- Use local mock advertisements for browser automation. Do not load or interact with live advertisements in automated tests.
- Run relevant checks and document the commit, scope and result. Live service availability, ad delivery and production data policies need independent verification.
- Jira project `GH` uses To Do for pending work, In Progress during implementation, In Review while awaiting owner testing, and Done only after the owner approves. Never transition an issue to Done on the owner's behalf.
- Update arcade documentation alongside changes to shared contracts, player-facing rules or test procedures.
