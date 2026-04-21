#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/quant_ai_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."

# Use docker exec to run pg_dump
docker exec quant-ai-db pg_dump -U quantai quant_ai > "$BACKUP_FILE"

echo "Backup saved to: $BACKUP_FILE"

# Keep only last 30 backups
cd "$BACKUP_DIR"
ls -t quant_ai_*.sql | tail -n +31 | xargs -r rm -f

echo "Backup complete."
