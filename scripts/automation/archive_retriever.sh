#!/bin/bash
# OMNI-ARCHIVE RETRIEVER
# Automatically searches archive/old_versions for missing tools or logic required by workflows
search_target="$1"
archive_dir="archive/old_versions"
echo "[ARCHIVE-AGENT] Hunting for missing dependency: $search_target"
if [ -d "$archive_dir" ]; then
    found_file=$(find "$archive_dir" -name "$search_target" -type f | head -n 1)
    if [ -n "$found_file" ]; then
        echo "[ARCHIVE-AGENT] Found missing file in archive: $found_file. Restoring to active matrix..."
        cp "$found_file" "./src/core/"
        exit 0
    fi
fi
echo "[ARCHIVE-AGENT] Target not found in archive."
exit 1
