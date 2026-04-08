#!/bin/bash
echo "Launching PiRC-101 Interactive Environment..."
# Open the dashboard in the default browser
open simulator/interactive_dashboard.html || xdg-open simulator/interactive_dashboard.html
# Run the live oracle in the terminal
python3 simulator/live_oracle_dashboard.py

