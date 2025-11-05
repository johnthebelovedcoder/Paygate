from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base
from config.settings import settings
import os

print('Current working directory:', os.getcwd())

# Convert async database URL to sync for DDL operations
sync_db_url = settings.DATABASE_URL.replace('sqlite+aiosqlite:///', 'sqlite:///', 1)

print(f'Async DB URL: {settings.DATABASE_URL}')
print(f'Sync DB URL: {sync_db_url}')

# Check if database file exists
db_path = os.path.join('..', 'paygate.db')
if os.path.exists(db_path):
    print(f'Database file exists at: {os.path.abspath(db_path)}')
else:
    print(f'Database file does not exist at: {os.path.abspath(db_path)}')

print('Creating all tables in the database...')
try:
    sync_engine = create_engine(sync_db_url)
    Base.metadata.create_all(bind=sync_engine)
    print('Tables created successfully!')
    
    # Verify tables were created
    with sync_engine.connect() as conn:
        result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result.fetchall()]
        print(f'Tables in database: {tables}')
        
except Exception as e:
    print(f'Error creating tables: {str(e)}')
    import traceback
    traceback.print_exc()