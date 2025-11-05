import asyncio
import json
import time
from typing import Optional

class Cache:
    def __init__(self):
        self._cache = {}
        self._expirations = {}

    def _is_expired(self, key: str) -> bool:
        """Check if a key has expired"""
        if key in self._expirations:
            return time.time() > self._expirations[key]
        return False

    def _clean_expired(self, key: str):
        """Remove expired key"""
        if self._is_expired(key):
            self._cache.pop(key, None)
            self._expirations.pop(key, None)
            return True
        return False

    async def init_cache(self):
        """Initialize the cache - nothing needed for in-memory cache"""
        print("In-memory cache initialized")
        return

    async def get(self, key: str) -> Optional[str]:
        """Get a value from the cache"""
        self._clean_expired(key)
        return self._cache.get(key)

    async def set(self, key: str, value: str, expire: int = 300) -> bool:
        """Set a value in the cache with optional expiration"""
        self._cache[key] = value
        if expire > 0:
            self._expirations[key] = time.time() + expire
        return True

    async def delete(self, key: str) -> bool:
        """Delete a key from the cache"""
        self._cache.pop(key, None)
        self._expirations.pop(key, None)
        return True

    async def clear(self) -> bool:
        """Clear all items from the cache"""
        self._cache.clear()
        self._expirations.clear()
        return True

    async def exists(self, key: str) -> bool:
        """Check if a key exists in the cache"""
        self._clean_expired(key)
        return key in self._cache

    async def ttl(self, key: str) -> int:
        """Get the TTL for a key in seconds"""
        if key not in self._expirations:
            return -2  # Key doesn't exist or has no TTL
        if self._is_expired(key):
            return -1  # Key exists but has expired
        return int(self._expirations[key] - time.time())

    async def delete(self, key: str) -> bool:
        """Delete a key from cache"""
        self._cache.pop(key, None)
        self._expirations.pop(key, None)
        return True

    async def exists(self, key: str) -> bool:
        """Check if a key exists in cache"""
        self._clean_expired(key)
        return key in self._cache

# Create a global instance
cache = Cache()