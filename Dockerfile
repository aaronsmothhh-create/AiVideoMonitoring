# ---- Stage 1: Build frontend ----
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --ignore-scripts
COPY frontend ./
RUN npm run build

# ---- Stage 2: Backend + serve frontend ----
FROM python:3.12-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        libgl1-mesa-glx \
        libglib2.0-0 \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/pyproject.toml backend/poetry.lock* ./
RUN pip install --no-cache-dir "poetry>=1.8" && \
    poetry config virtualenvs.create false && \
    poetry install --no-root && \
    pip uninstall -y poetry

# Copy backend code
COPY backend/app ./app

# Download sample videos for demo cameras
COPY backend/data ./data
RUN bash data/sample_videos/download.sh

# Copy built frontend
COPY --from=frontend-builder /frontend/dist ./frontend/dist

# Environment
ENV AI_MONITORING_DB_PATH=/app/monitoring.db
ENV AI_MONITOR_YOLO_AUTO_DOWNLOAD=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/healthz || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
