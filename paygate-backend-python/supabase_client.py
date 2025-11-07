"""
Supabase client configuration for the PayGate application
This module provides a centralized Supabase client instance for the application
"""
from supabase import create_client, Client
from config.settings import settings
from typing import Optional
import os


class SupabaseManager:
    """Manages the Supabase client instance"""
    _instance: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Optional[Client]:
        """Get or create the Supabase client instance, return None if not configured"""
        if cls._instance is None:
            # Use environment variables for Supabase configuration
            supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
            
            if not supabase_url or not supabase_key:
                print(
                    "[WARNING] Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL "
                    "and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment."
                )
                return None
            
            try:
                cls._instance = create_client(supabase_url, supabase_key)
                print("[SUCCESS] Supabase client initialized successfully")
            except Exception as e:
                print(f"[ERROR] Failed to initialize Supabase client: {e}")
                return None
        
        return cls._instance


# Create a global instance for easy import and use (will be None if not configured)
supabase: Optional[Client] = SupabaseManager.get_client()


def get_supabase_client() -> Client:
    """Function to get the Supabase client instance - alternative to direct import"""
    return SupabaseManager.get_client()


__all__ = ["supabase", "get_supabase_client", "SupabaseManager"]