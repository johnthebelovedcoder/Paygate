# PayGate

A full-stack payment gateway application with Python FastAPI backend and React frontend.

## Project Structure

- `paygate-backend-python/` - Python FastAPI backend
- `paygate-ui/` - React frontend
- `database/` - Database related files
- `supabase/` - Supabase configuration
- `docs/` - Documentation

## Prerequisites

- Python 3.8+
- Node.js 18+
- pip
- npm

## Setup

### Quick Setup

```bash
npm run setup
```

### Manual Setup

1. Install backend dependencies:
   ```bash
   cd paygate-backend-python
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```bash
   cd paygate-ui
   npm install
   ```

3. Setup environment variables:
   ```bash
   # Copy .env.example to .env in both directories
   cp paygate-backend-python/.env.example paygate-backend-python/.env
   cp paygate-ui/.env.example paygate-ui/.env
   ```

4. Update environment variables with your local configuration.

## Development

### Run both services concurrently (recommended):

```bash
npm run dev
```

This will start:
- Backend at `http://localhost:8000`
- Frontend at `http://localhost:3000`

### Run individual services:

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

## Environment Variables

### Backend (.env in paygate-backend-python)
```
DATABASE_URL=sqlite:///./paygate.db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
PAYSTACK_SECRET_KEY=your-paystack-secret-key
```

### Frontend (.env in paygate-ui)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database

The application supports both SQLite (default) and PostgreSQL databases.

To initialize the database:
```bash
cd paygate-backend-python
python create_tables.py
```

## API Documentation

API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Build for Production

```bash
# Build frontend
npm run build

# Run backend
npm run backend
```

## Running Tests

All tests (concurrently):
```bash
npm run test
```

Backend tests:
```bash
npm run test:backend
# or
cd paygate-backend-python
python -m pytest tests/
```

Frontend tests:
```bash
npm run test:frontend
# or
cd paygate-ui
npm test
```

## Linting and Formatting

Lint frontend code:
```bash
npm run lint
```

## Docker Setup

Build and run with Docker Compose:
```bash
# Build containers
npm run docker:build
# or
docker-compose build

# Run containers
npm run docker:up
# or
docker-compose up

# Stop containers
npm run docker:down
# or
docker-compose down
```

## Additional Scripts

- `npm run setup:dev` - Complete setup including database initialization
- `npm run setup:db` - Initialize the database
- `npm run lint` - Lint frontend code
- `npm run clean` - Clean node_modules