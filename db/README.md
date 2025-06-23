# Database Management - Garbage Collection System

This directory contains all database-related files, including migrations, seeds, and verification scripts.

## 🗄️ Database Engine

- **PostgreSQL 14+**

## 📁 Directory Structure

```
db/
├── migrations/         # Database schema migrations
├── seeds/              # Data seeding scripts
├── utils/              # Database utility scripts (backup, restore)
└── verify.sql          # Verification script for database integrity
```

## 🚀 Usage

### Running Migrations

Migrations are managed by a tool like `node-pg-migrate` or the backend's ORM (e.g., Prisma). Assuming a package.json script in this directory:

```bash
npm run migrate
```
This will apply all pending migrations to the database.

### Seeding Data

To populate the database with initial data (e.g., admin users, roles):

```bash
npm run seed
```

### Verifying Schema

To verify database integrity, constraints, and functions, run the verification script:

```bash
psql -U <user> -d <database> -f verify.sql
```

## 🔐 Schema & Security

- **Migrations**: Each change to the schema is a separate, timestamped migration file.
- **Data Integrity**: Foreign key constraints, unique constraints, and check constraints are used to ensure data integrity.
- **Audit Columns**: Tables include `created_at`, `updated_at`, `created_by`, and `updated_by` for auditing.
- **Soft Deletes**: A `deleted_at` column is used for soft deletes.
- **GDPR Compliance**: Includes scripts and mechanisms for data anonymization, export, and deletion.

## 📦 Backup & Restore

Utility scripts for backing up and restoring the database are located in the `utils/` directory.

### Backup
```bash
# Example backup script usage
./utils/backup.sh
```

### Restore
```bash
# Example restore script usage
./utils/restore.sh <backup-file.sql>
``` 