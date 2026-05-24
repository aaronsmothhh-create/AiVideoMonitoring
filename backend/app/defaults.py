from __future__ import annotations

import os
from pathlib import Path

from models import CameraSource, DetectionCapability, MonitoringSettings, PublicVideoSource, Zone

DEFAULT_SETTINGS = MonitoringSettings()

_DATA_DIR = Path(__file__).resolve().parents[1] / "data" / "sample_videos"


def default_sources() -> list[CameraSource]:
    return [
        CameraSource(
            id="cam-entrance-main",
            name="Вход — главный зал",
            location="Торговый центр / Вход",
            url=str(_DATA_DIR / "people_3.mp4"),
            source_type="video_file",
            fps_limit=6,
            zones=[
                Zone(id="zone-entrance-doors", name="Входные двери", kind="entrance"),
                Zone(id="zone-entrance-security", name="Пост охраны", kind="work_area"),
            ],
        ),
        CameraSource(
            id="cam-checkout-lanes",
            name="Кассовая зона",
            location="Супермаркет / Кассы",
            url=str(_DATA_DIR / "people_4.mp4"),
            source_type="video_file",
            fps_limit=6,
            zones=[
                Zone(id="zone-checkout-desks", name="Кассовые стойки", kind="checkout"),
                Zone(id="zone-checkout-queue", name="Очередь", kind="work_area"),
            ],
        ),
        CameraSource(
            id="cam-aisle-produce",
            name="Отдел продуктов",
            location="Супермаркет / Продукты",
            url=str(_DATA_DIR / "people_5.mp4"),
            source_type="video_file",
            fps_limit=6,
            zones=[
                Zone(id="zone-produce-shelf", name="Полки продуктов", kind="shelf"),
                Zone(id="zone-produce-aisle", name="Проход", kind="work_area"),
            ],
        ),
        CameraSource(
            id="cam-office-workspace",
            name="Рабочее пространство",
            location="Офис / Рабочая зона",
            url=str(_DATA_DIR / "people_6.mp4"),
            source_type="video_file",
            fps_limit=6,
            zones=[
                Zone(id="zone-office-desks", name="Рабочие места", kind="work_area"),
                Zone(id="zone-office-entrance", name="Вход в офис", kind="entrance"),
            ],
        ),
        CameraSource(
            id="cam-meeting-room",
            name="Переговорная",
            location="Офис / Переговорная",
            url=str(_DATA_DIR / "people_7.mp4"),
            source_type="video_file",
            fps_limit=6,
            zones=[
                Zone(id="zone-meeting-table", name="Стол переговоров", kind="work_area"),
                Zone(id="zone-meeting-entrance", name="Вход", kind="entrance"),
            ],
        ),
        CameraSource(
            id="cam-corridor",
            name="Коридор — 2 этаж",
            location="Офис / Коридор",
            url=str(_DATA_DIR / "people_8.mp4"),
            source_type="video_file",
            fps_limit=6,
            zones=[
                Zone(id="zone-corridor-main", name="Основной коридор", kind="work_area"),
                Zone(id="zone-corridor-exit", name="Выход", kind="entrance"),
            ],
        ),
    ]


PUBLIC_VIDEO_SOURCES: list[PublicVideoSource] = [
    PublicVideoSource(
        id=source.id,
        title=f"{source.name} ({source.source_type})",
        camera_id=source.id,
        source_url=source.url,
        scenario=source.location,
        license_note="Демонстрационное видео (CC0 / Mixkit Free License).",
        supported_signals=["детекция людей", "присутствие", "отсутствие", "нахождение в зоне"],
    )
    for source in default_sources()
]

DETECTION_CAPABILITIES: list[DetectionCapability] = [
    DetectionCapability(
        id="people-bbox",
        title="Детекция людей в кадре",
        readiness="demo_ready",
        confidence=0.86,
        what_it_checks="Обнаруживает людей и сохраняет ограничивающие рамки для каждой камеры.",
        evidence=["bbox", "camera_id", "confidence", "timestamp"],
        current_limitations="Точность зависит от угла камеры, расстояния, освещения и доступности модели YOLO.",
        tz_mapping="Недели 2–4: детекция и трекинг в каждом потоке.",
    ),
    DetectionCapability(
        id="employee-absence",
        title="Присутствие и отсутствие сотрудника",
        readiness="heuristic_ready",
        confidence=0.78,
        what_it_checks="Отслеживает, присутствует ли человек в настроенных рабочих зонах дольше порогового времени.",
        evidence=["first_seen", "last_seen", "zone", "threshold"],
        current_limitations="В MVP нет распознавания личности; сотрудник определяется по зоне камеры и визуальным правилам.",
        tz_mapping="Недели 4–6: оповещения о первом/последнем появлении и отсутствии.",
    ),
    DetectionCapability(
        id="shelf-dwell",
        title="Долгое нахождение у полки",
        readiness="heuristic_ready",
        confidence=0.68,
        what_it_checks="Фиксирует, если человек находится в зоне полок дольше настроенного порога.",
        evidence=["track_id", "zone", "dwell_seconds", "snapshot"],
        current_limitations="Требуется подтверждение оператора; это кандидат на подозрение, а не доказательство.",
        tz_mapping="Недели 8–10: простые эвристики подозрительного поведения.",
    ),
    DetectionCapability(
        id="multi-camera-check",
        title="Кросс-камерная проверка",
        readiness="pilot_needed",
        confidence=0.46,
        what_it_checks="Проверяет, зафиксировала ли другая камера на той же локации связанное событие в близком временном окне.",
        evidence=["camera_id", "location", "timestamp_window", "event_type"],
        current_limitations="В MVP нет повторной идентификации людей между камерами.",
        tz_mapping="Недели 10–12: проверка вторым ракурсом без смешивания личностей.",
    ),
]
