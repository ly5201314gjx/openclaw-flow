const os = require('os');
const path = require('path');

/**
 * Resolve OpenClaw directories in a cross-platform way.
 * Priority:
 *  - OPENCLAW_HOME
 *  - ~/.openclaw
 */
function getOpenClawHome() {
  return process.env.OPENCLAW_HOME || path.join(os.homedir(), '.openclaw');
}

function getOpenClawWorkspace() {
  // Allow override if the user has a custom workspace layout.
  return process.env.OPENCLAW_WORKSPACE || path.join(getOpenClawHome(), 'workspace');
}

function getCopilotDir() {
  // Keep legacy folder name "copilot" for now (less breaking).
  return process.env.OPENCLAW_FLOW_DIR || path.join(getOpenClawWorkspace(), 'copilot');
}

module.exports = {
  getOpenClawHome,
  getOpenClawWorkspace,
  getCopilotDir,
};
