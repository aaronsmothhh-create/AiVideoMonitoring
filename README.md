# Aegis AI Monitor — Unified Security Intelligence

AI-видеомониторинг MVP с фокусом на торговую розницу (гипермаркеты, супермаркеты, ТЦ).
Прототип демонстрирует контроль присутствия сотрудников, фиксацию событий-кандидатов
у полок и в зоне касс, а также интеграцию с операторским workflow.

## Стек

- **Backend**: FastAPI + SQLite, YOLOv8 (Ultralytics) для детекции людей,
  фоновый worker для захвата кадров с MJPEG/HTTP источников и из локальных
  retail-сцен (синтетические кадры с полками и силуэтами покупателей).
- **Frontend**: React + TypeScript + Vite + Tailwind v3, темная "Aegis AI"
  стилистика с cyan-акцентами, bento-grid лэйаут.

## Структура

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI приложение и API
│   │   ├── stream_capture.py       # Захват кадров с MJPEG и retail-сцен
│   │   ├── analyzer.py             # YOLOv8 детекция людей
│   │   ├── background_worker.py    # Фоновые потоки capture+analysis
│   │   └── retail_scenes.py        # Синтетические супермаркет-кадры
│   ├── pyproject.toml
│   └── poetry.lock
└── frontend/
    ├── src/
    │   ├── App.tsx                 # Aegis AI dashboard
    │   ├── App.css
    │   ├── index.css
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## Запуск

### Backend

```bash
cd backend
poetry install
poetry run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

При первом запуске Ultralytics автоматически скачает веса `yolov8n.pt` (~6 МБ)
в директорию backend/. Фоновые потоки начнут захват кадров с публичных MJPEG
камер и генерацию retail-сцен.

### Authentication

Для доступа к API и дашборду используется простая авторизация по токену.
Доступные учётные данные по умолчанию:

- admin / admin123
- manager / manager123
- operator / operator123

Токен сохраняется в браузере и автоматически передаётся в заголовке `Authorization`.

### Docker

Собрать и запустить приложение в контейнере можно из корня:

```bash
docker compose up --build
```

Сервис будет доступен по адресу `http://localhost:8000`.

Переменные окружения для Docker:

- `AI_MONITORING_DB_PATH`
- `AI_MONITOR_PASSWORD_ADMIN`
- `AI_MONITOR_PASSWORD_OPERATOR`
- `AI_MONITOR_PASSWORD_MANAGER`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

### Production build

```bash
cd frontend
npm run lint
npm run build
```

После `npm run build` backend отдаёт собранный фронт из `frontend/dist` по
адресу `http://localhost:8000/`.

## Камеры

Прототип включает два типа источников:

- **Live MJPEG** — публичные web-камеры (фабрика Buffalo Trace, кампус Purdue,
  и т.п.). Доступность зависит от сетевых условий и SLA внешних источников.
- **Retail scenes** — синтетические супермаркет-кадры, рендерящиеся локально:
  стеллажи, продукты, силуэты покупателей. Идут стабильно, демонстрируют
  YOLO-детекцию людей у полок.

Камеры объединены в bento-grid на главном экране, статус каждой определяется
наличием свежего кадра в кеше и активностью YOLO-анализа.

## Ограничения MVP

- Нет реальной обработки RTSP-потоков с приватных камер — используются
  публичные MJPEG источники и синтетические retail-сцены.
- ML/CV пайплайн ограничен детекцией класса `person` из COCO. Признаки
  типа "рука к телу" и "долгое нахождение у полки" реализованы как
  heuristic-кандидаты, требующие пилотных данных для production.
- SQLite подходит для MVP/демо, для промышленного пилота лучше PostgreSQL.
