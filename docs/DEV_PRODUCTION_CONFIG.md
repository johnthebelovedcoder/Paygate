# Supabase Configuration for PayGate

## Overview
This project is configured to use Supabase exclusively for both development and production environments.

## Database Configuration
The application now uses PostgreSQL via Supabase for all operations:
- **Primary Database**: Supabase PostgreSQL via pooler connection
- **Connection Method**: Uses connection pooling for better performance
- **Environment**: Both development and production use the same Supabase database

## Current Configuration
- **User**: postgres.ixbiabwdzmezugjtxnzi
- **Host**: aws-1-eu-north-1.pooler.supabase.com
- **Port**: 6543 (pooler port for IPv4 compatibility)
- **Database**: postgres
- **URL Format**: `postgresql+asyncpg://postgres.ixbiabwdzmezugjtxnzi:3xrBa3dqGroX27Wi@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

## Connection Pooling
Uses Supabase connection pooling (pgbouncer) to handle multiple concurrent connections efficiently across both development and production.

## Benefits
- Consistent environment between development and production
- Better scalability and performance
- Real-time database features available during development
- Shared database state during development

## Fallback Option
If Supabase is unavailable, uncomment the SQLite line in the .env file as a temporary fallback.