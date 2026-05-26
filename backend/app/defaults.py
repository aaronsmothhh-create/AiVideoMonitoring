from __future__ import annotations

from models import CameraSource, DetectionCapability, MonitoringSettings, PublicVideoSource, Zone

DEFAULT_SETTINGS = MonitoringSettings()


def default_sources() -> list[CameraSource]:
    return [
        CameraSource(
            id="cam-hypermarket-frozen",
            name="Гипермаркет — Холодильный отдел",
            location="Гипермаркет / Замороженные продукты",
            url="data/sample_videos/people_3.mp4",
            source_type="video_file",
            fps_limit=8,
            zones=[
                Zone(id="zone-hyp-frozen-shelf", name="Frozen shelves", kind="shelf"),
                Zone(id="zone-hyp-frozen-aisle", name="Aisle work area", kind="work_area"),
            ],
        ),
        CameraSource(
            id="cam-supermarket-produce",
            name="Супермаркет — Свежие продукты",
            location="Супермаркет / Овощи и фрукты",
            url="data/sample_videos/people_4.mp4",
            source_type="video_file",
            fps_limit=8,
            zones=[
                Zone(id="zone-sm-produce-display", name="Produce display", kind="shelf"),
                Zone(id="zone-sm-produce-aisle", name="Produce aisle", kind="work_area"),
            ],
        ),
        CameraSource(
            id="cam-supermarket-beverage",
            name="Супермаркет — Напитки",
            location="Супермаркет / Напитки",
            url="data/sample_videos/people_5.mp4",
            source_type="video_file",
            fps_limit=8,
            zones=[
                Zone(id="zone-sm-bev-shelf", name="Beverage shelves", kind="shelf"),
                Zone(id="zone-sm-bev-aisle", name="Beverage aisle", kind="work_area"),
            ],
        ),
        CameraSource(
            id="cam-supermarket-checkout",
            name="Супермаркет — Кассовая зона",
            location="Супермаркет / Кассы",
            url="data/sample_videos/people_6.mp4",
            source_type="video_file",
            fps_limit=8,
            zones=[
                Zone(id="zone-sm-checkout-desks", name="Checkout desks", kind="checkout"),
                Zone(id="zone-sm-checkout-queue", name="Queue area", kind="work_area"),
            ],
        ),
        CameraSource(
            id="cam-warehouse-stock",
            name="Склад — Стеллажи",
            location="Склад / Хранение",
            url="data/sample_videos/people_7.mp4",
            source_type="video_file",
            fps_limit=8,
            zones=[
                Zone(id="zone-warehouse-racks", name="Storage racks", kind="stock"),
                Zone(id="zone-warehouse-aisle", name="Warehouse aisle", kind="work_area"),
            ],
        ),
        CameraSource(
            id="cam-mall-entrance",
            name="ТЦ — Главный вход",
            location="Торговый центр / Вход",
            url="data/sample_videos/people_8.mp4",
            source_type="video_file",
            fps_limit=8,
            zones=[
                Zone(id="zone-mall-entry", name="Entrance doors", kind="entrance"),
                Zone(id="zone-mall-security", name="Security post", kind="work_area"),
            ],
        ),
        CameraSource(
            id="cam-buffalo-trace",
            name="Buffalo Trace Factory - Public MJPEG",
            location="Public live camera fallback",
            url="http://camera.buffalotrace.com/mjpg/video.mjpg",
            source_type="live_mjpeg",
            enabled=False,
            fps_limit=2,
            zones=[
                Zone(id="zone-bt-area", name="Production area", kind="work_area"),
                Zone(id="zone-bt-entrance", name="Entrance", kind="entrance"),
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
        license_note="Local synthetic scene or operator-configured stream.",
        supported_signals=["person detection", "presence", "absence", "zone dwell"],
    )
    for source in default_sources()
]

DETECTION_CAPABILITIES: list[DetectionCapability] = [
    DetectionCapability(
        id="people-bbox",
        title="Person detection in frame",
        readiness="demo_ready",
        confidence=0.86,
        what_it_checks="Detects people and stores bounding boxes per camera.",
        evidence=["bbox", "camera_id", "confidence", "timestamp"],
        current_limitations="Accuracy depends on camera angle, distance, lighting and local YOLO model availability.",
        tz_mapping="Weeks 2-4: detection and tracking inside every stream.",
    ),
    DetectionCapability(
        id="employee-absence",
        title="Employee presence and absence",
        readiness="heuristic_ready",
        confidence=0.78,
        what_it_checks="Tracks whether a person is present in configured work zones longer than threshold windows.",
        evidence=["first_seen", "last_seen", "zone", "threshold"],
        current_limitations="No exact identity recognition in MVP; employee is inferred from camera zone and visual rules.",
        tz_mapping="Weeks 4-6: first/last appearance and absence alerts.",
    ),
    DetectionCapability(
        id="shelf-dwell",
        title="Long dwell near shelf",
        readiness="heuristic_ready",
        confidence=0.68,
        what_it_checks="Flags a person staying in shelf zones for longer than configured dwell seconds.",
        evidence=["track_id", "zone", "dwell_seconds", "snapshot"],
        current_limitations="Operator confirmation is required; this is a risk candidate, not proof.",
        tz_mapping="Weeks 8-10: simple suspicious-behavior heuristics.",
    ),
    DetectionCapability(
        id="multi-camera-check",
        title="Cross-camera scene check",
        readiness="pilot_needed",
        confidence=0.46,
        what_it_checks="Checks whether another camera in the same location reports a related event in a close time window.",
        evidence=["camera_id", "location", "timestamp_window", "event_type"],
        current_limitations="No person re-identification between cameras in MVP.",
        tz_mapping="Weeks 10-12: second-angle validation without cross-camera identity mixing.",
    ),
]
