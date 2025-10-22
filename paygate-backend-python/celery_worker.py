from celery import Celery
from config.settings import settings

# Create Celery instance
celery_app = Celery(
    'paygate',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        'tasks.email',
        'tasks.file_processing',
        'tasks.analytics',
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_routes={
        'tasks.email.*': {'queue': 'email'},
        'tasks.file_processing.*': {'queue': 'file_processing'},
        'tasks.analytics.*': {'queue': 'analytics'},
    },
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

if __name__ == '__main__':
    celery_app.start()