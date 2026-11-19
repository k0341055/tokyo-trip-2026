#!/usr/bin/env bash
# trip.html（頁面原稿，不進 git）→ site-plain.html（完整頁面，不進 git）→ index.html（加密後，給 GitHub Pages）
# 密碼放在 .trip-password（不進 git）；或用環境變數 TRIP_PASSWORD 指定。
set -euo pipefail
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="robots" content="noindex,nofollow">\n'
  printf '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%%}[hidden]{display:none!important}</style>\n</head>\n<body>\n'
  cat trip.html
  printf '\n</body>\n</html>\n'
} > site-plain.html
node encrypt.mjs site-plain.html index.html
