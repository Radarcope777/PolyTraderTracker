const fs = require('fs');
const path = require('path');

// Read existing package.json
const packagePath = path.join(__dirname, 'package.json');
const pkg = require(packagePath);

// Add scripts
pkg.scripts = {
  ...pkg.scripts,
  "codegen": "graph codegen",
  "build": "graph build",
  "deploy": "graph deploy --node https://api.studio.thegraph.com/deploy/ --ipfs https://api.thegraph.com/ipfs/ polymarket-pnl-subgraph"
};

// Write updated package.json
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));

console.log('Updated package.json with subgraph scripts');