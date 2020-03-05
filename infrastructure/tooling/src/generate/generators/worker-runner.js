const path = require('path');
const {REPO_ROOT, execCommand} = require('../../utils');

exports.tasks = [{
  title: 'Generate Worker-Runner README',
  requires: ['target-go-version'],
  provides: ['target-worker-runner-readme'],
  run: async (requirements, utils) => {
    await execCommand({
      dir: path.join(REPO_ROOT, 'tools', 'worker-runner'),
      command: ['go', 'run', 'util/update-readme.go'],
      utils,
    });
  },
}];
