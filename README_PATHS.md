# Paths / Cross-platform notes

This repo historically hard-coded `~/.openclaw/...` (sometimes `/root/.openclaw/...`) paths for demos.

Now we resolve paths in a cross-platform way:

- `OPENCLAW_HOME` (optional) → defaults to `~/.openclaw`
- `OPENCLAW_WORKSPACE` (optional) → defaults to `$OPENCLAW_HOME/workspace`
- `OPENCLAW_FLOW_DIR` (optional) → defaults to `$OPENCLAW_WORKSPACE/copilot`

See: `src/utils/paths.js`
