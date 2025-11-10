from sqlalchemy import String, TypeDecorator
from utils.encryption import field_encryptor
import logging

logger = logging.getLogger(__name__)

class EncryptedString(TypeDecorator):
    """
    A custom SQLAlchemy type that automatically encrypts and decrypts string values
    """
    impl = String

    def process_bind_param(self, value, dialect):
        """Encrypt the value when storing in the database"""
        if value is None:
            return None
        
        try:
            return field_encryptor.encrypt(value)
        except Exception as e:
            logger.error(f"Failed to encrypt value: {e}")
            raise

    def process_result_value(self, value, dialect):
        """Decrypt the value when reading from the database"""
        if value is None:
            return None
        
        try:
            return field_encryptor.decrypt(value)
        except Exception as e:
            logger.error(f"Failed to decrypt value: {e}")
            raise