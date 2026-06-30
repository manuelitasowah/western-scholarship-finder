#!/bin/bash
set -e

# Change to the script's directory to ensure relative paths work correctly
cd "$(dirname "$0")"

# Add the local node bin directory to the PATH so that npm can find the node executable
export PATH="$(pwd)/.node/bin:$PATH"

echo "=== 1. Downloading and Extracting Node.js (v20.15.0 ARM64) ==="
if [ ! -f .node/bin/node ]; then
  mkdir -p .node
  curl -L https://nodejs.org/dist/v20.15.0/node-v20.15.0-darwin-arm64.tar.gz -o .node/node.tar.gz
  tar -xzf .node/node.tar.gz -C .node --strip-components=1
  rm .node/node.tar.gz
  echo "=== 2. Node.js installed locally at ./.node/bin/node ==="
else
  echo "=== 2. Node.js is already installed locally ==="
fi

echo "=== 3. Installing dependencies ==="
npm install

echo "=== 4. Starting the development server ==="
npm run dev
