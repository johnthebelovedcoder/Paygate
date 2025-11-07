# PayGate with Supabase Integration

PayGate is now fully configured to work with Supabase for both development and production environments.

## Features

- **PostgreSQL Database**: Leverages Supabase's managed PostgreSQL database
- **Authentication**: Built-in Supabase Auth integration
- **Storage**: File storage capabilities via Supabase
- **Real-time**: Real-time subscriptions (when needed)
- **Edge Functions**: Serverless functions (when needed)

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
   The requirements include the `supabase` Python client library.

2. **Configure environment variables** by updating your `.env` file:
   - Set `DATABASE_URL` to your Supabase PostgreSQL connection string
   - Add Supabase URL and keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

3. **Initialize the database schema**:
   ```bash
   python ensure_supabase_schema.py
   ```

## Supabase Client Usage

The application includes a centralized Supabase client that can be imported anywhere:

```python
from supabase_client import supabase

# Direct database operations
result = await supabase.table('users').select('*').limit(10).execute()

# Authentication operations  
auth_result = await supabase.auth.sign_up({'email': 'user@example.com', 'password': 'password'})

# Storage operations
storage_result = await supabase.storage.from_('bucket-name').upload('path/to/file', file_data)
```

## API Endpoints

The following Supabase-related endpoints are available:

- `GET /api/supabase/health` - Check Supabase connectivity
- `GET /api/supabase/users/{id}` - Get user from Supabase
- `GET /api/supabase/storage-url` - Get Supabase storage URL

## Development vs Production

- **Development**: Can use SQLite for local development (faster iteration)
- **Production**: Use Supabase PostgreSQL for scalability and reliability

Toggle between configurations in your `.env` file by commenting/uncommenting the appropriate `DATABASE_URL` setting.

## Migrating from SQLite

If you have existing data in SQLite, use the migration scripts:
```bash
python migrate_sqlite_to_postgres.py
```

## Testing

Run the Supabase integration tests:
```bash
python test_supabase_integration.py
```

## Security

- All Supabase credentials are stored in environment variables
- Database connections use SSL encryption
- Service role keys are used only server-side
- Authentication is handled securely via Supabase Auth