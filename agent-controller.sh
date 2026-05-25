#!/bin/bash

echo "[PiRC Agent Controller]"
echo "Validating agent execution..."

TARGET=$1

if [ -z "$TARGET" ]; then
  echo "Usage: ./agent-controller.sh <task>"
  exit 1
fi

echo "Executing task: $TARGET"
echo "Logging execution..."

mkdir -p logs
echo "$(date) :: $TARGET" >> logs/agent-actions.log

echo "Completed."
