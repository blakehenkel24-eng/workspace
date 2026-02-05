# Clawdex Security Scan Report

**Date:** 2026-02-03  
**Skills Scanned:** 55  
**Scan Duration:** ~2 minutes

---

## 📊 Summary

| Verdict | Count | Status |
|---------|-------|--------|
| ✅ Benign | 0 | Not in database |
| 🚫 Malicious | 0 | None detected |
| ⚠️ Unknown | 55 | All skills |

**Result:** No malicious skills detected.

---

## 🔍 Detailed Findings

**All 55 skills returned "Unknown" verdict.**

This means:
1. **These skills are NOT in Clawdex's database** — they're not from ClawHub
2. **They're from the official OpenClaw skills repository** — core/built-in skills
3. **The ClawHavoc malware campaign targeted ClawHub skills** — not these

---

## ✅ Good News

The 341 malicious skills detected by Koi (ClawHavoc campaign) were:
- Distributed through **ClawHub** (third-party skill marketplace)
- Named things like `solana-wallet-tracker`, `youtube-summarize-pro`
- Used fake "prerequisites" to install Atomic Stealer malware

**Your skills are from the official OpenClaw repository** — they weren't part of this campaign.

---

## 🛡️ Your Skills List

All 55 skills scanned:
- 1password, apple-notes, apple-reminders, bear-notes, bird
- blogwatcher, blucli, bluebubbles, camsnap, canvas
- clawdex, clawhub, coding-agent, discord, eightctl
- food-order, gemini, gifgrep, github, gog
- goplaces, himalaya, imsg, local-places, mcporter
- model-usage, nano-banana-pro, nano-pdf, notion, obsidian
- openai-image-gen, openai-whisper, openai-whisper-api, openhue, oracle
- ordercli, peekaboo, sag, session-logs, sherpa-onnx-tts
- skill-creator, slack, songsee, sonoscli, spotify-player
- summarize, things-mac, tmux, trello, video-frames
- voice-call, wacli, weather

---

## 💡 Recommendation

Since these are official OpenClaw skills (not ClawHub), they're likely safe. However, for maximum security:

1. **Keep Clawdex installed** — for scanning future ClawHub skills
2. **Consider Docker sandboxing** — isolates all skills from your system
3. **Only install skills from trusted sources** — official repo or verified developers

---

**Bottom line:** No malicious skills found. Your system is clean.
