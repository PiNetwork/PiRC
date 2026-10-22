# Contributing to PiRC

Thanks for contributing! This document covers the general workflow, with a
dedicated section on changes that touch the database.

## General workflow

1. Fork the repo and create a branch from `main`:
   `git checkout -b feature/short-description`
2. Keep commits focused and write clear commit messages.
3. Run the existing test suite before opening a PR.
4. Copy `.env.example` to `.env` and fill in local values — never commit `.env`.
5. Open a pull request against `main` and fill in the PR template.

## Database changes

PiRC uses PostgreSQL/MySQL. Because database changes are harder to undo than
application code, they follow a stricter process than regular code changes.

### 1. Schema change process

- **Never edit the database schema by hand** in a shared/staging/production
  environment. All schema changes must go through a migration file.
- **One migration per logical change.** Don't bundle an unrelated feature's
  schema change into the same migration as another.
- **Migrations must be reversible.** Every migration should include both an
  "up" (apply) and a "down" (rollback) path. If a migration is genuinely
  irreversible (e.g. dropping a column with data loss), say so explicitly in
  the migration description and in the PR.
- **Never edit a migration that has already been merged to `main`.** If you
  need to change something, add a new migration on top of it. Editing a past
  migration breaks anyone who already applied it.
- **Naming convention:** `YYYYMMDDHHMM_short_description.{sql,py}`
  (e.g. `202610191530_add_users_last_login.sql`), so migrations apply in a
  deterministic order.

### 2. What belongs in a migration PR

A PR that changes the database schema should include:

- [ ] The migration file(s) itself (up + down).
- [ ] Any ORM/model changes that correspond to the schema change.
- [ ] Updated seed/fixture data if the change affects it.
- [ ] A short note in the PR description: what changes, why, and whether it's
      backward-compatible with the currently deployed app version.
- [ ] For destructive changes (dropping/renaming a column or table): a note
      on the rollout plan (e.g. "deploy app change first, run migration
      after", or "safe to run anytime").

Do **not** include actual data dumps, `.env`/credential files, or raw
database files in the PR.

### 3. Backward compatibility

Because the app and the database aren't always deployed at exactly the same
moment, prefer **expand → migrate → contract**:

1. **Expand:** add new columns/tables as nullable/optional; don't remove or
   rename anything the current app still depends on.
2. **Migrate:** deploy the app code that uses the new schema; backfill data
   if needed.
3. **Contract:** once the old code path is no longer deployed anywhere,
   open a follow-up PR to drop the old columns/tables.

Avoid renaming columns/tables in place — add the new one, migrate reads/writes
over, then remove the old one in a later PR.

### 4. PR review for database changes

Database PRs require review from at least one maintainer familiar with the
schema, in addition to normal code review. Reviewers will check:

- The migration runs cleanly on a fresh database **and** on a database that
  already has production-like data.
- The rollback (`down`) migration actually reverses the `up` migration.
- Indexes exist for any new columns used in `WHERE`/`JOIN`/`ORDER BY`.
- No secrets, personal data, or environment-specific values are hardcoded
  into the migration.
- Large table changes (adding a `NOT NULL` column, adding an index) are
  checked for lock/performance impact and, if needed, broken into
  non-blocking steps (e.g. add column nullable → backfill → add constraint).

### 5. Local testing

Before opening a PR with a migration:

```bash
# apply all migrations on a clean local DB
<migration tool> upgrade head

# verify rollback works
<migration tool> downgrade -1
<migration tool> upgrade head
```

(Replace `<migration tool>` with the project's actual migration command —
e.g. Alembic, Flyway, or a custom script — update this doc once the tool is
finalized.)

## Reporting security issues

Please do **not** open a public issue for security vulnerabilities. See
`security.py` for how secrets/config are handled, and report security
concerns privately to the maintainers.
