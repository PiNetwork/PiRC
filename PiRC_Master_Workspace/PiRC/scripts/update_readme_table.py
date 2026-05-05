#!/usr/bin/env python3
import re
from pathlib import Path

def update_readme_table():
    readme_path = Path("README.md")
    table_path = Path("table.md")

    if not table_path.exists():
        print("⚠️ table.md not found. Skipping update.")
        return

    content = readme_path.read_text(encoding="utf-8")
    table = table_path.read_text(encoding="utf-8").strip()

    new_content = re.sub(
        r"<!-- TABLE_START -->.*?<!-- TABLE_END -->",
        f"<!-- TABLE_START -->\n{table}\n<!-- TABLE_END -->",
        content,
        flags=re.DOTALL
    )

    readme_path.write_text(new_content, encoding="utf-8")
    print("✅ README.md table updated successfully.")

if __name__ == "__main__":
    update_readme_table()
