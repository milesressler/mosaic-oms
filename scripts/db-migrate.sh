#!/usr/bin/env bash
set -euo pipefail

MYSQL_IMAGE="mysql:8.0"
DB_NAME="mosaicoms"

usage() {
  cat <<EOF
Usage: $0 \\
  --src-host <host> --src-user <user> --src-pass <pass> \\
  --dst-host <host> --dst-user <user> --dst-pass <pass>

All flags are required. Connects to both RDS instances via Docker
and pipes mysqldump output directly into the destination database.
EOF
  exit 1
}

SRC_HOST="" SRC_USER="" SRC_PASS=""
DST_HOST="" DST_USER="" DST_PASS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --src-host) SRC_HOST="$2"; shift 2 ;;
    --src-user) SRC_USER="$2"; shift 2 ;;
    --src-pass) SRC_PASS="$2"; shift 2 ;;
    --dst-host) DST_HOST="$2"; shift 2 ;;
    --dst-user) DST_USER="$2"; shift 2 ;;
    --dst-pass) DST_PASS="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; usage ;;
  esac
done

for var in SRC_HOST SRC_USER SRC_PASS DST_HOST DST_USER DST_PASS; do
  [[ -n "${!var}" ]] || { echo "Missing --$(echo "$var" | tr '[:upper:]' '[:lower:]' | tr '_' '-')"; usage; }
done

echo "Source:      ${SRC_HOST}/${DB_NAME}"
echo "Destination: ${DST_HOST}/${DB_NAME}"
echo ""
echo "WARNING: All data in '${DB_NAME}' on the destination will be replaced."
read -r -p "Continue? [y/N] " confirm
[[ "$confirm" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

echo "Migrating..."
docker run --rm "$MYSQL_IMAGE" \
  mysqldump \
    --host="$SRC_HOST" \
    --user="$SRC_USER" \
    --password="$SRC_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    --add-drop-table \
    "$DB_NAME" \
| docker run --rm -i "$MYSQL_IMAGE" \
  mysql \
    --host="$DST_HOST" \
    --user="$DST_USER" \
    --password="$DST_PASS" \
    "$DB_NAME"

echo "Migration complete."
