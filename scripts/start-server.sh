#!/bin/bash
cd /home/z/my-project

# Kill any existing process on port 3000
kill $(lsof -t -i:3000 2>/dev/null) 2>/dev/null
sleep 1

# Start Next.js dev server in background
nohup npx next dev -p 3000 > /home/z/my-project/dev.log 2>&1 &
echo $! > /home/z/my-project/server.pid
echo "Server PID: $(cat /home/z/my-project/server.pid)"
