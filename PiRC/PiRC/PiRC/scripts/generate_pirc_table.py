#!/usr/bin/env python3
import re
import os
from pathlib import Path

def extract_pirc_info(file_path: str):
    """Extract proposal number, title, and status from any PiRC-*.md file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract proposal number and title from the first heading
    title_match = re.search(r'^#\s*(PiRC-\d+):\s*(.+)', content, re.MULTILINE)
    if not title_match:
        return None
    
    proposal = title_match.group(1)
    title = title_match.group(2).strip()
    
    # Extract status (looks for "Status:" or similar)
    status_match = re.search(r'(?i)(Status|State)[:\s-]*(.+?)(?:\n|$)', content)
    status = status_match.group(2).strip() if status_match else "Ready for Review"
    
    return {
        "proposal": proposal,
        "title": title,
        "status": status,
        "file": Path(file_path).name
    }

def generate_table():
    """Generate markdown table from all docs/PiRC-*.md files."""
    docs_dir = Path("docs")
    proposals = []
    
    for md_file in docs_dir.glob("**/*PiRC*.md"):
        info = extract_pirc_info(str(md_file))
        if info:
            proposals.append(info)
    
    # Sort by proposal number
    proposals.sort(key=lambda x: int(re.search(r'\d+', x["proposal"]).group()))
    
    # Build markdown table
    table = "| Proposal | Title / Focus | Status | Key Deliverables |\n"
    table += "|----------|---------------|--------|------------------|\n"
    
    for p in proposals:
        table += f'| **{p["proposal"]}** | {p["title"]} | {p["status"]} | [docs/{p["file"]}](docs/{p["file"]}) |\n'
    
    return table

if __name__ == "__main__":
    table = generate_table()
    print(table)  # For debugging
