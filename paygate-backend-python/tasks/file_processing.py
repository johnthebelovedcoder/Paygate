import os
import shutil
from pathlib import Path
from PIL import Image
import fitz  # PyMuPDF for PDF processing
from celery import current_task
from .celery_worker import celery_app
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def process_uploaded_file(self, file_path: str, file_type: str, processing_options: Dict[str, Any] = None):
    """
    Process uploaded file in background
    """
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        if file_type.startswith('image/'):
            return process_image_file(file_path, processing_options)
        elif file_type == 'application/pdf':
            return process_pdf_file(file_path, processing_options)
        else:
            # For other file types, just return basic info
            file_size = os.path.getsize(file_path)
            return {
                "status": "completed",
                "file_path": file_path,
                "file_size": file_size,
                "processed_type": "other"
            }
    
    except Exception as exc:
        logger.error(f"File processing failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)

def process_image_file(file_path: str, processing_options: Dict[str, Any] = None):
    """
    Process image file - resize, create thumbnails, etc.
    """
    try:
        with Image.open(file_path) as img:
            # Get original dimensions
            original_size = img.size
            
            # Create thumbnail
            thumbnail_size = processing_options.get('thumbnail_size', (200, 200))
            img.thumbnail(thumbnail_size)
            
            # Create thumbnail path
            path_obj = Path(file_path)
            thumbnail_path = path_obj.parent / f"{path_obj.stem}_thumb{path_obj.suffix}"
            img.save(thumbnail_path, optimize=True, quality=85)
            
            # Resize original if needed
            resize_to = processing_options.get('resize_to')
            if resize_to:
                img_resized = img.resize(resize_to)
                resized_path = path_obj.parent / f"{path_obj.stem}_resized{path_obj.suffix}"
                img_resized.save(resized_path, optimize=True, quality=85)
            
            return {
                "status": "completed",
                "file_path": file_path,
                "original_size": original_size,
                "thumbnail_path": str(thumbnail_path),
                "processed_type": "image"
            }
    
    except Exception as e:
        logger.error(f"Image processing failed: {str(e)}")
        raise

def process_pdf_file(file_path: str, processing_options: Dict[str, Any] = None):
    """
    Process PDF file - extract metadata, create preview, etc.
    """
    try:
        doc = fitz.open(file_path)
        
        # Extract metadata
        metadata = doc.metadata
        page_count = len(doc)
        
        # Create preview image of first page
        page = doc[0]
        mat = fitz.Matrix(0.2, 0.2)  # Scale down for preview
        pix = page.get_pixmap(matrix=mat)
        
        # Save preview as image
        path_obj = Path(file_path)
        preview_path = path_obj.parent / f"{path_obj.stem}_preview.png"
        pix.save(str(preview_path))
        
        doc.close()
        
        return {
            "status": "completed", 
            "file_path": file_path,
            "page_count": page_count,
            "metadata": metadata,
            "preview_path": str(preview_path),
            "processed_type": "pdf"
        }
    
    except Exception as e:
        logger.error(f"PDF processing failed: {str(e)}")
        raise

@celery_app.task(bind=True)
def optimize_content_file(self, file_path: str, content_id: int):
    """
    Optimize content file for web delivery in background
    """
    try:
        # This could include compression, format conversion, etc.
        file_size_before = os.path.getsize(file_path)
        
        # Placeholder for optimization logic
        # In a real implementation, this would include:
        # - Image compression
        # - Video transcoding
        # - PDF optimization
        # - Format conversion
        
        file_size_after = os.path.getsize(file_path)  # Placeholder
        
        return {
            "status": "completed",
            "content_id": content_id,
            "file_path": file_path,
            "size_before": file_size_before,
            "size_after": file_size_after,
            "saved_space": file_size_before - file_size_after
        }
    
    except Exception as exc:
        logger.error(f"Content optimization failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)

@celery_app.task(bind=True)
def create_content_thumbnail(self, file_path: str, content_id: int):
    """
    Create thumbnail for content in background
    """
    try:
        # Create thumbnail based on file type
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext in ['.jpg', '.jpeg', '.png', '.gif']:
            return process_image_file(file_path, {"thumbnail_size": (300, 300)})
        elif file_ext == '.pdf':
            return process_pdf_file(file_path)
        else:
            # For other types, create a placeholder thumbnail
            return {
                "status": "completed",
                "content_id": content_id,
                "file_path": file_path,
                "thumbnail_path": f"{file_path}_thumbnail.png",  # Placeholder
                "processed_type": "thumbnail"
            }
    
    except Exception as exc:
        logger.error(f"Thumbnail creation failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)