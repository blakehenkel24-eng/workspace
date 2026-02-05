const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Drive authentication
const auth = new google.auth.GoogleAuth({
  keyFile: '/home/node/.openclaw/workspace/.google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });
const docs = google.docs({ version: 'v1', auth });

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
  
  // Notion export - organize by category
  if (lowerPath.includes('notion-export/')) {
    if (lowerPath.includes('goals/') || lowerPath.includes('work/')) {
      return '04 - Project Knowledge';
    }
    if (lowerPath.includes('learning/') || lowerPath.includes('ideas/')) {
      return '04 - Project Knowledge';
    }
    if (lowerPath.includes('health/')) {
      return '04 - Project Knowledge';
    }
    return '04 - Project Knowledge';
  }
  
  // Default to Guides
  return '03 - Guides & Documentation';
}

// Create folder in Google Drive
async function createFolder(name, parentId = null) {
  const metadata = {
    name: name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  
  if (parentId) {
    metadata.parents = [parentId];
  }
  
  try {
    const response = await drive.files.create({
      requestBody: metadata,
      fields: 'id, name',
    });
    console.log(`✅ Created folder: ${name} (${response.data.id})`);
    return response.data.id;
  } catch (error) {
    console.error(`❌ Failed to create folder ${name}:`, error.message);
    throw error;
  }
}

// Convert markdown to Google Docs
async function createDocFromMarkdown(filePath, folderId, folderName) {
  const fileName = path.basename(filePath, '.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace('/home/node/.openclaw/workspace/', '');
  
  // Create the document
  const docMetadata = {
    name: fileName,
    mimeType: 'application/vnd.google-apps.document',
    parents: [folderId],
  };
  
  try {
    // Create the document
    const docResponse = await drive.files.create({
      requestBody: docMetadata,
      fields: 'id, name',
    });
    
    const docId = docResponse.data.id;
    
    // Add header with source info
    const headerText = `Source: ${relativePath}\nImported: ${new Date().toISOString().split('T')[0]}\n\n---\n\n`;
    const fullContent = headerText + content;
    
    // Convert markdown to plain text with basic formatting
    // For now, we'll insert as plain text (Google Docs API has limitations with formatting)
    const requests = [{
      insertText: {
        location: { index: 1 },
        text: fullContent,
      },
    }];
    
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests },
    });
    
    console.log(`✅ Created doc: ${fileName} in ${folderName}`);
    return { id: docId, name: fileName, folder: folderName };
  } catch (error) {
    console.error(`❌ Failed to create doc ${fileName}:`, error.message);
    return { error: true, name: fileName, message: error.message };
  }
}

// Main migration function
async function migrateToDrive() {
  console.log('🚀 Starting migration to Google Drive...\n');
  
  const results = {
    folders: {},
    files: [],
    errors: []
  };
  
  // Create main "OpenClaw" folder
  console.log('Creating folder structure...');
  const mainFolderId = await createFolder('OpenClaw');
  results.folders['OpenClaw'] = mainFolderId;
  
  // Create subfolders
  for (const folderName of Object.keys(FOLDER_STRUCTURE)) {
    const folderId = await createFolder(folderName, mainFolderId);
    results.folders[folderName] = folderId;
  }
  
  console.log('\n---\n');
  
  // Get all markdown files
  const { execSync } = require('child_process');
  const fileList = execSync(
    'find /home/node/.openclaw/workspace -type f -name "*.md" ! -path "*/node_modules/*" ! -path "*/.git/*"',
    { encoding: 'utf-8' }
  ).trim().split('\n').filter(f => f);
  
  console.log(`Found ${fileList.length} markdown files to migrate\n`);
  
  // Priority files first
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
  
  // Sort files: priority first, then others
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
  
  // Process files
  let count = 0;
  for (const filePath of sortedFiles) {
    count++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const folderName = categorizeFile(filePath, content);
    const folderId = results.folders[folderName];
    
    console.log(`[${count}/${sortedFiles.length}] Processing: ${path.basename(filePath)}`);
    const result = await createDocFromMarkdown(filePath, folderId, folderName);
    
    if (result.error) {
      results.errors.push({ file: filePath, error: result.message });
    } else {
      results.files.push(result);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}

// Run migration
migrateToDrive()
  .then(results => {
    console.log('\n========================================');
    console.log('MIGRATION COMPLETE');
    console.log('========================================');
    console.log(`\n📁 Folders created: ${Object.keys(results.folders).length}`);
    console.log(`📄 Files migrated: ${results.files.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('\nFailed files:');
      results.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
    }
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        folders: Object.keys(results.folders).length,
        files: results.files.length,
        errors: results.errors.length
      },
      folders: results.folders,
      files: results.files,
      errors: results.errors
    };
    
    fs.writeFileSync('/home/node/.openclaw/workspace/migration-report.json', JSON.stringify(report, null, 2));
    console.log('\n📋 Report saved to: migration-report.json');
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
