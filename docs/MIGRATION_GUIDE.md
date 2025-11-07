# SQLite to PostgreSQL Migration Guide

This guide explains how to migrate your Paygate application from SQLite to PostgreSQL.

## Prerequisites

1. PostgreSQL server installed and running
2. Python dependencies installed (including psycopg2-binary)

## Migration Steps

### 1. Install Required Dependencies

```bash
pip install psycopg2-binary
```

### 2. Set Up PostgreSQL Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE paygate_db;
CREATE USER paygate_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE paygate_db TO paygate_user;
```

2. Update the `.env` file with PostgreSQL connection string:
```
DATABASE_URL=postgresql://paygate_user:your_secure_password@localhost:5432/paygate_db
```

### 3. Initialize PostgreSQL Schema

```bash
cd paygate-backend-python
python ../init_postgres.py
```

### 4. Migrate Data from SQLite to PostgreSQL

```bash
python ../migrate_sqlite_to_postgres.py
```

### 5. Test the Migration

```bash
python ../test_migration.py
```

### 6. Update Alembic Configuration (Optional)

If you plan to use Alembic for future migrations:

```bash
# Generate a new migration (if needed)
alembic revision --autogenerate -m "Migrate to PostgreSQL"

# Run migrations
alembic upgrade head
```

## Environment Configuration

The application will automatically detect the database type from the `DATABASE_URL` in your `.env` file:

- SQLite: `DATABASE_URL=sqlite+aiosqlite:///./paygate.db`
- PostgreSQL: `DATABASE_URL=postgresql://user:password@host:port/database`

## Known Issues

- When switching between SQLite and PostgreSQL, you may need to restart your application server
- Make sure to backup your SQLite database before starting the migration

## Rollback Plan

If you need to rollback to SQLite:

1. Update `.env` to use SQLite connection string
2. The application will continue to work with the original SQLite database