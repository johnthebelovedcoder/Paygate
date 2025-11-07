# Supabase Configuration for PayGate

This document explains how to properly configure PayGate to use Supabase for both development and production environments.

## Prerequisites

Before setting up Supabase, ensure you have:
1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created
3. Your project URL and API keys
4. PostgreSQL database access configured

## Environment Configuration

Update your `.env` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration - Use Supabase PostgreSQL
DATABASE_URL=postgresql+asyncpg://postgres:your-db-password@db.your-project.supabase.co:5432/postgres
```

## Switching Between Development and Production

### For Local Development with SQLite
Use this configuration for local development:

```env
# Use SQLite for local development
DATABASE_URL=sqlite+aiosqlite:///./paygate_local.db
```

### For Production with Supabase
Use this configuration for production:

```env
# Use Supabase PostgreSQL for production
DATABASE_URL=postgresql+asyncpg://postgres:your-db-password@db.your-project.supabase.co:5432/postgres
```

## Using the Supabase Client in Your Application

The application includes a centralized Supabase client that can be imported and used:

```python
from supabase_client import supabase

# Example: Query a table
result = await supabase.table('users').select('*').execute()
users = result.data

# Example: Insert data
data = {"email": "user@example.com", "name": "John Doe"}
result = await supabase.table('users').insert(data).execute()
```

## Database Schema Setup

To initialize the database schema in Supabase:

```bash
# Run the schema setup script
python ensure_supabase_schema.py
```

## Testing the Connection

To test your Supabase connection:

```bash
# Run the connection test
python test_supabase_integration.py
```

## Security Considerations

- **Never commit API keys** to version control
- Use environment variables for all credentials
- Rotate your keys regularly
- Use service role keys only for server-side operations
- Use anon keys for client-side operations when possible

## Troubleshooting

### Connection Issues
- Verify your Supabase project is active
- Check that your network allows outbound connections to Supabase
- Ensure your IP is allowed in the Supabase project settings
- Verify all environment variables are set correctly

### Database Access
- Check that the correct database URL is configured
- Verify the database password is URL-encoded if it contains special characters
- Ensure the database schema has been properly initialized