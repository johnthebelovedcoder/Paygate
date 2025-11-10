from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

def generate_key_from_password(password: str, salt: bytes = None) -> tuple[bytes, bytes]:
    """
    Generate a Fernet key from a password using PBKDF2
    Returns (key, salt) tuple
    """
    if salt is None:
        salt = os.urandom(16)  # 16 bytes salt
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,  # Recommended minimum
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key, salt


def get_encryption_key() -> bytes:
    """
    Get encryption key from the application settings
    """
    # Use the SECRET_KEY from settings to generate an encryption key
    key, _ = generate_key_from_password(settings.SECRET_KEY)
    return key


class FieldEncryption:
    """
    Utility class for encrypting and decrypting sensitive data
    """
    
    def __init__(self):
        self.key = get_encryption_key()
        self.cipher = Fernet(self.key)
    
    def encrypt(self, value: str) -> str:
        """
        Encrypt a string value
        Returns encrypted value as a base64 string
        """
        if value is None:
            return None
        
        try:
            encrypted_bytes = self.cipher.encrypt(value.encode())
            return base64.urlsafe_b64encode(encrypted_bytes).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise
    
    def decrypt(self, encrypted_value: str) -> str:
        """
        Decrypt an encrypted base64 string value
        """
        if encrypted_value is None:
            return None
        
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_value.encode())
            decrypted_bytes = self.cipher.decrypt(encrypted_bytes)
            return decrypted_bytes.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise
    
    def encrypt_dict(self, data: dict, fields_to_encrypt: list) -> dict:
        """
        Encrypt specific fields in a dictionary
        """
        encrypted_data = data.copy()
        for field in fields_to_encrypt:
            if field in encrypted_data and encrypted_data[field] is not None:
                encrypted_data[field] = self.encrypt(str(encrypted_data[field]))
        return encrypted_data
    
    def decrypt_dict(self, data: dict, fields_to_decrypt: list) -> dict:
        """
        Decrypt specific fields in a dictionary
        """
        decrypted_data = data.copy()
        for field in fields_to_decrypt:
            if field in decrypted_data and decrypted_data[field] is not None:
                decrypted_data[field] = self.decrypt(str(decrypted_data[field]))
        return decrypted_data


# Global instance for use throughout the application
field_encryptor = FieldEncryption()


def encrypt_sensitive_data(data: str) -> str:
    """
    Convenience function to encrypt sensitive data
    """
    return field_encryptor.encrypt(data)


def decrypt_sensitive_data(encrypted_data: str) -> str:
    """
    Convenience function to decrypt sensitive data
    """
    return field_encryptor.decrypt(encrypted_data)