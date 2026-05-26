FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM python:3.12-slim AS backend
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Install CPU-only PyTorch first (saves ~1.5GB vs CUDA version)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

COPY backend/pyproject.toml ./
RUN pip install --no-cache-dir "poetry>=1.8"
# Skip lock file to avoid reinstalling CUDA torch over CPU version
RUN poetry config virtualenvs.create false && poetry install --no-root --no-lock

COPY backend/app ./app
COPY backend/data ./data
COPY --from=frontend-builder /frontend/dist ./frontend/dist

ENV AI_MONITORING_DB_PATH=/app/monitoring.db
ENV FRONTEND_DIST=/app/frontend/dist
ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
