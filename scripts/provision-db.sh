#!/usr/bin/env bash
#
# Provision a fresh Postgres database: build the schema from
# Drizzle migrations, then import legacy DATA ONLY from the old dump.
#
# This is the correct, repeatable way to stand up a new environment (prod,
# staging, a local copy) from the legacy custom-format pg_dump:
#
#   1. `drizzle-kit migrate` builds the exact target schema on the (empty)
#      target and records it in drizzle.__drizzle_migrations — no hand-written
#      baseline rows, no guessing whether the dump matches the migrations.
#   2. Drop foreign keys, `pg_restore --data-only` the rows (restricted to the
#      tables the new schema actually has, so legacy-only ORM tables like
#      `migrations`/`typeorm_metadata` are skipped), then re-add the foreign
#      keys — which also re-validates that every legacy row satisfies them.
#   3. Reset all sequences to MAX(id) so the next insert doesn't collide.
#
# Why drop/re-add FKs instead of `pg_restore --disable-triggers`? A data-only
# restore loads tables in archive order, not dependency order, so it trips over
# foreign keys. `--disable-triggers` needs superuser, which managed Postgres
# typically does not grant. Dropping and re-adding the constraints needs only
# table ownership, which the connecting role has.
#
# New nullable columns (e.g. user.discordAvatarHash) simply stay NULL. All
# Postgres client work runs inside a throwaway `postgres` container, so the only
# host requirements are Docker + pnpm (no local psql/pg_restore needed). The
# legacy dump is a PostgreSQL 12.2 custom-format archive; a newer client reads
# it fine.
#
# Usage:
#   LEGACY_DUMP=path/to/legacy.dump \
#   TARGET_DATABASE_URL='postgres://user:pass@db-host:5432/db?sslmode=require' \
#     pnpm db:provision
#
#   # …or pass the dump as the first argument:
#   TARGET_DATABASE_URL='…' pnpm db:provision -- path/to/legacy.dump
#
# Required:
#   LEGACY_DUMP (or first arg)    Legacy custom-format pg_dump archive to import
#   TARGET_DATABASE_URL           The fresh database to provision
#
# Options (env vars):
#   PG_IMAGE=postgres:17-alpine   Image providing pg_restore/psql
#   PROVISION_RESET=1             DROP + recreate the public/drizzle schemas first
#                                 (destructive; use to re-run on a dirty target)
#   ASSUME_YES=1                  Skip the interactive confirmation
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

