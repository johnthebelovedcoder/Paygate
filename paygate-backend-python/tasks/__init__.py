import sys
import os
from pathlib import Path

# Add parent directory to Python path to allow importing from the root
parent_dir = Path(__file__).parent.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

# Import all task modules to make them available
from . import email
from . import file_processing
from . import analytics

__all__ = ['email', 'file_processing', 'analytics']