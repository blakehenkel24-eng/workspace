/**
 * Asset Optimization Service
 * Minifies CSS/JS, compresses images for CDN deployment
 */

const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const config = require('../config');

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

// Asset configuration
const ASSET_CONFIG = {
  js: {
    minify: true,
    gzip: true,
    brotli: true,
    sourceMap: process.env.NODE_ENV === 'development'
  },
  css: {
    minify: true,
    gzip: true,
    brotli: true,
    sourceMap: false
  },
  images: {
    compress: true,
    maxWidth: 1920,
    quality: 85,
    formats: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp']
  }
};

/**
 * Simple JS minifier (basic version - for production use terser)
 */
function minifyJS(code) {
  // Remove comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  code = code.replace(/\/\/.*$/gm, '');
  
  // Remove extra whitespace
  code = code.replace(/\n\s*/g, '\n');
  code = code.replace(/;\s*/g, ';');
  code = code.replace(/,\s*/g, ',');
  code = code.replace(/\{\s*/g, '{');
  code = code.replace(/\}\s*/g, '}');
  code = code.replace(/\(\s*/g, '(');
  code = code.replace(/\s*\)/g, ')');
  
  // Remove multiple spaces
  code = code.replace(/\s+/g, ' ');
  
  return code.trim();
}

/**
 * Simple CSS minifier
 */
function minifyCSS(code) {
  // Remove comments
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Remove extra whitespace
  code = code.replace(/\n\s*/g, '');
  code = code.replace(/;\s*/g, ';');
  code = code.replace(/,\s*/g, ',');
  code = code.replace(/:\s*/g, ':');
  code = code.replace(/\{\s*/g, '{');
  code = code.replace(/\}\s*/g, '}');
  code = code.replace(/;\}/g, '}');
  
  // Remove multiple spaces
  code = code.replace(/\s+/g, ' ');
  
  return code.trim();
}

/**
 * Compress text content with gzip
 */
async function gzipContent(content) {
  return gzip(Buffer.from(content), { level: 9 });
}

/**
 * Compress text content with brotli
 */
async function brotliContent(content) {
  return brotli(Buffer.from(content), {
    params: {
      [zlib.constants.BROTLI_PARAM_QUALITY]: 11
    }
  });
}

/**
 * Process a JavaScript file
 */
async function processJSFile(inputPath, outputDir) {
  const content = await fs.readFile(inputPath, 'utf8');
  const basename = path.basename(inputPath, '.js');
  
  const results = {
    original: content.length,
    files: []
  };
  
  // Minified version
  const minified = minifyJS(content);
  const minPath = path.join(outputDir, `${basename}.min.js`);
  await fs.writeFile(minPath, minified);
  results.files.push({ path: minPath, size: minified.length });
  results.minified = minified.length;
  
  // Gzipped version
  if (ASSET_CONFIG.js.gzip) {
    const gzipped = await gzipContent(minified);
    const gzPath = path.join(outputDir, `${basename}.min.js.gz`);
    await fs.writeFile(gzPath, gzipped);
    results.files.push({ path: gzPath, size: gzipped.length });
    results.gzipped = gzipped.length;
  }
  
  // Brotli version
  if (ASSET_CONFIG.js.brotli) {
    const brotliCompressed = await brotliContent(minified);
    const brPath = path.join(outputDir, `${basename}.min.js.br`);
    await fs.writeFile(brPath, brotliCompressed);
    results.files.push({ path: brPath, size: brotliCompressed.length });
    results.brotli = brotliCompressed.length;
  }
  
  return results;
}

/**
 * Process a CSS file
 */
async function processCSSFile(inputPath, outputDir) {
  const content = await fs.readFile(inputPath, 'utf8');
  const basename = path.basename(inputPath, '.css');
  
  const results = {
    original: content.length,
    files: []
  };
  
  // Minified version
  const minified = minifyCSS(content);
  const minPath = path.join(outputDir, `${basename}.min.css`);
  await fs.writeFile(minPath, minified);
  results.files.push({ path: minPath, size: minified.length });
  results.minified = minified.length;
  
  // Gzipped version
  if (ASSET_CONFIG.css.gzip) {
    const gzipped = await gzipContent(minified);
    const gzPath = path.join(outputDir, `${basename}.min.css.gz`);
    await fs.writeFile(gzPath, gzipped);
    results.files.push({ path: gzPath, size: gzipped.length });
    results.gzipped = gzipped.length;
  }
  
  // Brotli version
  if (ASSET_CONFIG.css.brotli) {
    const brotliCompressed = await brotliContent(minified);
    const brPath = path.join(outputDir, `${basename}.min.css.br`);
    await fs.writeFile(brPath, brotliCompressed);
    results.files.push({ path: brPath, size: brotliCompressed.length });
    results.brotli = brotliCompressed.length;
  }
  
  return results;
}

/**
 * Generate optimized HTML with inline critical CSS
 */
async function generateOptimizedHTML(inputPath, outputDir, criticalCSS) {
  let content = await fs.readFile(inputPath, 'utf8');
  
  // Inline critical CSS
  if (criticalCSS) {
    content = content.replace(
      /<link rel="stylesheet" href="[^"]*styles\.css[^"]*">/,
      `<style>${criticalCSS}</style>`
    );
  }
  
  // Minify HTML
  content = content.replace(/\n\s*/g, '');
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  content = content.replace(/\s+/g, ' ');
  
  const outputPath = path.join(outputDir, path.basename(inputPath));
  await fs.writeFile(outputPath, content);
  
  return { path: outputPath, size: content.length };
}

