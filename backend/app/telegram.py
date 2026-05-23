from __future__ import annotations

import json
import os
from typing import Literal
from urllib import request

from models import TelegramButton, TelegramPreview, TelegramTestResponse, VideoEvent


def build_preview(event: VideoEvent) -> TelegramPreview:
    mode: Literal["telegram", "mock"] = "telegram" if os.getenv("TELEGRAM_BOT_TOKEN") and os.getenv("TELEGRAM_CHAT_ID") else "mock"
    return TelegramPreview(
        mode=mode,
        text=(
            f"AI event: {event.title}\n"
            f"Camera: {event.camera_name}\n"
            f"Zone: {event.zone}\n"
            f"Confidence: {round(event.confidence * 100)}%\n"
            f"Time: {event.detected_at}"
        ),
        buttons=[
            TelegramButton(label="Confirm", action="confirmed", callback_data=f"feedback:{event.id}:confirmed"),
            TelegramButton(label="Dismiss", action="dismissed", callback_data=f"feedback:{event.id}:dismissed"),
        ],
    )


def send_message(text: str, event: VideoEvent) -> TelegramTestResponse:
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    preview = build_preview(event)
    if not token or not chat_id:
        return TelegramTestResponse(
            configured=False,
            sent=False,
            mode="mock",
            detail="TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID are not configured.",
            inline_feedback=True,
            preview=preview,
        )
    payload = {
        "chat_id": chat_id,
        "text": text,
        "reply_markup": {
            "inline_keyboard": [[
                {"text": "Confirm", "callback_data": f"feedback:{event.id}:confirmed"},
                {"text": "Dismiss", "callback_data": f"feedback:{event.id}:dismissed"},
            ]]
        },
    }
    req = request.Request(
        url=f"https://api.telegram.org/bot{token}/sendMessage",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=8) as response:
            sent = 200 <= response.status < 300
    except OSError as exc:
        return TelegramTestResponse(
            configured=True,
            sent=False,
            mode="telegram",
            detail=str(exc),
            inline_feedback=True,
            preview=preview,
        )
    return TelegramTestResponse(
        configured=True,
        sent=sent,
        mode="telegram",
        detail="Telegram request completed.",
        inline_feedback=True,
        preview=preview,
    )
