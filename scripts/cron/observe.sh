#!/bin/bash
# scripts/cron/observe.sh
# unitbox 增长观测 · 每日 22:00 由 Hermes gateway 触发 (HERMES_TOPIC=unitbox-growth-ops)
#
# 输出：.observe/{date}/  下 status.tsv / gsc.json / ai-vis.json / mentions.json / diff.json
# Exit: 0 = 全 OK · 1 = 任一 source 失败但 snapshot 已写入
#
# Usage:
#   bash scripts/cron/observe.sh
#   bash scripts/cron/observe.sh --dry-run   # skip network, just structure check

set -uo pipefail
DATE=$(date -u +%Y-%m-%d)
ROOT="/Users/vincent/work/experimental/unit-now"
OUT="$ROOT/.observe/$DATE"

if [[ "${1:-}" == "--dry-run" ]]; then
  echo "[observe] dry-run · would write to $OUT"
  mkdir -p "$OUT"
  exit 0
fi

mkdir -p "$OUT"
FAIL=0

# A · 基建 10 endpoint
{
  for p in /llms.txt /llms.en.txt /llms.zh-hant.txt /llms.zh-hans.txt /llms.ja.txt /llms.ko.txt \
           /openapi.json /openapi.en.json /openapi.zh-hant.json /openapi.zh-hans.json /openapi.ja.json /openapi.ko.json \
           /robots.txt /sitemap-index.xml; do
    curl -fsS -o "$OUT/$(echo "$p" | tr / _).body" \
      -w "%{http_code}\t%{url_effective}\n" \
      "https://unitbox.online$p" 2>/dev/null || echo "000\thttps://unitbox.online$p"
  done
} > "$OUT/status.tsv" || FAIL=1

# B · GSC
node "$ROOT/scripts/fetch-gsc.mjs" --date="$DATE" >> "$OUT/gsc.log" 2>&1 || FAIL=1

# C · AI visibility（每日 1 engine × 5 query，3 日轮询 3 engine）
node "$ROOT/scripts/ai-vis.mjs" --date="$DATE" >> "$OUT/ai-vis.log" 2>&1 || FAIL=1

# D · 社交/外链提及（step 1.5 启用，先 stub）
node "$ROOT/scripts/mentions.mjs" --date="$DATE" >> "$OUT/mentions.log" 2>&1 || true

# E · Diff vs 昨日
YEST="$ROOT/.observe/$(date -u -v-1d +%Y-%m-%d 2>/dev/null || date -u -d 'yesterday' +%Y-%m-%d)"
node "$ROOT/scripts/diff.mjs" --today="$OUT" --yesterday="$YEST" \
  > "$OUT/diff.json" >> "$OUT/diff.log" 2>&1 || FAIL=1

if [ $FAIL -ne 0 ]; then
  echo "[observe] partial failure · see $OUT/*.log" >&2
else
  echo "[observe] OK · snapshot at $OUT"
fi
exit $FAIL