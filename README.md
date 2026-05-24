# Aegis AI Monitor — Система ИИ-видеомониторинга

<div align="center">

**AI-видеомониторинг для ритейла с детекцией людей в реальном времени**

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-green)
![React](https://img.shields.io/badge/React-19-61dafb)
![YOLOv8](https://img.shields.io/badge/YOLOv8-ultralytics-purple)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

</div>

---

## Что это

MVP системы ИИ-видеомониторинга для торговой розницы (гипермаркеты, супермаркеты, ТЦ).

**Ключевые возможности:**
- 🎥 **6 видеокамер** с детекцией людей в реальном времени (YOLOv8)
- 🔍 **YOLO детекция** — обнаружение людей с уверенностью 85-96%
- 📊 **Дашборд** — KPI, live-камеры, лента событий, аналитика
- 🔐 **JWT авторизация** — три роли (Админ, Оператор, Руководитель)
- 📱 **Русский интерфейс** — полная русификация UI
- 🐳 **Docker** — запуск одной командой

---

## Быстрый старт (Docker)

```bash
# 1. Склонируйте репозиторий
git clone https://github.com/aaronsmothhh-create/AiVideoMonitoring.git
cd AiVideoMonitoring

# 2. Запустите
docker compose up --build
```

Приложение будет доступно по адресу: **http://localhost:8000**

> ⏱️ Первая сборка займёт 3-5 минут (скачивание зависимостей и видеофайлов).

### Учётные данные для входа

| Логин | Пароль | Роль |
|-------|--------|------|
| admin | admin123 | Администратор |
| manager | manager123 | Руководитель |
| operator | operator123 | Оператор |

---

## Запуск без Docker (для разработки)

### Требования
- Python 3.12+
- Node.js 18+
- npm или yarn

### Backend

```bash
cd backend
pip install poetry
poetry install

# Скачайте демо-видео (≈17 МБ)
bash data/sample_videos/download.sh

# Запустите сервер
cd app
AI_MONITOR_YOLO_AUTO_DOWNLOAD=1 python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

> При первом запуске YOLOv8 автоматически скачает модель `yolov8n.pt` (~6 МБ).

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Frontend будет доступен на **http://localhost:5173**, API на **http://localhost:8000**.

### Production-сборка (один сервер)

```bash
cd frontend && npm run build && cd ..
cd backend/app && python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Backend автоматически отдаёт собранный фронтенд из `frontend/dist/` на **http://localhost:8000**.

---

## Структура проекта

```
AiVideoMonitoring/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI приложение, API эндпоинты
│   │   ├── auth.py              # JWT авторизация, роли, bcrypt
│   │   ├── analyzer.py          # YOLOv8 детекция людей
│   │   ├── camera_runtime.py    # Фоновые потоки захвата кадров
│   │   ├── stream_capture.py    # Чтение кадров из видеофайлов/MJPEG
│   │   ├── db.py                # SQLite база данных
│   │   ├── defaults.py          # Камеры, зоны, capabilities
│   │   ├── models.py            # Pydantic модели данных
│   │   ├── reports.py           # Экспорт PDF/CSV отчётов
│   │   └── telegram.py          # Telegram интеграция
│   ├── data/
│   │   └── sample_videos/
│   │       └── download.sh      # Скрипт загрузки демо-видео
│   ├── pyproject.toml
│   └── poetry.lock
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Главный компонент с роутингом
│   │   ├── api/client.ts        # HTTP клиент с авторизацией
│   │   ├── components/          # 30+ React компонентов
│   │   │   ├── Auth/            # Форма логина
│   │   │   ├── Cameras/         # Карточки камер, live-фид
│   │   │   ├── Dashboard/       # KPI, тренды, capabilities
│   │   │   ├── Events/          # Лента событий, фильтры
│   │   │   └── Layout/          # Sidebar, Header
│   │   ├── pages/               # 5 страниц приложения
│   │   ├── constants/           # Русские лейблы и константы
│   │   ├── types/               # TypeScript типы
│   │   └── utils/               # Хелперы (timeAgo, форматы)
│   ├── package.json
│   └── vite.config.ts
├── Dockerfile                   # Мультистейдж Docker-образ
├── docker-compose.yml           # Запуск одной командой
└── .env.example                 # Шаблон переменных окружения
```

---

## Страницы приложения

### 1. Обзор (Dashboard)
- Hero-блок с описанием системы
- 4 KPI-карточки: активные камеры, открытые события, уверенность ИИ, здоровье смены
- Кластер лив-мониторинга — 6 камер с YOLO детекцией в реальном времени
- Лента последних событий с кнопками подтверждения/отклонения
- Частота событий (тренд-график)
- Возможности детекции (capability cards)
- Активная камера с детальной информацией

### 2. События
- Список всех событий с фильтрацией по камере, типу, статусу и дате
- Карточка события со снимком, анализом признаков и кнопками действий
- Типы событий: появление/отсутствие сотрудника, нахождение у полки, спиной к камере

### 3. Аналитика
- Журнал смены с ключевыми метриками
- Экспорт в PDF/CSV

### 4. Камеры
- Список всех камер с информацией об источнике и поддерживаемых сигналах

### 5. Настройки
- Порог уверенности детекции

---

## Камеры

6 демо-камер с реальными видеопотоками:

| Камера | Локация | Люди | Уверенность YOLO |
|--------|---------|------|------------------|
| Вход — главный зал | Торговый центр / Вход | 1 | 88% |
| Кассовая зона | Супермаркет / Кассы | 1 | 92% |
| Отдел продуктов | Супермаркет / Продукты | 2 | 92%, 89% |
| Рабочее пространство | Офис / Рабочая зона | 1 | 96% |
| Переговорная | Офис / Переговорная | 1 | 85% |
| Коридор — 2 этаж | Офис / Коридор | 1 | 93% |

Видеофайлы загружаются из Mixkit (Free License) скриптом `download.sh`.

---

## API

Все API эндпоинты требуют JWT токен (кроме `/api/auth/login`).

### Авторизация
```
POST /api/auth/login     — Логин, возвращает JWT токен
GET  /api/auth/me        — Текущий пользователь
```

### Камеры
```
GET  /api/cameras                      — Список камер
GET  /api/cameras/{id}/frame           — Текущий кадр (JPEG)
GET  /api/cameras/{id}/detections      — Последние YOLO-детекции
```

### События
```
GET  /api/events                       — Список событий (фильтры через query params)
POST /api/events/{id}/feedback         — Подтвердить/отклонить событие
POST /api/simulate-event               — Симулировать новое событие
```

### Отчёты
```
GET  /api/reports/day.pdf              — PDF отчёт за день
GET  /api/reports/day.csv              — CSV отчёт за день
```

### Системные
```
GET  /healthz                          — Health check
GET  /api/overview                     — Общие метрики
GET  /api/analytics                    — Аналитика смены
GET  /api/settings                     — Настройки детекции
GET  /api/capabilities                 — Возможности системы
```

---

## Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `AI_MONITOR_PASSWORD_ADMIN` | Пароль админа | `admin123` |
| `AI_MONITOR_PASSWORD_MANAGER` | Пароль руководителя | `manager123` |
| `AI_MONITOR_PASSWORD_OPERATOR` | Пароль оператора | `operator123` |
| `AI_MONITOR_JWT_SECRET` | Секрет для JWT токенов | `aegis-dev-secret-change-in-production` |
| `AI_MONITOR_TOKEN_TTL` | Время жизни токена (сек) | `14400` (4 часа) |
| `AI_MONITORING_DB_PATH` | Путь к SQLite базе | `monitoring.db` |
| `AI_MONITOR_CORS_ORIGINS` | Разрешённые CORS origins | `http://localhost:5173,http://localhost:8000` |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота | — |
| `TELEGRAM_CHAT_ID` | ID чата Telegram | — |

---

## Технологический стек

### Backend
- **FastAPI** — асинхронный веб-фреймворк
- **SQLite** — хранение камер, событий, настроек
- **YOLOv8n** (Ultralytics) — детекция людей в кадре
- **OpenCV** — захват и обработка видеокадров
- **PyJWT + bcrypt** — JWT авторизация с хешированием паролей
- **ReportLab** — генерация PDF отчётов
- **SlowAPI** — rate limiting

### Frontend
- **React 19** + TypeScript
- **Vite** — сборка и dev-сервер
- **React Router v6** — клиентская навигация
- **Tailwind CSS v3** — стилизация (тёмная тема, cyan-акценты)
- **Lucide React** — иконки

---

## Ограничения MVP

- Используются демо-видеофайлы вместо реальных RTSP-потоков с камер
- ML/CV ограничен детекцией класса `person` из COCO-датасета
- Признаки «рука к телу» и «долгое нахождение у полки» — эвристики-кандидаты
- SQLite подходит для демо; для production рекомендуется PostgreSQL
- Нет WebSocket (polling кадров каждые 1.5 сек)

---

## Лицензия

Демо-видео распространяются по [Mixkit Free License](https://mixkit.co/license/).
