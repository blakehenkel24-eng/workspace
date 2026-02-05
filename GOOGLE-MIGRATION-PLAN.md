# Google Workspace Migration Plan
**From:** Notion  
**To:** Google Drive + Docs + Sheets + Keep  
**Status:** Ready to implement

---

## Why Google Over Notion
- Better integration with your workflow (Gmail, Calendar)
- Faster loading on mobile
- Native offline access
- No export lock-in (everything is standard files)

---

## Folder Structure

### Root: `Blake's Workspace`
```
📁 01-SLIDETHEORY/           (Primary project - top level)
   📁 01-Product/
      📄 Product Spec (Doc)
      📄 MVP Roadmap (Doc)
      📄 User Feedback (Sheet)
   📁 02-Marketing/
      📄 Content Calendar (Sheet)
      📄 Social Posts (Doc)
      📄 SEO Keywords (Sheet)
   📁 03-Research/
      📄 Competitor Analysis (Doc)
      📄 MBB Slide Research (Doc)
   📁 04-Finance/
      📄 MRR Tracker (Sheet)
      📄 Expenses (Sheet)

📁 02-CLIENT-HAWK/           (Future project)
   📁 01-Product/
   📁 02-Research/

📁 03-PERSONAL/
   📁 Goals-2026/
      📄 Year Goals (Doc)
      📄 Monthly Reviews (Doc)
   📁 Health/
      📄 Workout Log (Sheet)
      📄 Nutrition Tracker (Sheet)
   📁 Learning/
      📄 Book Notes (Doc)
      📄 Course Notes (Folder per course)
   📁 Ideas/
      📄 Brain Dump (Doc)
      📄 Business Ideas (Sheet)

📁 04-WORK/
   📁 Projects/
   📁 PE-Diligence/
   📁 Career/

📁 99-ARCHIVE/               (Old projects, completed)
   📁 2026-Q1/
   📁 Notion-Backup/
```

---

## Migration Steps

### Step 1: Create Folders (5 min)
1. Go to [drive.google.com](https://drive.google.com)
2. Right-click → New Folder → Create structure above
3. Color-code: 
   - 🔴 Red = SLIDETHEORY (urgent)
   - 🟡 Yellow = CLIENT-HAWK
   - 🟢 Green = PERSONAL
   - 🔵 Blue = WORK
   - ⚫ Gray = ARCHIVE

### Step 2: Import Notion Export (10 min)
1. Your `notion-export/` folder has markdown files
2. For each markdown file:
   - Open in text editor
   - Copy content
   - Create new Google Doc
   - Paste (formatting will convert)
3. Move to appropriate Google Drive folder

### Step 3: Set Up Templates (15 min)
**Key Docs to create:**

#### 1. Daily Standup (Doc)
```
Date: ___

## Yesterday
- 

## Today
- 

## Blockers
- 

## Health
- Sleep: ___ hrs
- Gym: Y/N
- Mood: 1-10
```

#### 2. Weekly Review (Doc)
```
Week of: ___

## SlideTheory Progress
- 

## Metrics
- MRR: $___
- Users: ___
- Slides generated: ___

## Learnings
- 

## Next Week Priorities
1. 
2. 
3. 
```

#### 3. Idea Capture (Sheet)
| Date | Idea | Category | Effort | Impact | Status |
|------|------|----------|--------|--------|--------|

#### 4. Content Calendar (Sheet)
| Date | Platform | Topic | Status | Link |
|------|----------|-------|--------|------|

### Step 4: Google Keep Setup (5 min)
1. Install Google Keep app on phone
2. Create labels:
   - 💡 Ideas
   - 📋 Tasks
   - 🔗 Links to save
   - 📝 Quick notes
3. Pin widget to home screen for quick capture

### Step 5: Integrations (5 min)
1. **Chrome extension:** Save to Google Keep (one-click capture)
2. **Mobile:** Drive app + Keep app + Docs app
3. **Desktop:** Drive for Desktop (syncs files)

---

## Quick Reference: Notion → Google

| Notion Feature | Google Equivalent |
|----------------|-------------------|
| Pages | Google Docs |
| Databases | Google Sheets |
| Kanban board | Google Sheets (filter view) |
| Quick capture | Google Keep |
| Wiki/Knowledge base | Google Sites (optional) |
| Templates | Google Docs templates |
| Relations/Rollups | Sheets formulas (VLOOKUP, QUERY) |

---

## Mobile Optimization

### Home Screen Setup
1. **Google Drive widget** → Quick access to SLIDETHEORY folder
2. **Keep widget** → One-tap note capture
3. **Docs shortcut** → New document

### Quick Actions
- Swipe right on Keep note → Archive
- Long press Drive folder → Offline access
- Voice notes in Keep → Auto-transcribed

---

## Automation Ideas (Advanced)

1. **Daily backup:** Zapier → Notion export → Google Drive backup folder
2. **Slack integration:** Save starred messages to Keep
3. **Email to Docs:** Forward important emails to Google Docs
4. **Form to Sheet:** Public form → captures leads to Sheet

---

## Time Estimate
- **Setup:** 30 minutes
- **Migration:** 1-2 hours (can do incrementally)
- **Habit adjustment:** 1 week

---

## Next Steps
1. [ ] Create Google Drive folders (tonight?)
2. [ ] Install mobile apps
3. [ ] Migrate SlideTheory notes first (priority)
4. [ ] Archive Notion export as backup
5. [ ] Set daily/weekly review habit

---

**Need help?** I can create template Google Docs/Sheets content for any of these.
