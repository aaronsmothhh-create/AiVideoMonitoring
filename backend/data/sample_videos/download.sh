#!/usr/bin/env bash
# Скачивание демонстрационных видео для камер
# Видео распространяются по Mixkit Free License (можно использовать в демо)
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"

URLS=(
  "https://assets.mixkit.co/videos/4883/4883-720.mp4|people_3.mp4"
  "https://assets.mixkit.co/videos/4880/4880-720.mp4|people_4.mp4"
  "https://assets.mixkit.co/videos/4817/4817-720.mp4|people_5.mp4"
  "https://assets.mixkit.co/videos/4834/4834-720.mp4|people_6.mp4"
  "https://assets.mixkit.co/videos/4867/4867-720.mp4|people_7.mp4"
  "https://assets.mixkit.co/videos/4869/4869-720.mp4|people_8.mp4"
)

for entry in "${URLS[@]}"; do
  url="${entry%%|*}"
  name="${entry##*|}"
  if [ -f "$DIR/$name" ] && [ -s "$DIR/$name" ]; then
    echo "✓ $name уже скачан"
  else
    echo "Скачиваю $name ..."
    curl -sL -o "$DIR/$name" "$url"
    echo "✓ $name готов"
  fi
done

echo "Все видео скачаны в $DIR"
