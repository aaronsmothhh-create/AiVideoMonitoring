# Руководство по развёртыванию

## Docker (рекомендуемый способ)

### Требования
- Docker 20.10+
- Docker Compose v2+
- 2 ГБ свободной оперативной памяти
- 1 ГБ свободного места на диске

### Установка Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Перелогиньтесь или выполните: newgrp docker
```

**Windows/macOS:**
Скачайте [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### Запуск

```bash
git clone https://github.com/aaronsmothhh-create/AiVideoMonitoring.git
cd AiVideoMonitoring
docker compose up --build -d
```

Флаг `-d` запускает в фоновом режиме. Логи:
```bash
docker compose logs -f
```

### Остановка

```bash
docker compose down
```

Для полного удаления данных (включая базу):
```bash
docker compose down -v
```

---

## Настройка для production

### 1. Смените пароли и секреты

Создайте файл `.env` из шаблона:
```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
AI_MONITOR_PASSWORD_ADMIN=ваш_надёжный_пароль
AI_MONITOR_PASSWORD_MANAGER=ваш_надёжный_пароль
AI_MONITOR_PASSWORD_OPERATOR=ваш_надёжный_пароль
AI_MONITOR_JWT_SECRET=ваш_случайный_секрет_минимум_32_символа
```

Обновите `docker-compose.yml` — замените `environment` на:
```yaml
env_file:
  - .env
```

### 2. Настройте Telegram уведомления (опционально)

Добавьте в `.env`:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
TELEGRAM_CHAT_ID=ваш_chat_id
```

### 3. Развёртывание на VPS

```bash
# На сервере
ssh user@your-server.com
git clone https://github.com/aaronsmothhh-create/AiVideoMonitoring.git
cd AiVideoMonitoring
cp .env.example .env
# Отредактируйте .env
nano .env
# Запустите
docker compose up --build -d
```

Приложение будет доступно на `http://your-server.com:8000`.

### 4. Nginx reverse proxy (опционально)

Если нужен доступ на порту 80/443:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Подключение реальных камер

Для подключения IP-камер вместо демо-видео:

1. Отредактируйте `backend/app/defaults.py`
2. Замените `source_type: "video_file"` на `"rtsp"` или `"mjpeg"`
3. Укажите URL камеры в поле `url`

Пример для RTSP:
```python
CameraSource(
    camera_id="cam-entrance",
    source_type="rtsp",
    url="rtsp://admin:password@192.168.1.100:554/stream1",
    enabled=True,
)
```

---

## Устранение неполадок

### Приложение не запускается
```bash
# Проверьте логи
docker compose logs app

# Убедитесь что порт 8000 свободен
lsof -i :8000
```

### YOLO модель не скачивается
```bash
# Скачайте вручную
docker compose exec app python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### Видео не загружаются
```bash
# Скачайте вручную внутри контейнера
docker compose exec app bash data/sample_videos/download.sh
```

### Нехватка памяти
Увеличьте лимит в `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 4G
```