TARGET_DATABASE_URL="${TARGET_DATABASE_URL:-}"
# The dump to import must be provided explicitly — via LEGACY_DUMP or the first
# positional argument. There is deliberately no default.
LEGACY_DUMP="${LEGACY_DUMP:-${1:-}}"
PG_IMAGE="${PG_IMAGE:-postgres:17-alpine}"

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31mError:\033[0m %s\n' "$*" >&2; exit 1; }

# psql/pg_restore against the target, run inside the client image.
dpsql()   { docker run --rm    "$PG_IMAGE" psql "$TARGET_DATABASE_URL" "$@"; }   # for -c / -tAqc
dpsql_i() { docker run --rm -i "$PG_IMAGE" psql "$TARGET_DATABASE_URL" "$@"; }   # for SQL on stdin

FK_FILE=""
cleanup() { [[ -n "$FK_FILE" && -f "$FK_FILE" ]] && rm -f "$FK_FILE"; }
trap cleanup EXIT

# ── preflight ─────────────────────────────────────────────────────────────────
[[ -n "$TARGET_DATABASE_URL" ]] || die "TARGET_DATABASE_URL is not set (the fresh DB to provision)."
[[ -n "$LEGACY_DUMP" ]] || die "No dump specified. Set LEGACY_DUMP=path/to/dump (or pass it as the first argument)."
command -v docker >/dev/null || die "docker is required but not found on PATH."
command -v pnpm   >/dev/null || die "pnpm is required but not found on PATH."
[[ -f "$LEGACY_DUMP" ]] || die "Legacy dump not found: $LEGACY_DUMP"
DUMP_ABS="$(cd "$(dirname "$LEGACY_DUMP")" && pwd)/$(basename "$LEGACY_DUMP")"

REDACTED_URL="$(printf '%s' "$TARGET_DATABASE_URL" | sed -E 's#(://[^:/@]+:)[^@]*@#\1****@#')"

log "Checking connectivity to target: $REDACTED_URL"
dpsql -tAqc 'select 1' >/dev/null || die "Cannot connect to TARGET_DATABASE_URL (include ?sslmode=require for a managed/SSL database)."

# ── confirm ───────────────────────────────────────────────────────────────────
if [[ "${ASSUME_YES:-}" != "1" ]]; then
  printf '\nAbout to provision (schema from migrations + legacy data) into:\n  %s\n' "$REDACTED_URL"
  printf 'Legacy dump: %s\n' "$DUMP_ABS"
  [[ "${PROVISION_RESET:-}" == "1" ]] && printf '\033[1;31m  !! PROVISION_RESET=1 will DROP the public and drizzle schemas first !!\033[0m\n'
  read -r -p 'Type "yes" to continue: ' reply
  [[ "$reply" == "yes" ]] || die "Aborted."
fi

# ── optional reset ────────────────────────────────────────────────────────────
if [[ "${PROVISION_RESET:-}" == "1" ]]; then
  log "Resetting target schemas (public, drizzle)…"
  dpsql -v ON_ERROR_STOP=1 -q \
    -c 'DROP SCHEMA IF EXISTS public CASCADE;' \
    -c 'DROP SCHEMA IF EXISTS drizzle CASCADE;' \
    -c 'CREATE SCHEMA public;'
fi

# Guard: refuse to import onto a target that already holds data (avoids PK
# collisions from a double-run). PROVISION_RESET clears this.
EXISTING="$(dpsql -tAqc "select coalesce((select count(*) from \"user\"), 0)" 2>/dev/null || echo 0)"
EXISTING="$(printf '%s' "$EXISTING" | tr -dc '0-9')"
if [[ -n "$EXISTING" && "$EXISTING" != "0" ]]; then
  die "Target already has ${EXISTING} rows in \"user\". Re-run with PROVISION_RESET=1 to wipe and reprovision."
fi

# ── 1. schema from migrations ─────────────────────────────────────────────────
log "Applying Drizzle migrations to build the target schema…"
( cd "$REPO_ROOT" && \
  DATABASE_URL="$TARGET_DATABASE_URL" \
  REDIS_URL="${REDIS_URL:-redis://localhost:6379}" \
  pnpm --filter @scythe/db run db:migrate )

# ── 2a. capture + drop foreign keys (so data can load in any order) ───────────
log "Dropping foreign keys for the data load…"
FK_FILE="$(mktemp)"
dpsql -tAqc \
  "select format('ALTER TABLE %s ADD CONSTRAINT %I %s;', conrelid::regclass, conname, pg_get_constraintdef(oid))
     from pg_constraint
    where contype='f' and connamespace='public'::regnamespace
    order by conname" > "$FK_FILE"
FK_COUNT="$(grep -c . "$FK_FILE" || true)"
dpsql_i -v ON_ERROR_STOP=1 -q <<'SQL'
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT conrelid::regclass AS t, conname
             FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.t, r.conname);
  END LOOP;
END $$;
SQL
log "Dropped ${FK_COUNT} foreign keys (will be restored after the load)."

# ── 2b. data-only import, restricted to tables the new schema has ─────────────
log "Importing legacy data (data-only) from the archive…"
mapfile -t TARGET_TABLES < <(dpsql -tAqc "select tablename from pg_tables where schemaname='public' order by tablename")
TABLE_ARGS=()
for t in "${TARGET_TABLES[@]}"; do [[ -n "$t" ]] && TABLE_ARGS+=(--table="$t"); done
[[ ${#TABLE_ARGS[@]} -gt 0 ]] || die "No tables found in the target public schema — did the migration step run?"

docker run --rm -v "$DUMP_ABS":/legacy.dump:ro "$PG_IMAGE" \
  pg_restore --data-only --no-owner --no-privileges --single-transaction \
  "${TABLE_ARGS[@]}" -d "$TARGET_DATABASE_URL" /legacy.dump \
  || die "Data import failed. See the pg_restore error above."

# ── 2c. re-add foreign keys (re-validates referential integrity) ──────────────
log "Restoring foreign keys (re-validates the imported data)…"
dpsql_i -v ON_ERROR_STOP=1 -q --single-transaction < "$FK_FILE" \
  || die "Re-adding foreign keys failed — the legacy data violates a constraint in the new schema. Data is loaded but FKs are missing; investigate before using this database."

# ── 3. reset sequences so new inserts don't collide with imported ids ─────────
log "Resetting sequences to MAX(id)…"
dpsql_i -v ON_ERROR_STOP=1 -q <<'SQL'
DO $$
DECLARE r RECORD; seq TEXT; maxid BIGINT;
BEGIN
  FOR r IN SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' LOOP
    seq := pg_get_serial_sequence(format('%I', r.table_name), r.column_name);
    IF seq IS NOT NULL THEN
      EXECUTE format('SELECT COALESCE(MAX(%I),0) FROM %I', r.column_name, r.table_name) INTO maxid;
      PERFORM setval(seq, GREATEST(maxid, 1), maxid > 0);
    END IF;
  END LOOP;
END $$;
SQL

# ── summary ───────────────────────────────────────────────────────────────────
USERS="$(dpsql -tAqc 'select count(*) from "user"' | tr -dc '0-9')"
log "Done. Target has ${USERS} users, ${FK_COUNT} foreign keys, and is at the latest migration."
printf '\nThe schema was built from the committed migrations, so it matches them by\n'
printf 'construction and the foreign-key re-add validated the data — no separate drift\n'
printf 'check is needed. (In dev, `drizzle-kit generate` reporting no new migration\n'
printf 'confirms schema.ts is fully captured by the migrations.)\n\n'