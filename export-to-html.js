const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Simple markdown to HTML converter
function markdownToHTML(content, title) {
  let html = content;
  
  // Escape HTML
  html = html.replace(/&/g, '&amp;');
  html = html.replace(/</g, '&lt;');
  html = html.replace(/>/g, '&gt;');
  
  // Headers
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>\n');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    h2 { color: #444; margin-top: 30px; }
    h3 { color: #555; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
    pre code { background: none; padding: 0; }
    ul, ol { padding-left: 30px; }
    li { margin: 5px 0; }
    a { color: #0366d6; }
    hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
    .source { background: #f9f9f9; padding: 10px; border-left: 3px solid #0366d6; margin-bottom: 30px; font-size: 0.9em; color: #666; }
  </style>
</head>
<body>
  <div class="source">
    <strong>Source:</strong> GitHub Workspace<br>
    <strong>Imported:</strong> ${new Date().toISOString().split('T')[0]}
  </div>
  ${html}
</body>
</html>`;
}

// File categorization
function categorizeFile(filePath) {
  const lowerPath = filePath.toLowerCase();
  const fileName = path.basename(filePath).toLowerCase();
  
  if (lowerPath.includes('memory/') && fileName.match(/^\d{4}-\d{2}-\d{2}/)) {
    return '05 - Daily Notes & Logs';
  }
  if (lowerPath.includes('research/') || fileName.includes('competitor') || fileName.includes('seo-')) {
    return '01 - Research & Analysis';
  }
  if (fileName.includes('product-spec') || fileName.includes('mvp-spec') || fileName.includes('roadmap')) {
    return '02 - Product Specs & Roadmaps';
  }
  if (['agents.md', 'tools.md', 'user.md', 'soul.md', 'memory.md'].includes(fileName)) {
    return '04 - Project Knowledge';
  }
  if (fileName === 'readme.md' || fileName === 'api.md' || fileName.includes('guide')) {
    return '03 - Guides & Documentation';
  }
  return '03 - Guides & Documentation';
}

function exportToHTML() {
  console.log('🔄 Exporting markdown to HTML...\n');
  
  const exportDir = '/home/node/.openclaw/workspace/google-drive-export';
  
  // Create export directory
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  // Create subfolders
  const folders = [
    '01 - Research & Analysis',
    '02 - Product Specs & Roadmaps',
    '03 - Guides & Documentation',
    '04 - Project Knowledge',
    '05 - Daily Notes & Logs'
  ];
  
  for (const folder of folders) {
    const folderPath = path.join(exportDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }
  
  // Get all markdown files
  const fileList = execSync(
    'find /home/node/.openclaw/workspace -type f -name "*.md" ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/google-drive-export/*"',
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(f => f);
  
  console.log(`Found ${fileList.length} files to export\n`);
  
  // Priority files
  const priorityFiles = [
    'products/slidetheory/PRODUCT-SPEC.md',
    'products/slidetheory/MVP-SPEC.md',
    'products/slidetheory/mvp/build/README.md',
    'products/slidetheory/mvp/build/API.md',
    'products/slidetheory/mvp/build/DEPLOYMENT.md',
    'products/slidetheory/mvp/build/TESTING.md',
    'MEMORY.md', 'HEARTBEAT.md', 'AGENTS.md', 'TOOLS.md', 'USER.md', 'SOUL.md',
  ];
  
  const sortedFiles = fileList.sort((a, b) => {
    const aRel = a.replace('/home/node/.openclaw/workspace/', '');
    const bRel = b.replace('/home/node/.openclaw/workspace/', '');
    const aPriority = priorityFiles.indexOf(aRel);
    const bPriority = priorityFiles.indexOf(bRel);
    if (aPriority !== -1 && bPriority === -1) return -1;
    if (bPriority !== -1 && aPriority === -1) return 1;
    if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
    return 0;
  });
  
  let count = 0;
  const exported = [];
  
  for (const filePath of sortedFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const folderName = categorizeFile(filePath);
      const baseName = path.basename(filePath, '.md');
      const relativePath = filePath.replace('/home/node/.openclaw/workspace/', '');
      const isPriority = priorityFiles.includes(relativePath);
      
      // Create safe filename
      const safeName = baseName.replace(/[^a-zA-Z0-9\-_]/g, '_') + '.html';
      const outputPath = path.join(exportDir, folderName, safeName);
      
      const html = markdownToHTML(content, baseName);
      fs.writeFileSync(outputPath, html);
      
      count++;
      exported.push({
        original: relativePath,
        exported: path.join(folderName, safeName),
        folder: folderName,
        priority: isPriority
      });
      
      const marker = isPriority ? '⭐' : '✓';
      console.log(`${marker} [${count}/${sortedFiles.length}] ${folderName}/${safeName}`);
    } catch (e) {
      console.log(`❌ Error: ${filePath} - ${e.message}`);
    }
  }
  
  // Create index file
  let indexHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OpenClaw Workspace - Google Drive Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; }
    h1 { color: #333; }
    .folder { margin: 30px 0; }
    .folder h2 { color: #0366d6; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    .file-list { list-style: none; padding: 0; }
    .file-list li { padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .file-list a { color: #333; text-decoration: none; }
    .file-list a:hover { color: #0366d6; }
    .priority { color: #ff9800; }
    .meta { color: #666; font-size: 0.9em; margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>📁 OpenClaw Workspace Export</h1>
  <div class="meta">
    <strong>Generated:</strong> ${new Date().toISOString()} <br>
    <strong>Total Files:</strong> ${count} <br>
    <strong>Status:</strong> Ready for upload to Google Drive
  </div>
  <p>These HTML files can be uploaded directly to Google Drive and will open as Google Docs.<br>
     ⭐ = Priority files (SlideTheory focus)</p>
`;
  
  // Group by folder
  const byFolder = {};
  for (const item of exported) {
    if (!byFolder[item.folder]) byFolder[item.folder] = [];
    byFolder[item.folder].push(item);
  }
  
  for (const [folder, files] of Object.entries(byFolder)) {
    indexHTML += `  <div class="folder">\n    <h2>${folder} (${files.length} files)</h2>\n    <ul class="file-list">\n`;
    for (const file of files) {
      const priority = file.priority ? '<span class="priority">⭐</span> ' : '';
      indexHTML += `      <li>${priority}<a href="${file.exported}">${path.basename(file.exported, '.html')}</a> <span style="color:#999">(${file.original})</span></li>\n`;
    }
    indexHTML += `    </ul>\n  </div>\n`;
  }
  
  indexHTML += `</body>\n</html>`;
  fs.writeFileSync(path.join(exportDir, 'index.html'), indexHTML);
  
  console.log('\n========================================');
  console.log('EXPORT COMPLETE');
  console.log('========================================');
  console.log(`\n📁 Export location: ${exportDir}`);
  console.log(`📄 Files exported: ${count}`);
  console.log(`⭐ Priority files: ${exported.filter(f => f.priority).length}`);
  console.log('\nNext steps:');
  console.log('1. Upload the folder contents to Google Drive');
  console.log('2. HTML files will open as Google Docs');
  console.log('3. Or use "File > Open with > Google Docs"');
}

exportToHTML();
