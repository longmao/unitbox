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
# Retry ×3 on transient network failure（2026-08-19：00:01 网络抖动曾全挂，加重试闭环）
echo "[$(date +%H:%M:%S)] running fetch-indexing.mjs (push 100 URL)" >> "$LOG"
for attempt in 1 2 3; do
  if node scripts/fetch-indexing.mjs --sitemap dist/sitemap-0.xml --limit 100 >> "$LOG" 2>&1; then
    echo "[fetch-indexing.mjs] OK (attempt $attempt)" >> "$LOG"
    break
  else
    echo "[fetch-indexing.mjs] FAIL attempt $attempt" >> "$LOG"
    if [ "$attempt" = "3" ]; then
      echo "[fetch-indexing.mjs] failed after 3 attempts" >> "$LOG"
    else
      sleep 30
    fi
  fi
done

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
KEY="7C26F6F4B87D41D5AC42A7C48995714F"
# FIX 2026-08-05: KEY was UUID-with-hyphens (7C26F6F4-B87D-...) but keyLocation file was
# no-hyphens → Bing IndexNow strict-checks {key} == filename at keyLocation → 422.
# Rule: use $KEY for BOTH the key field and the keyLocation filename (root /$KEY.txt).
curl -sw "\nHTTP: %{http_code}\n" -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"unitbox.online\",\"key\":\"$KEY\",\"keyLocation\":\"https://unitbox.online/$KEY.txt\",\"urlList\":$URL_LIST_JSON}" >> "$LOG" 2>&1

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

# 9. send feishu summary + indexed inflection alert（webhook 直发，不依赖 openclaw 在 launchd PATH）
FEISHU_HOOK="https://open.feishu.cn/open-apis/bot/v2/hook/b11c3819-4e9e-4765-82f4-e91a81361b9e"
feishu_send() {
  local msg="$1"
  curl -s -X POST "$FEISHU_HOOK" -H "Content-Type: application/json" \
    -d "{\"msg_type\":\"text\",\"content\":{\"text\":\"$msg\"}}" >/dev/null 2>&1
  echo "  feishu: $msg"
}

FAIL_COUNT=$(grep -c "\[failed\]" "$LOG" 2>/dev/null || echo 0)

# 9a. indexed 拐点检测（summary.indexed 0→N = Google 开始索引的信号，强提醒）
INDEXED=$(node -e "const d=require('$ROOT/.observe/${DATE}/gsc-sitemaps.json');console.log(d.summary?.indexed ?? 0)" 2>/dev/null || echo 0)
if [ -n "$INDEXED" ] && [ "$INDEXED" -gt 0 ] 2>/dev/null; then
  feishu_send "🎯 unitbox indexed 拐点：${INDEXED}/5746（Google 开始索引了！checkpoint: ${DATE}）"
fi

# 9b. 每日摘要（含索引推送结果）
if [ "$FAIL_COUNT" = "0" ]; then
  feishu_send "unitbox · ${DATE} 12h loop ✅ · indexed ${INDEXED}/5746 · observe+gsc+cf+indexing+indexnow+bing+ai-vis+diff done"
else
  feishu_send "unitbox · ${DATE} 12h loop ⚠️ ${FAIL_COUNT} step(s) failed · indexed ${INDEXED}/5746 · log=$LOG"
fi

# 10. Checkpoint deep-checks (2026-08-05 loop · specific-date, runs only in the 12:00 slot)
#     Pure launchd + feishu — does NOT depend on a Claude session being open.
TODAY_MD=$(date +%m-%d)
HOUR_NOW=$(date +%H)
if [ "$TODAY_MD" = "08-12" ] && [ "$HOUR_NOW" -ge 12 ] && [ "$HOUR_NOW" -lt 14 ]; then
  echo "[$(date +%H:%M:%S)] CHECKPOINT 8/12: AI visibility (Perplexity 5q)" >> "$LOG"
  export PERPLEXITY_API_KEY=$(grep -E '^export PERPLEXITY_API_KEY=' "$HOME/.zshrc" 2>/dev/null | sed -E 's/.*="([^"]*)".*/\1/')
  if [ -n "$PERPLEXITY_API_KEY" ]; then
    node scripts/ai-vis.mjs --date="$DATE" --engine=perplexity >> "$LOG" 2>&1 || echo "[ai-vis checkpoint] failed" >> "$LOG"
    HITS=$(node -e "const d=require('./.observe/${DATE}/ai-vis.json');console.log(Array.isArray(d)?d.filter(r=>r.cited).length:'?')" 2>/dev/null)
    if command -v openclaw >/dev/null 2>&1; then
      openclaw message send --channel feishu --account default --target user:ou_c4bad3acc6a4a315e59a712757f88b59 --message "🎯 unitbox 8/12 AI 可见度(Perplexity 5q): cited=${HITS}/5 · 基准 7/31=0/15 · ChatGPT/Gemini 需你手动 web 测(硬约束:代理/stall)" 2>&1 | head -2
    fi
  else
    echo "[checkpoint] PERPLEXITY_API_KEY not found in ~/.zshrc" >> "$LOG"
  fi
fi
if [ "$TODAY_MD" = "08-19" ] && [ "$HOUR_NOW" -ge 12 ] && [ "$HOUR_NOW" -lt 14 ]; then
  echo "[$(date +%H:%M:%S)] CHECKPOINT 8/19: Bing 收录" >> "$LOG"
  LATEST_BS=$(ls -1t .observe/2026-08-*/bing-stats.json 2>/dev/null | head -1)
  if [ -n "$LATEST_BS" ]; then
    BING=$(node -e "const d=require('./${LATEST_BS}');const s=d.summary;console.log('with_content='+s.with_content+' crawled='+s.crawled+' discovered='+s.discovered)" 2>/dev/null)
    if command -v openclaw >/dev/null 2>&1; then
      openclaw message send --channel feishu --account default --target user:ou_c4bad3acc6a4a315e59a712757f88b59 --message "🎯 unitbox 8/19 Bing 收录检查: ${BING} · 基准 8/5=0 · 详见 ${LATEST_BS}" 2>&1 | head -2
    fi
  fi
fi
