#!/usr/bin/env sh
# One-command usage report for the Coolify VPS — whole-box totals AND per-site.
# Run it on the droplet (DigitalOcean Web Console):
#   sh deploy/usage.sh      (or copy it to the box and: sh usage.sh)
#
# It answers "am I running out?" (box) and "which site uses what?" (per-container
# CPU/RAM, per-volume disk, per-database size). On a flat-priced VPS this is for
# capacity + troubleshooting, not billing.
set -eu

line() { printf '\n===== %s =====\n' "$1"; }

line "BOX: disk (/)"
df -h /

line "BOX: memory"
free -h

line "PER-CONTAINER: CPU + memory (live snapshot)"
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}'

line "STORAGE: docker images / containers / volumes (totals)"
docker system df

line "STORAGE: per volume  (each site = its <uuid> pgdata + an uploads volume)"
docker system df -v | sed -n '/VOLUME NAME/,/Build cache/p' | sed '/Build cache/d'

line "DATABASE SIZES (per site)"
for c in $(docker ps --format '{{.Names}}' | grep -i postgres || true); do
  s=$(docker exec "$c" psql -U postgres -tAc \
        "SELECT pg_size_pretty(pg_database_size('postgres'));" 2>/dev/null \
        | tr -d '[:space:]' || true)
  printf '  %s = %s\n' "$c" "${s:-n/a}"
done

printf '\nRule of thumb: resize the droplet when memory sits above ~85%% or disk above ~80%%.\n'
