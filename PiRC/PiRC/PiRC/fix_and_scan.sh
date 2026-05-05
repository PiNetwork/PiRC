#!/data/data/com.termux/files/usr/bin/bash
echo "================================================="
echo "🛠️ 1. Auto-Fixing Mermaid Diagram Errors..."
echo "================================================="
# Fix Mermaid subgraph syntax rules (No parens or unquoted spaces directly in IDs)
find . -name "*.md" -type f -exec sed -i 's/subgraph Terminal Interface/subgraph TerminalInterface ["Terminal Interface"]/g' {} +
find . -name "*.md" -type f -exec sed -i 's/subgraph The Intelligence Layer/subgraph IntelligenceLayer ["The Intelligence Layer"]/g' {} +
find . -name "*.md" -type f -exec sed -i 's/subgraph The Execution Layer (Soroban Wasm)/subgraph ExecutionLayer ["The Execution Layer (Soroban Wasm)"]/g' {} +

echo "🔍 2. Running Deep Repository Scan..."
REPORT="PIRC_DIAGNOSTIC_REPORT.txt"
echo "=== PiRC Deep Diagnostic Report ===" > $REPORT
echo "Date: $(date)" >> $REPORT
echo "" >> $REPORT

echo "🔸 A. Checking for remaining broken Mermaid subgraphs:" >> $REPORT
grep -E 'subgraph [a-zA-Z0-9_ ]+[\(\)]' -rn --include=\*.md . >> $REPORT || echo "   ✅ None found (All parsed/fixed successfully!)." >> $REPORT

echo "🔸 B. Checking Bash Scripts for hidden Syntax Errors:" >> $REPORT
find . -name "*.sh" -type f | while read script; do
    bash -n "$script" 2>> $REPORT
done
echo "   ✅ Syntax check completed." >> $REPORT

echo "🔸 C. Checking Markdown for unclosed code blocks:" >> $REPORT
find . -name "*.md" -type f | while read mdfile; do
    backticks=$(grep -o '```' "$mdfile" | wc -l)
    if [ $((backticks % 2)) -ne 0 ]; then
        echo "   ⚠️ Unclosed code block in: $mdfile" >> $REPORT
    fi
done

echo "📤 3. Committing and Syncing diagram fixes to GitHub..."
git add -u
git commit -m "fix(docs): Repaired Mermaid diagram syntax rendering issues" || true
git pull origin main --rebase || true
git push origin main || true

echo "================================================="
echo "✅ Scan and Fix Complete!"
echo "================================================="
echo "📄 -- PLEASE COPY THE REPORT BELOW AND SEND IT TO ME --"
echo ""
cat $REPORT
echo ""
echo "================================================="
