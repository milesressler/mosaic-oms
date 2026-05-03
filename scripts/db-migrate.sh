#!/usr/bin/env bash
set -euo pipefail

# Database parameters from compose.yaml
COMPOSE_SERVICE="mysql"
DB_NAME="mosaicoms"
DB_USER="mosaic-oms-api"
DB_PASS="Uwv1cTzGs0ReGO5A"
DB_ROOT_PASS="xiOrJxAjFDhP8aZkUFFjToyOr9g="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

usage() {
  cat <<EOF
Usage: $0 <command> [options]

Commands:
  dump    [file]    Dump the database to a SQL file (default: mosaicoms_<timestamp>.sql)
  restore <file>    Restore the database from a SQL file

Examples:
  $0 dump
  $0 dump backup.sql
  $0 restore backup.sql
EOF
  exit 1
}

check_container_running() {
  if ! docker compose -f "$PROJECT_ROOT/compose.yaml" ps --services --filter status=running 2>/dev/null | grep -q "^${COMPOSE_SERVICE}$"; then
    echo "Error: Docker Compose service '${COMPOSE_SERVICE}' is not running."
    echo "Start it with: docker compose up -d"
    exit 1
  fi
}

cmd_dump() {
  local outfile="${1:-${PROJECT_ROOT}/mosaicoms_$(date +%Y%m%d_%H%M%S).sql}"

  check_container_running

  echo "Dumping '${DB_NAME}' -> ${outfile} ..."
  docker compose -f "$PROJECT_ROOT/compose.yaml" exec -T "$COMPOSE_SERVICE" \
    mysqldump \
      --user="$DB_USER" \
      --password="$DB_PASS" \
      --single-transaction \
      --routines \
      --triggers \
      --add-drop-table \
      "$DB_NAME" > "$outfile"

  echo "Dump complete: $outfile ($(du -sh "$outfile" | cut -f1))"
}

cmd_restore() {
  local infile="${1:-}"
  if [[ -z "$infile" ]]; then
    echo "Error: restore requires a file argument."
    usage
  fi

  if [[ ! -f "$infile" ]]; then
    echo "Error: file not found: $infile"
    exit 1
  fi

  check_container_running

  echo "Restoring '${DB_NAME}' from ${infile} ..."
  echo "WARNING: This will drop and recreate all tables in '${DB_NAME}'."
  read -r -p "Continue? [y/N] " confirm
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi

  docker compose -f "$PROJECT_ROOT/compose.yaml" exec -T "$COMPOSE_SERVICE" \
    mysql \
      --user="root" \
      --password="$DB_ROOT_PASS" \
      "$DB_NAME" < "$infile"

  echo "Restore complete."
}

case "${1:-}" in
  dump)    cmd_dump    "${2:-}" ;;
  restore) cmd_restore "${2:-}" ;;
  *)       usage ;;
esac
