# Архитектура системы Aegis AI Monitor

## Общая схема

```
┌──────────────────────────────────────────────────────┐
│                    Клиент (Браузер)                   │
│   React 19 + TypeScript + Tailwind + React Router    │
│   Порт: 5173 (dev) / 8000 (production)              │
└─────────────────────┬────────────────────────────────┘
                      │ HTTP / REST API
                      │ JWT Bearer Token
┌─────────────────────▼────────────────────────────────┐
│                  FastAPI Backend                      │
│                  Порт: 8000                           │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Auth     │  │ API      │  │ Static Files     │   │
│  │ (JWT)    │  │ Routes   │  │ (frontend/dist)  │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │           Camera Runtime (фоновые потоки)     │    │
│  │  ┌────────────┐  ┌────────────┐              │    │
│  │  │ Capture    │  │ Analyzer   │              │    │
│  │  │ (OpenCV)   │→ │ (YOLOv8n)  │→ FrameCache │    │
│  │  └────────────┘  └────────────┘              │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ SQLite   │  │ Reports  │  │ Telegram         │   │
│  │ DB       │  │ PDF/CSV  │  │ Notifications    │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## Backend

### Точка входа: `main.py`

FastAPI приложение с lifespan-менеджером:
- При старте: инициализация БД (`init_db()`) + запуск потоков камер (`runtime.start()`)
- При остановке: остановка потоков (`runtime.stop()`)

API-маршруты:
- `/api/auth/*` — авторизация
- `/api/cameras/*` — камеры и кадры
- `/api/events/*` — события
- `/api/overview`, `/api/analytics` — метрики
- `/api/reports/*` — PDF/CSV
- `/`, `/{path}` — отдача фронтенда

### Авторизация: `auth.py`

- **JWT** токены с настраиваемым TTL (по умолчанию 4 часа)
- **bcrypt** хеширование паролей
- 3 роли: `admin`, `manager`, `operator`
- Middleware проверяет токен на всех `/api/` путях (кроме login)
- Rate limiting на `/api/auth/login` (5 попыток/минута)

### Камеры: `camera_runtime.py` + `stream_capture.py`

**CameraRuntime** запускает по одному фоновому потоку на камеру:
1. Поток читает кадры из видеофайла (OpenCV `VideoCapture`)
2. Кадр передаётся в `Analyzer` (YOLO детекция)
3. Результат (JPEG + bounding boxes) сохраняется в `FrameCache`
4. Интервал между кадрами: ~1.5 секунды

**Типы источников:**
- `video_file` — MP4 файл с циклическим воспроизведением
- `mjpeg` — HTTP MJPEG поток
- `demo_video` / `retail_scene` — синтетические источники (legacy)

### Детекция: `analyzer.py`

- Модель: **YOLOv8n** (Ultralytics, ~6 МБ)
- Класс: `person` (id=0 в COCO)
- Порог уверенности: настраивается через API
- Результат: bounding boxes с confidence score
- Вывод: JPEG кадр с нарисованными рамками

### База данных: `db.py`

SQLite с таблицами:
- `cameras` — список камер (id, name, location, source, status)
- `events` — события детекции (тип, камера, severity, confidence)
- `event_tracks` — треки объектов в событии
- `settings` — настройки системы (пороги детекции)
- `camera_sources` — источники камер

### Отчёты: `reports.py`

- PDF генерация через ReportLab
- CSV экспорт событий
- Фильтрация по дате

---

## Frontend

### Архитектура

React SPA с модульной структурой компонентов:

```
src/
├── App.tsx              # Корневой компонент + React Router
├── api/client.ts        # Axios-подобный HTTP клиент с JWT
├── components/
│   ├── Auth/
│   │   └── LoginForm    # Страница входа
│   ├── Layout/
│   │   ├── Sidebar      # Навигация + логаут
│   │   └── Header       # Заголовок страницы
│   ├── Dashboard/
│   │   ├── KpiCard      # Метрика с иконкой
│   │   ├── CapabilityCard # Возможности детекции
│   │   ├── TrendCard    # График трендов
│   │   └── ...          # Hero, Reports, Telegram
│   ├── Cameras/
│   │   ├── CameraFeedCard   # Live кадр с камеры
│   │   └── ActiveCameraCard # Подробная карточка камеры
│   └── Events/
│       ├── EventLogRow      # Строка события
│       └── EventDetailCard  # Детали события
├── pages/
│   ├── OverviewPage     # Обзор (дашборд)
│   ├── EventsPage       # Список событий
│   ├── AnalyticsPage    # Аналитика
│   ├── CamerasPage      # Все камеры
│   └── SettingsPage     # Настройки
├── constants/           # Русские лейблы
├── types/               # TypeScript типы
└── utils/               # Хелперы
```

### Маршрутизация

React Router v6:
- `/login` — страница входа
- `/` или `/overview` — дашборд
- `/events` — события
- `/analytics` — аналитика
- `/cameras` — камеры
- `/settings` — настройки

Все маршруты (кроме `/login`) защищены проверкой JWT токена.

### Получение кадров

Frontend polling (каждые 1.5 сек):
```
GET /api/cameras/{id}/frame → JPEG image
```

Кадр отображается в `<img>` с автообновлением через `setInterval`.

---

## Docker

### Multi-stage сборка

1. **Stage 1** (`frontend-builder`): Node.js 20 → `npm run build` → `/frontend/dist`
2. **Stage 2** (`backend`): Python 3.12 → poetry install → copy app + frontend dist + videos

### Порты
- `8000` — единственный порт (backend отдаёт и API, и frontend)

### Volumes
- `db_data` — SQLite база данных (сохраняется между перезапусками)

---

## Потоки данных

### Авторизация
```
Браузер → POST /api/auth/login (username, password)
         ← JWT token
Браузер → GET /api/* (Authorization: Bearer <token>)
         ← Данные
```

### Видеопоток
```
VideoFile → OpenCV → YOLO → FrameCache → GET /api/cameras/{id}/frame → <img>
  (MP4)    (кадр)   (bbox)   (JPEG)       (HTTP)                       (UI)
```

### События
```
YOLO детекция → confidence > threshold → Create Event → DB
                                          ↓
                                    Telegram (если настроен)
                                          ↓
                                    GET /api/events → UI
```
