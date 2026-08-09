#!/usr/bin/env sh
# Nightly backup for ONE storefront: dumps its Postgres database and archives the
# uploaded images, timestamped, keeping the last KEEP_DAYS. Run on the VPS via
# cron, e.g.:   0 3 * * *  /opt/backups/backup.sh
#
# Coolify users: its built-in scheduled Postgres backups already cover the
# database — this still gives you the images archive (and works for raw compose).
set -eu

# --- configure these for the site (or pass as env vars) ---
DB_CONTAINER="${DB_CONTAINER:-deploy-db-1}"      # `docker ps` shows the real name
DB_USER="${DB_USER:-storefront}"
DB_NAME="${DB_NAME:-storefront}"
UPLOADS_VOLUME="${UPLOADS_VOLUME:-deploy_uploads}"  # `docker volume ls`
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
# ----------------------------------------------------------

stamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 1) Database dump (gzip'd SQL)
docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" \
  | gzip > "$BACKUP_DIR/db-$stamp.sql.gz"

# 2) Uploaded images — read the named volume via a throwaway container
docker run --rm -v "$UPLOADS_VOLUME":/data:ro -v "$BACKUP_DIR":/backup alpine \
  tar czf "/backup/uploads-$stamp.tar.gz" -C /data .

# 3) Prune backups older than KEEP_DAYS
find "$BACKUP_DIR" -name 'db-*.sql.gz'      -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime +"$KEEP_DAYS" -delete

echo "Backup complete -> $BACKUP_DIR (db-$stamp.sql.gz, uploads-$stamp.tar.gz)"
# Restore a DB dump into a running db container:
#   gunzip -c db-YYYYMMDD-HHMMSS.sql.gz | docker exec -i <db> psql -U storefront storefront
