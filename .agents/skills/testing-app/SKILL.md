---
name: testing-ai-video-monitoring
description: Test the AiVideoMonitoring app end-to-end. Use when verifying UI changes, camera integration, or YOLO detection.
---

# Testing AiVideoMonitoring

## Prerequisites

1. Download sample videos (required for video_file camera sources):
   ```bash
   bash backend/data/sample_videos/download.sh
   ```
   Videos are ~17MB total and stored in `backend/data/sample_videos/`.

2. Delete old database if camera sources changed:
   ```bash
   rm -f backend/monitoring.db
   ```

## Starting the App

1. **Backend** (from `backend/app/` directory):
   ```bash
   cd backend/app
   AI_MONITOR_YOLO_AUTO_DOWNLOAD=1 python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
   ```
   Note: Must run from `backend/app/` not `backend/` due to relative imports.

2. **Frontend** (from `frontend/` directory):
   ```bash
   cd frontend
   npm run dev -- --host 0.0.0.0
   ```
   Runs on http://localhost:5173

3. **Health check:**
   ```bash
   curl http://localhost:8000/healthz
   ```
   Should return `{"status":"ok","runtime_cameras":6}`

## Test Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| manager | manager123 | Manager |
| operator | operator123 | Operator |

## Key Pages to Verify

- **Login** (`/`): Form labels, button text, demo hint
- **Overview** (`/`): KPI cards, live camera grid with YOLO bounding boxes, events sidebar
- **Events** (`/events`): Filter labels, event type names, status labels, action buttons
- **Cameras** (`/cameras`): Camera names, source types, signal labels
- **Analytics** (`/analytics`): Chart labels, export buttons
- **Settings** (`/settings`): Threshold labels

## YOLO Detection Verification

Verify YOLO is running via API:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}' | python3 -c "import json,sys; print(json.load(sys.stdin)['access_token'])")

curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/cameras/cam-entrance-main/detections
```
Should return `person_count > 0` with detection confidence 85-96%.

## Common Issues

- **Backend import error**: Make sure to run uvicorn from `backend/app/` directory, not `backend/`
- **No camera frames**: Ensure sample videos are downloaded via `download.sh`
- **Old cameras showing**: Delete `monitoring.db` and restart backend to pick up new camera sources
- **Chrome autofill on login**: The login form reads values from DOM via `form.elements.namedItem()` to handle Chrome autofill correctly
- **Frontend build errors**: If adding new source types, update both `backend/app/models.py` (SourceType Literal) AND `frontend/src/types/index.ts` (SourceType union)

## Devin Secrets Needed

No secrets required — the app runs fully locally with hardcoded dev credentials.
