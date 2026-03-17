const os = require('os');
const path = require('path');

function getOpenClawHome() {
  return process.env.OPENCLAW_HOME || path.join(os.homedir(), '.openclaw');
}

function getOpenClawWorkspace() {
  return process.env.OPENCLAW_WORKSPACE || path.join(getOpenClawHome(), 'workspace');
}

function getCopilotDir() {
  return process.env.OPENCLAW_FLOW_DIR || path.join(getOpenClawWorkspace(), 'copilot');
}

module.exports = { getOpenClawHome, getOpenClawWorkspace, getCopilotDir };
