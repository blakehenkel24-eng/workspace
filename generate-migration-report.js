const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Folder structure mapping
const FOLDER_STRUCTURE = {
  '01 - Research & Analysis': [],
  '02 - Product Specs & Roadmaps': [],
  '03 - Guides & Documentation': [],
  '04 - Project Knowledge': [],
  '05 - Daily Notes & Logs': []
};

// File categorization rules
function categorizeFile(filePath, content) {
  const lowerPath = filePath.toLowerCase();
  const fileName = path.basename(filePath).toLowerCase();
  
  // Daily notes
  if (lowerPath.includes('memory/') && fileName.match(/^\d{4}-\d{2}-\d{2}/)) {
    return '05 - Daily Notes & Logs';
  }
  
  // Research files
  if (lowerPath.includes('research/') || 
      fileName.includes('competitor') || 
      fileName.includes('seo-') ||
      fileName.includes('content-strategy')) {
    return '01 - Research & Analysis';
  }
  
  // Product specs and roadmaps
  if (fileName.includes('product-spec') || 
      fileName.includes('mvp-spec') || 
      fileName.includes('future-spec') ||
      fileName.includes('spec.md') ||
      fileName.includes('roadmap') ||
      fileName.includes('changelog') ||
      fileName.includes('completion') ||
      fileName.includes('phase')) {
    return '02 - Product Specs & Roadmaps';
  }
  
  // Knowledge base files
  if (fileName === 'agents.md' || 
      fileName === 'tools.md' || 
      fileName === 'user.md' || 
      fileName === 'soul.md' ||
      fileName === 'identity.md' ||
      fileName === 'memory.md' ||
      fileName === 'semantic-memory.md' ||
      fileName === 'skill-inventory.md') {
    return '04 - Project Knowledge';
  }
  
  // Guides and documentation
  if (fileName === 'readme.md' || 
      fileName === 'api.md' || 
      fileName === 'deployment.md' || 
      fileName === 'testing.md' ||
      fileName === 'troubleshooting.md' ||
      fileName.includes('guide') ||
      fileName.includes('howto') ||
      fileName.includes('setup') ||
      lowerPath.includes('master_guide')) {
    return '03 - Guides & Documentation';
  }
  
  // Marketing content
  if (lowerPath.includes('marketing/')) {
    return '01 - Research & Analysis';
  }
  
  // Learnings
  if (lowerPath.includes('.learnings/') || lowerPath.includes('/skills/')) {
    return '04 - Project Knowledge';
  }
  
  // Design docs
  if (lowerPath.includes('/design/')) {
    return '02 - Product Specs & Roadmaps';
  }
  
  // Notion export
  if (lowerPath.includes('notion-export/')) {
    return '04 - Project Knowledge';
  }
  
  // Default to Guides
  return '03 - Guides & Documentation';
}