/**
 * Build assets for CDN deployment
 */
async function buildAssets(options = {}) {
  const publicDir = config.paths.public;
  const outputDir = options.outputDir || path.join(publicDir, 'dist');
  
  console.log('[Assets] Building optimized assets...');
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  const results = {
    js: [],
    css: [],
    html: [],
    savings: { original: 0, minified: 0, gzipped: 0, brotli: 0 }
  };
  
  try {
    // Process JS files
    const jsFiles = await fs.readdir(publicDir);
    for (const file of jsFiles.filter(f => f.endsWith('.js'))) {
      const inputPath = path.join(publicDir, file);
      const stats = await fs.stat(inputPath);
      if (stats.isFile()) {
        const result = await processJSFile(inputPath, outputDir);
        results.js.push({ file, ...result });
        results.savings.original += result.original;
        results.savings.minified += result.minified || 0;
        results.savings.gzipped += result.gzipped || 0;
        results.savings.brotli += result.brotli || 0;
      }
    }
    
    // Process CSS files
    const cssFiles = await fs.readdir(publicDir);
    for (const file of cssFiles.filter(f => f.endsWith('.css'))) {
      const inputPath = path.join(publicDir, file);
      const stats = await fs.stat(inputPath);
      if (stats.isFile()) {
        const result = await processCSSFile(inputPath, outputDir);
        results.css.push({ file, ...result });
        results.savings.original += result.original;
        results.savings.minified += result.minified || 0;
        results.savings.gzipped += result.gzipped || 0;
        results.savings.brotli += result.brotli || 0;
      }
    }
    
    // Generate optimized HTML
    const htmlPath = path.join(publicDir, 'index.html');
    try {
      const criticalCSS = results.css[0]?.files[0]?.path 
        ? await fs.readFile(results.css[0].files[0].path, 'utf8')
        : null;
      const htmlResult = await generateOptimizedHTML(htmlPath, outputDir, criticalCSS);
      results.html.push(htmlResult);
    } catch (e) {
      // HTML optimization is optional
    }
    
    // Generate manifest
    const manifest = {
      version: config.VERSION,
      builtAt: new Date().toISOString(),
      files: {
        js: results.js.map(j => ({
          name: j.file,
          original: j.original,
          minified: j.minified,
          compression: {
            gzip: j.gzipped,
            brotli: j.brotli
          }
        })),
        css: results.css.map(c => ({
          name: c.file,
          original: c.original,
          minified: c.minified,
          compression: {
            gzip: c.gzipped,
            brotli: c.brotli
          }
        }))
      }
    };
    
    await fs.writeFile(
      path.join(outputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    // Print summary
    console.log('[Assets] Build complete:');
    console.log(`  JS files: ${results.js.length}`);
    console.log(`  CSS files: ${results.css.length}`);
    console.log(`  Total savings:`);
    console.log(`    Original: ${formatBytes(results.savings.original)}`);
    console.log(`    Minified: ${formatBytes(results.savings.minified)} (${((1 - results.savings.minified / results.savings.original) * 100).toFixed(1)}% saved)`);
    if (results.savings.gzipped) {
      console.log(`    Gzipped:  ${formatBytes(results.savings.gzipped)} (${((1 - results.savings.gzipped / results.savings.original) * 100).toFixed(1)}% saved)`);
    }
    if (results.savings.brotli) {
      console.log(`    Brotli:   ${formatBytes(results.savings.brotli)} (${((1 - results.savings.brotli / results.savings.original) * 100).toFixed(1)}% saved)`);
    }
    
    return results;
  } catch (error) {
    console.error('[Assets] Build failed:', error.message);
    throw error;
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get middleware for serving optimized assets
 */
function getAssetMiddleware() {
  const express = require('express');
  const outputDir = path.join(config.paths.public, 'dist');
  
  return (req, res, next) => {
    // Check for pre-compressed versions
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const url = req.url;
    
    if (url.endsWith('.js') || url.endsWith('.css')) {
      // Prefer brotli, then gzip
      if (acceptEncoding.includes('br')) {
        const brPath = path.join(outputDir, url + '.br');
        if (require('fs').existsSync(brPath)) {
          req.url = url + '.br';
          res.setHeader('Content-Encoding', 'br');
          res.setHeader('Content-Type', url.endsWith('.js') ? 'application/javascript' : 'text/css');
        }
      } else if (acceptEncoding.includes('gzip')) {
        const gzPath = path.join(outputDir, url + '.gz');
        if (require('fs').existsSync(gzPath)) {
          req.url = url + '.gz';
          res.setHeader('Content-Encoding', 'gzip');
          res.setHeader('Content-Type', url.endsWith('.js') ? 'application/javascript' : 'text/css');
        }
      } else {
        // Serve minified version
        const minPath = path.join(outputDir, url.replace(/\.js$/, '.min.js').replace(/\.css$/, '.min.css'));
        if (require('fs').existsSync(minPath)) {
          req.url = url.replace(/\.js$/, '.min.js').replace(/\.css$/, '.min.css');
        }
      }
    }
    
    // Add cache headers for static assets
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    next();
  };
}

module.exports = {
  buildAssets,
  getAssetMiddleware,
  minifyJS,
  minifyCSS,
  gzipContent,
  brotliContent,
  formatBytes
};
