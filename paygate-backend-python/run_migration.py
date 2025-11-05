import os
import sys
from alembic.config import Config
from alembic import command

def run_migrations():
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Set up the Alembic configuration
    alembic_cfg = Config(os.path.join(script_dir, "alembic.ini"))
    
    # Set the script location to the alembic directory
    alembic_cfg.set_main_option("script_location", os.path.join(script_dir, "alembic"))
    
    # Set the SQLAlchemy URL if not set in alembic.ini
    if not alembic_cfg.get_main_option("sqlalchemy.url"):
        # Update this with your actual database URL if needed
        alembic_cfg.set_main_option("sqlalchemy.url", "sqlite:///./test.db")
    
    try:
        # Generate the migration
        print("Generating migration...")
        command.revision(
            config=alembic_cfg,
            autogenerate=True,
            message="Add created_at and updated_at to Content model"
        )
        
        # Apply the migration
        print("\nApplying migration...")
        command.upgrade(alembic_cfg, "head")
        
        print("\nMigration completed successfully!")
    except Exception as e:
        print(f"\nError during migration: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    run_migrations()
