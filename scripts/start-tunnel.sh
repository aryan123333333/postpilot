#!/bin/bash
# Start tunnel - run this after cloudflared is downloaded
echo "Checking if cloudflared exists..."
if [ -f /home/z/cloudflared ]; then
  echo "Found! Starting tunnel..."
  /home/z/cloudflared tunnel --url http://localhost:3000
else
  echo "Not found. Run download first: node /home/z/my-project/scripts/download-cf.mjs"
fi
