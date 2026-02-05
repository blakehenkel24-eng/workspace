# SlideTheory Troubleshooting FAQ

## General Issues

### Q: Server won't start

**Symptoms:** `npm start` fails with error

**Solutions:**
1. Check Node.js version: `node --version` (need 18+)
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check port availability: `lsof -i :3000`
4. Review error logs for specific issue

---

### Q: "Cannot find module" error

**Symptoms:** Error about missing module

**Solutions:**
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install

# Install specific missing module
npm install [module-name]
```

---

### Q: Port already in use

**Symptoms:** `EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
PORT=3001 npm start

# Option 3: Add to .env
echo "PORT=3001" >> .env
```

---

## Export Issues

### Q: PPTX export fails

**Symptoms:** Error generating PowerPoint file

**Solutions:**
1. Verify pptxgenjs is installed: `npm ls pptxgenjs`
2. Check content structure matches API.md format
3. Ensure temp directory exists: `mkdir -p tmp/exports`
4. Check disk space: `df -h`

---

### Q: PDF export fails or times out

**Symptoms:** PDF generation hangs or errors

**Solutions:**
1. **Install Chromium dependencies (Ubuntu/Debian):**
   ```bash
   sudo apt-get update
   sudo apt-get install -y libnss3 libatk-bridge2.0-0 libxss1 libgtk-3-0
   ```

2. **Use system Chrome:**
   ```bash
   export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
   npm install
   ```

3. **Increase timeout:** Edit server.js and add timeout option to puppeteer.launch()

4. **Check memory:** PDF generation needs ~500MB RAM

---

### Q: PNG generation shows placeholder instead of slide

**Symptoms:** Slide image shows "Install Chromium for full image rendering"

**Solutions:**
1. This is the fallback mode - app still works
2. For full rendering, install Chromium dependencies (see PDF section)
3. The SVG fallback is valid for many use cases

---

## Content Generation Issues

### Q: AI content generation fails

**Symptoms:** "Generation Failed" error or generic content

**Solutions:**
1. **Check API key:**
   ```bash
   echo $KIMI_API_KEY
   cat .env | grep KIMI
   ```

2. **Verify API key is valid:** Test with curl:
   ```bash
   curl https://api.moonshot.cn/v1/models \
     -H "Authorization: Bearer $KIMI_API_KEY"
   ```

3. **App works without API key** - uses fallback content generation

---

### Q: Generated content doesn't match context

**Symptoms:** AI produces irrelevant or generic content

**Solutions:**
1. Make context more specific (aim for 100-300 characters)
2. Include specific data points
3. Specify target audience clearly
4. Try a different framework

---

## Frontend Issues

### Q: Templates don't load

**Symptoms:** Template buttons don't populate form

**Solutions:**
1. Check browser console for errors
2. Verify templates exist: `ls public/templates/`
3. Check API responds: `curl http://localhost:3000/api/templates`
4. Hard refresh browser: `Ctrl+Shift+R`

---

### Q: Download buttons don't work

**Symptoms:** Clicking download does nothing

**Solutions:**
1. **Generate slide first** - downloads need content
2. Check browser console for JavaScript errors
3. Verify file was created: `ls tmp/exports/`
4. Check browser download settings/pop-up blockers

---

### Q: Slide preview doesn't appear

**Symptoms:** Generated but no image shown

**Solutions:**
1. Wait for generation to complete (can take 5-10 seconds)
2. Check network tab for failed image requests
3. Verify slide file exists: `ls tmp/slides/`
4. Check file permissions on tmp directory

---

## Performance Issues

### Q: PDF export is very slow

**Symptoms:** Takes 30+ seconds

**Solutions:**
1. **Normal behavior:** PDF generation with Puppeteer takes 5-15 seconds
2. **First request slower:** Chromium needs to launch
3. **Consider:** Pre-warming Puppeteer (advanced)
4. **Alternative:** Use PPTX export (faster)

---

### Q: Server becomes unresponsive

**Symptoms:** Requests hang, high CPU/memory

**Solutions:**
1. **Check resource usage:**
   ```bash
   top
   free -h
   df -h
   ```

2. **Restart server:**
   ```bash
   npm run pm2:restart
   ```

3. **Limit concurrent PDF generations** (implement queue)

4. **Add swap space** if memory constrained

---

## Template Issues

### Q: Custom templates don't appear

**Symptoms:** New template files not showing

**Solutions:**
1. Add to `public/templates/index.json`
2. File must be valid JSON
3. Restart server: `npm run pm2:restart`
4. Check browser cache: hard refresh

---

## Environment-Specific Issues

### macOS

**Puppeteer/Chromium issues:**
```bash
# May need to install Xcode command line tools
xcode-select --install

# Or use system Chrome
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

### Windows

**Path issues:**
- Use Git Bash or PowerShell
- Paths in .env should use forward slashes or escaped backslashes

**Chromium download fails:**
```powershell
# Set environment variable
$env:PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
npm install
```

### Linux (Ubuntu/Debian)

**Missing shared libraries:**
```bash
sudo apt-get update
sudo apt-get install -y \
  libnss3 \
  libatk-bridge2.0-0 \
  libxss1 \
  libgtk-3-0 \
  libgbm1 \
  libasound2
```

---

## Debugging Tips

### Enable Verbose Logging

Edit server.js:
```javascript
// Add at top
const DEBUG = process.env.DEBUG === 'true';

// Add logging
if (DEBUG) console.log('[DEBUG]', ...);
```

Run with: `DEBUG=true npm start`

### Check Logs

```bash
# PM2 logs
pm2 logs slidetheory

# Or direct
npm start 2>&1 | tee server.log
```

### Test API Directly

```bash
# Health check
curl http://localhost:3000/api/health

# Templates
curl http://localhost:3000/api/templates

# Generate (minimal)
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"slideType":"Executive Summary","context":"Test context for debugging","targetAudience":"C-Suite"}'
```

---

## Getting Help

If issue persists:

1. Check API.md for correct request format
2. Review DEPLOYMENT.md for setup issues
3. Check TESTING.md for verification steps
4. Include in bug report:
   - Node version: `node --version`
   - OS version
   - Error message (full stack trace)
   - Steps to reproduce