function generateReport() {
  console.log('📊 Generating migration report...\n');
  
  // Get all markdown files
  const fileList = execSync(
    'find /home/node/.openclaw/workspace -type f -name "*.md" ! -path "*/node_modules/*" ! -path "*/.git/*"',
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(f => f);
  
  const categorized = {
    '01 - Research & Analysis': [],
    '02 - Product Specs & Roadmaps': [],
    '03 - Guides & Documentation': [],
    '04 - Project Knowledge': [],
    '05 - Daily Notes & Logs': []
  };
  
  // Priority files
  const priorityFiles = [
    'products/slidetheory/PRODUCT-SPEC.md',
    'products/slidetheory/MVP-SPEC.md',
    'products/slidetheory/mvp/build/README.md',
    'products/slidetheory/mvp/build/API.md',
    'products/slidetheory/mvp/build/DEPLOYMENT.md',
    'products/slidetheory/mvp/build/TESTING.md',
    'MEMORY.md',
    'HEARTBEAT.md',
    'AGENTS.md',
    'TOOLS.md',
    'USER.md',
    'SOUL.md',
  ];
  
  // Categorize files
  for (const filePath of fileList) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const folderName = categorizeFile(filePath, content);
      const relativePath = filePath.replace('/home/node/.openclaw/workspace/', '');
      const isPriority = priorityFiles.includes(relativePath);
      
      categorized[folderName].push({
        path: relativePath,
        fullPath: filePath,
        size: content.length,
        priority: isPriority
      });
    } catch (e) {
      console.log(`Warning: Could not read ${filePath}`);
    }
  }
  
  // Sort: priority first, then by path
  for (const folder of Object.keys(categorized)) {
    categorized[folder].sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (b.priority && !a.priority) return 1;
      return a.path.localeCompare(b.path);
    });
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: fileList.length,
    status: 'QUOTA_EXCEEDED - Migration pending',
    folderStructure: categorized,
    priorityFiles: priorityFiles,
    summary: {
      '01 - Research & Analysis': categorized['01 - Research & Analysis'].length,
      '02 - Product Specs & Roadmaps': categorized['02 - Product Specs & Roadmaps'].length,
      '03 - Guides & Documentation': categorized['03 - Guides & Documentation'].length,
      '04 - Project Knowledge': categorized['04 - Project Knowledge'].length,
      '05 - Daily Notes & Logs': categorized['05 - Daily Notes & Logs'].length,
    }
  };
  
  // Save JSON report
  fs.writeFileSync('/home/node/.openclaw/workspace/migration-report.json', JSON.stringify(report, null, 2));
  
  // Generate markdown report
  let mdReport = `# Google Drive Migration Report\n\n`;
  mdReport += `**Generated:** ${new Date().toISOString()}\n\n`;
  mdReport += `**Status:** ⚠️ QUOTA EXCEEDED - Migration Pending\n\n`;
  mdReport += `**Total Files:** ${fileList.length}\n\n`;
  
  mdReport += `## Summary\n\n`;
  for (const [folder, count] of Object.entries(report.summary)) {
    mdReport += `- **${folder}:** ${count} files\n`;
  }
  mdReport += `\n`;
  
  mdReport += `## Priority Files\n\n`;
  for (const file of priorityFiles) {
    mdReport += `- [ ] ${file}\n`;
  }
  mdReport += `\n`;
  
  mdReport += `## Folder Structure\n\n`;
  mdReport += `\`\`\`\n`;
  mdReport += `OpenClaw/\n`;
  for (const [folder, files] of Object.entries(categorized)) {
    mdReport += `├── ${folder}/ (${files.length} files)\n`;
    for (const file of files.slice(0, 5)) {
      mdReport += `│   ├── ${path.basename(file.path)}${file.priority ? ' ⭐' : ''}\n`;
    }
    if (files.length > 5) {
      mdReport += `│   └── ... and ${files.length - 5} more\n`;
    }
  }
  mdReport += `\`\`\`\n\n`;
  
  for (const [folder, files] of Object.entries(categorized)) {
    if (files.length === 0) continue;
    mdReport += `## ${folder}\n\n`;
    for (const file of files) {
      mdReport += `- ${file.priority ? '⭐ ' : ''}\`${file.path}\` (${(file.size / 1024).toFixed(1)} KB)\n`;
    }
    mdReport += `\n`;
  }
  
  mdReport += `## Resolution Steps\n\n`;
  mdReport += `1. **Free up Google Drive storage** for the service account\n`;
  mdReport += `2. **Or upgrade** the Google Workspace storage quota\n`;
  mdReport += `3. **Or use a different Google account** with available storage\n`;
  mdReport += `4. **Re-run** the migration script:\n`;
  mdReport += `   \`\`\`bash\n`;
  mdReport += `   node migrate-to-drive.js\n`;
  mdReport += `   \`\`\`\n\n`;
  
  fs.writeFileSync('/home/node/.openclaw/workspace/MIGRATION-REPORT.md', mdReport);
  
  console.log('✅ Reports generated:');
  console.log('   - migration-report.json (machine-readable)');
  console.log('   - MIGRATION-REPORT.md (human-readable)');
  console.log('\n📊 Summary:');
  for (const [folder, count] of Object.entries(report.summary)) {
    console.log(`   ${folder}: ${count} files`);
  }
  
  return report;
}

generateReport();
