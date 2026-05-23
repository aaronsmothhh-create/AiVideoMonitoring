FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM python:3.12-slim AS backend
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY backend/pyproject.toml backend/poetry.lock* ./
RUN pip install "poetry>=1.8"
RUN poetry config virtualenvs.create false && poetry install --no-root

COPY backend/app ./app
COPY --from=frontend-builder /frontend/dist ./frontend/dist

ENV AI_MONITORING_DB_PATH=/app/monitoring.db
ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
