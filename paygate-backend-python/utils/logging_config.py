import logging
import sys
from datetime import datetime
from config.settings import settings
from typing import Optional


class CustomFormatter(logging.Formatter):
    """Custom formatter to add colors and additional context to logs"""
    
    grey = "\x1b[38;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    
    FORMATS = {
        logging.DEBUG: grey + "[DEBUG] %(asctime)s - %(name)s - %(levelname)s - %(message)s" + reset,
        logging.INFO: "[INFO] %(asctime)s - %(name)s - %(levelname)s - %(message)s",
        logging.WARNING: yellow + "[WARNING] %(asctime)s - %(name)s - %(levelname)s - %(message)s" + reset,
        logging.ERROR: red + "[ERROR] %(asctime)s - %(name)s - %(levelname)s - %(message)s" + reset,
        logging.CRITICAL: bold_red + "[CRITICAL] %(asctime)s - %(name)s - %(levelname)s - %(message)s" + reset
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(log_fmt, datefmt='%Y-%m-%d %H:%M:%S')
        return formatter.format(record)


def setup_logging():
    """Configure logging for the entire application"""
    
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG if settings.ENVIRONMENT == "development" else logging.INFO)
    
    # Clear any existing handlers
    logger.handlers.clear()
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG if settings.ENVIRONMENT == "development" else logging.INFO)
    console_handler.setFormatter(CustomFormatter())
    logger.addHandler(console_handler)
    
    # Create file handler (optional, for production)
    if settings.ENVIRONMENT != "development":
        from logging.handlers import RotatingFileHandler
        file_handler = RotatingFileHandler(
            "app.log", 
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_formatter)
        file_handler.setLevel(logging.INFO)
        logger.addHandler(file_handler)
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """Get a configured logger instance"""
    return logging.getLogger(name)


# Initialize logging when this module is imported
setup_logging()