#!/bin/bash
REPORT_FILE="PI_RC_VERIFICATION_REPORT.txt"
echo "=================================================" > "$REPORT_FILE"
echo " PiRC SYSTEM VERIFICATION REPORT " >> "$REPORT_FILE"
echo " Date: $(date)" >> "$REPORT_FILE"
echo "=================================================" >> "$REPORT_FILE"

echo "1. MANIFEST CHECK:" >> "$REPORT_FILE"
head -n 20 sovereign_manifest.json 2>/dev/null >> "$REPORT_FILE" || echo "Manifest not generated yet." >> "$REPORT_FILE"

echo -e "\n2. LIVE MATRIX REGISTRY CHECK:" >> "$REPORT_FILE"
head -n 20 LIVE_MATRIX_REGISTRY.csv 2>/dev/null >> "$REPORT_FILE" || echo "CSV Registry empty or not found." >> "$REPORT_FILE"

echo -e "\n3. HEALTH MONITOR CHECK:" >> "$REPORT_FILE"
if [ -f "./health_monitor.sh" ]; then
    ./health_monitor.sh >> "$REPORT_FILE" 2>/dev/null || echo "Health script execution failed." >> "$REPORT_FILE"
else
    echo "health_monitor.sh not found." >> "$REPORT_FILE"
fi

echo -e "\n✅ Verification Complete. Check $REPORT_FILE for details."
cat "$REPORT_FILE"
