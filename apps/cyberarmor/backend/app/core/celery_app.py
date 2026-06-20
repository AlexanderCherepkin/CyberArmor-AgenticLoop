from celery import Celery

from app.core.config import settings


def make_celery() -> Celery:
    celery = Celery(
        "cyberarmor",
        broker=settings.celery_broker_url,
        backend=settings.celery_result_backend,
        include=["app.services.tasks"],
    )
    celery.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        task_time_limit=600,
        worker_prefetch_multiplier=1,
    )
    return celery


celery_app = make_celery()
