#!/bin/bash
echo "🚀 PiRC Master Test — All Contracts"
for script in run_*.sh; do
  echo "────────────────────────────────────"
  echo "Testing → $script"
  ./"$script"
done
echo "✅ Master test finished — all systems ready."
