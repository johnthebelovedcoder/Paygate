import sys
import os
import asyncio
import inspect
from sqlalchemy import text

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import engine
from models.user import User

async def verify_model_matches_table():
    print("=== VERIFICATION: User Model vs Database Table ===")
    
    # Get the actual column names from the database
    async with engine.begin() as conn:
        result = await conn.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'users' AND table_schema = 'public'
            ORDER BY ordinal_position;
        """))
        table_columns = [row[0] for row in result.fetchall()]
    
    # Get the column names from the SQLAlchemy model
    model_columns = []
    for column in User.__table__.columns:
        model_columns.append(column.name)
    
    print(f"Database table 'users' columns ({len(table_columns)}):")
    for col in table_columns:
        status = "✓" if col in model_columns else "✗ (missing in model)"
        print(f"  {col} {status}")
    
    print(f"\nSQLAlchemy model 'User' columns ({len(model_columns)}):")
    for col in model_columns:
        status = "✓" if col in table_columns else "✗ (doesn't exist in table)"
        print(f"  {col} {status}")
    
    # Find mismatches
    missing_in_model = set(table_columns) - set(model_columns)
    extra_in_model = set(model_columns) - set(table_columns)
    
    print(f"\n=== ANALYSIS ===")
    if missing_in_model:
        print(f"Columns in table but missing in model: {list(missing_in_model)}")
    else:
        print("✓ All table columns are in the model")
        
    if extra_in_model:
        print(f"Columns in model but not in table: {list(extra_in_model)}")
    else:
        print("✓ All model columns exist in the table")
    
    if not missing_in_model and not extra_in_model:
        print("\n🎉 PERFECT MATCH! Model and table structure are aligned.")
        print("The login should now work properly.")
    else:
        print(f"\n⚠️ Issues remain. Manual adjustment may be needed.")

# Run the verification
asyncio.run(verify_model_matches_table())