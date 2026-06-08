# Migration Notes

This project remains as a legacy compatibility host while layered projects under `src/` are the active implementation target.

Cleanup completed for this migration slice:

- Removed monolith-local build artifacts (`bin/`, `obj/`).
- Removed local SQLite runtime files (`dailytracker.db*`) from the monolith folder.
- Removed empty legacy folder `Infrastructure/` from the monolith project tree.

Further cleanup of monolith source code should be done only after parity/rollback criteria are explicitly signed off.
