#!/bin/bash
# scripts/cron/prep_unitbox_growth_12h.sh
# Every-12h loop: 5 fetches + push 100 + write report
# Cron: 0 0,12 * * * (00:00 + 12:00 GMT+8 = 04:00 + 16:00 UTC quota reset)
# Triggered by launchd plist ~/Library/LaunchAgents/com.chengsan.unitbox-growth-ops.plist

set -uo pipefail

# Make node available — launchd does NOT inherit shell PATH / nvm.
# Resolve the latest node installed via nvm (robust across version upgrades).
export NVM_DIR="$HOME/.nvm"
NODE_BIN=$(ls -1d "$NVM_DIR"/versions/node/*/bin 2>/dev/null | tail -1)
[ -n "$NODE_BIN" ] && export PATH="$NODE_BIN:$PATH"

ROOT=/Users/vincent/work/experimental/unit-now
DATE=$(date +%Y-%m-%d)
TS=$(date +%H:%M:%S)
LOG=/Users/vincent/work/experimental/unit-now/.observe/${DATE}/loop-${TS}.log
mkdir -p "$(dirname "$LOG")"

cd "$ROOT" || exit 1
echo "[$(date +%H:%M:%S)] 12h loop start" >> "$LOG"

# 1. observe.sh (status + sitemap + 4 fetchers)
echo "[$(date +%H:%M:%S)] running observe.sh" >> "$LOG"
bash scripts/cron/observe.sh >> "$LOG" 2>&1 || echo "[observe.sh] failed" >> "$LOG"

# 2. fetch-gsc.mjs (GSC search analytics 14d)
echo "[$(date +%H:%M:%S)] running fetch-gsc.mjs" >> "$LOG"
node scripts/fetch-gsc.mjs --date="$DATE" >> "$LOG" 2>&1 || echo "[fetch-gsc.mjs] failed" >> "$LOG"

# 2b. fetch-gsc-sitemaps.mjs (GSC sitemaps · submitted vs indexed count → index inflection tracker)
echo "[$(date +%H:%M:%S)] running fetch-gsc-sitemaps.mjs" >> "$LOG"
node scripts/fetch-gsc-sitemaps.mjs --date="$DATE" >> "$LOG" 2>&1 || echo "[fetch-gsc-sitemaps.mjs] failed" >> "$LOG"

# 3. fetch-cf.mjs (CF Zone Analytics 14d)
echo "[$(date +%H:%M:%S)] running fetch-cf.mjs" >> "$LOG"
node scripts/fetch-cf.mjs --date="$DATE" >> "$LOG" 2>&1 || echo "[fetch-cf.mjs] failed" >> "$LOG"

# 4. fetch-indexing.mjs (push 100 URL to GSC Indexing API)
# Skipped if already pushed in last 12h (quota: 200/day)
echo "[$(date +%H:%M:%S)] running fetch-indexing.mjs (push 100 URL)" >> "$LOG"
node scripts/fetch-indexing.mjs --sitemap dist/sitemap-0.xml --limit 100 >> "$LOG" 2>&1 || echo "[fetch-indexing.mjs] failed" >> "$LOG"

# 5. POST IndexNow 100 URL
echo "[$(date +%H:%M:%S)] POST IndexNow 100 URL" >> "$LOG"
SITEMAP=$ROOT/dist/sitemap-0.xml
URLS=$(python3 -c "
import re
with open('$SITEMAP') as f: xml = f.read()
urls = re.findall(r'<loc>([^<]+)</loc>', xml)
print('\n'.join(urls[:100]))
")
URL_LIST_JSON=$(echo "$URLS" | python3 -c "import sys,json; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))")
KEY="7C26F6F4-B87D-41D5-AC42-A7C48995714F"
curl -sw "\nHTTP: %{http_code}\n" -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"unitbox.online\",\"key\":\"$KEY\",\"keyLocation\":\"https://unitbox.online/.well-known/indexnow-7C26F6F4B87D41D5AC42A7C48995714F.txt\",\"urlList\":$URL_LIST_JSON}" >> "$LOG" 2>&1

# 6. fetch-bing.mjs (Bing WMT URL Submission API · 10000/month quota)
#    Skipped silently if .cf/bing-wmt-key missing (B12-2 pending)
if [ -f "$ROOT/.cf/bing-wmt-key" ] || [ -n "${BING_WMT_API_KEY:-}" ]; then
  echo "[$(date +%H:%M:%S)] running fetch-bing.mjs" >> "$LOG"
  node scripts/fetch-bing.mjs --sitemap dist/sitemap-0.xml --limit 100 >> "$LOG" 2>&1 || echo "[fetch-bing.mjs] failed" >> "$LOG"
fi

# 6b. fetch-bing-stats.mjs (Bing WMT GetUrlInfo · rolling slice for URL-level crawl status)
#     120 URLs/run × 2/day → full 3424-URL coverage every ~14d. ~60s runtime.
#     Skipped silently if .cf/bing-wmt-key missing.
if [ -f "$ROOT/.cf/bing-wmt-key" ] || [ -n "${BING_WMT_API_KEY:-}" ]; then
  echo "[$(date +%H:%M:%S)] running fetch-bing-stats.mjs" >> "$LOG"
  node scripts/fetch-bing-stats.mjs --date="$DATE" >> "$LOG" 2>&1 || echo "[fetch-bing-stats.mjs] failed" >> "$LOG"
fi

# 7. ai-vis.mjs (Perplexity/OpenAI/Anthropic 3-day rotation · 1 engine/day)
#    Skipped silently if no key for today's engine
echo "[$(date +%H:%M:%S)] running ai-vis.mjs" >> "$LOG"
node scripts/ai-vis.mjs --date="$DATE" >> "$LOG" 2>&1 || echo "[ai-vis.mjs] failed" >> "$LOG"

# 8. diff vs yesterday
echo "[$(date +%H:%M:%S)] running diff.mjs" >> "$LOG"
node scripts/diff.mjs >> "$LOG" 2>&1 || echo "[diff.mjs] failed" >> "$LOG"

echo "[$(date +%H:%M:%S)] 12h loop done" >> "$LOG"
echo "log: $LOG"

# 9. send feishu 1-line summary (build msg from log tail to avoid hardcoded ✅)
#    Bypass silently if openclaw missing in PATH (launchd env)
if command -v openclaw >/dev/null 2>&1; then
  FAIL_COUNT=$(grep -c "\[failed\]" "$LOG" 2>/dev/null || echo 0)
  if [ "$FAIL_COUNT" = "0" ]; then
    MSG="unitbox · ${DATE} 12h loop ✅ observe+gsc+cf+indexing+indexnow+bing+ai-vis+diff done"
  else
    MSG="unitbox · ${DATE} 12h loop ⚠️ ${FAIL_COUNT} step(s) failed · log=$LOG"
  fi
  echo "  send feishu: $MSG"
  openclaw message send --channel feishu --account default --target user:ou_c4bad3acc6a4a315e59a712757f88b59 --message "$MSG" 2>&1 | head -2
else
  echo "  feishu skip: openclaw not in PATH (launchd env) · log=$LOG"
fi
