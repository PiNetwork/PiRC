#!/bin/bash
# =============================================================
# PiRC SOVEREIGN MONITOR - REAL-TIME ANALYTICS
# =============================================================

# Colors for a professional UI
BLUE='\033[0;34m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}==============================================================${NC}"
echo -e "${CYAN}          PiRC2 SOVEREIGN GATEWAY - LIVE MONITORING${NC}"
echo -e "${BLUE}==============================================================${NC}"
echo -e "System Status: ${GREEN}ONLINE (PM2)${NC}"
echo -e "Endpoint: ${CYAN}POST /api/v1/tokenize${NC}"
echo -e "--------------------------------------------------------------"
echo -e "Listening for incoming Luxamir Scan events..."
echo -e "--------------------------------------------------------------"

# Use PM2 logs to stream only the relevant tokenization events
pm2 logs PiRC-Sovereign-API --lines 0 --format | grep -E --line-buffered "Received|Complete|ERROR" | while read -r line; do
    if [[ $line == *"Received"* ]]; then
        echo -e "${CYAN}[SCAN DETECTED]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $line"
    elif [[ $line == *"Complete"* ]]; then
        echo -e "${GREEN}[SUCCESS]${NC} Tokenization Finalized & Certificate Issued."
        echo "--------------------------------------------------------------"
    elif [[ $line == *"ERROR"* ]]; then
        echo -e "\033[0;31m[ALERT]\033[0m $line"
    fi
done
