# SlideTheory Technical SEO Audit

**Last Updated:** February 2026  
**Website:** slidetheory.io  
**Objective:** Ensure optimal technical foundation for search visibility

---

## EXECUTIVE SUMMARY

This technical SEO audit provides a comprehensive checklist to ensure slidetheory.io has a solid technical foundation for search engine crawling, indexing, and ranking. Priority levels are indicated for each item.

---

## 1. PAGE SPEED OPTIMIZATION CHECKLIST

### Core Performance Targets

| Metric | Target | Priority |
|--------|--------|----------|
| Largest Contentful Paint (LCP) | ≤ 2.5 seconds | 🔴 Critical |
| First Input Delay (FID) | ≤ 100 milliseconds | 🔴 Critical |
| Cumulative Layout Shift (CLS) | ≤ 0.1 | 🔴 Critical |
| Time to First Byte (TTFB) | ≤ 600 milliseconds | 🟠 High |
| First Contentful Paint (FCP) | ≤ 1.8 seconds | 🟠 High |
| Speed Index | ≤ 3.4 seconds | 🟡 Medium |

### Image Optimization

#### Required Actions

- [ ] **Compress all images** using WebP format (30-80% smaller than JPEG)
- [ ] **Implement responsive images** with `srcset` attribute
- [ ] **Lazy load** all below-the-fold images
- [ ] **Set explicit dimensions** on all images to prevent CLS
- [ ] **Use SVG** for logos and icons
- [ ] **Implement blur-up technique** for hero images

#### Image Specifications

| Image Type | Format | Max Size | Dimensions |
|------------|--------|----------|------------|
| Hero images | WebP | < 150KB | 1920x1080 |
| Product screenshots | WebP | < 100KB | 1200x800 |
| Thumbnails | WebP | < 30KB | 400x300 |
| Icons | SVG | < 5KB | Variable |
| Logos | SVG | < 10KB | Variable |

#### Image Implementation Checklist

```html
<!-- Responsive image with lazy loading -->
<img
  src="image-400.webp"
  srcset="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt="Descriptive alt text"
  loading="lazy"
  width="1200"
  height="800"
/>
```

- [ ] All images use `loading="lazy"` (except hero)
- [ ] All images have explicit `width` and `height`
- [ ] All images use WebP with JPEG fallback
- [ ] All images have descriptive `alt` text

### JavaScript Optimization

#### Critical Actions

- [ ] **Minify** all JavaScript files
- [ ] **Defer** non-critical JavaScript
- [ ] **Code split** JavaScript by route
- [ ] **Tree shake** unused code
- [ ] **Preload** critical JavaScript
- [ ] **Use async** for third-party scripts

#### JavaScript Loading Strategy

```html
<!-- Critical JS (render-blocking, minimal) -->
<script src="critical.js"></script>

<!-- Deferred JS (non-critical, loads after HTML) -->
<script src="app.js" defer></script>

<!-- Async third-party -->
<script src="analytics.js" async></script>
```

#### Bundle Size Targets

| Bundle | Target Size | Priority |
|--------|-------------|----------|
| Critical (blocking) | < 50KB | 🔴 Critical |
| App (deferred) | < 200KB | 🟠 High |
| Vendor (shared) | < 150KB | 🟠 High |
| Route-specific | < 100KB each | 🟡 Medium |

### CSS Optimization

#### Critical CSS

- [ ] **Inline critical CSS** (above-the-fold styles)
- [ ] **Load remaining CSS** asynchronously
- [ ] **Minify** all CSS files
- [ ] **Purge unused CSS**
- [ ] **Use CSS variables** for theming (reduces duplication)

#### Critical CSS Implementation

```html
<style>
  /* Inline critical CSS - ~14KB max */
  /* Header, hero, above-fold content */
</style>

<!-- Async load non-critical CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>
```

#### CSS Size Targets

| CSS Type | Target Size |
|----------|-------------|
| Critical (inlined) | < 14KB |
| Non-critical | < 50KB |
| Total (first paint) | < 64KB |

### Font Optimization

#### Font Loading Strategy

- [ ] **Preload** critical fonts
- [ ] **Use font-display: swap**
- [ ] **Subset fonts** (Latin only initially)
- [ ] **Use WOFF2** format
- [ ] **Limit font families** (max 2-3)
- [ ] **Use system fonts** as fallback

#### Font Implementation

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font face with swap -->
<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter.woff2') format('woff2');
    font-weight: 400 700;
    font-display: swap;
  }
</style>
```

### Server Optimization

#### Required Configurations

- [ ] **Enable Gzip/Brotli compression**
- [ ] **Enable HTTP/2** or HTTP/3
- [ ] **Set cache headers** for static assets
- [ ] **Use CDN** for global distribution
- [ ] **Implement edge caching**

#### Cache Control Headers

```
# Static assets (images, fonts, CSS, JS)
Cache-Control: public, max-age=31536000, immutable

# HTML pages
Cache-Control: public, max-age=0, must-revalidate

# API responses
Cache-Control: private, max-age=60
```

### Performance Testing Tools

| Tool | Use Case | Frequency |
|------|----------|-----------|
| Google PageSpeed Insights | Overall score | Weekly |
| WebPageTest | Detailed waterfall | Monthly |
| Lighthouse CI | Automated testing | Per deployment |
| Chrome DevTools | Real-time debugging | As needed |

---

## 2. MOBILE OPTIMIZATION

### Responsive Design Requirements

- [ ] **Mobile-first** CSS approach
- [ ] **Fluid layouts** (not fixed widths)
- [ ] **Viewport meta tag** properly configured
- [ ] **Touch-friendly** tap targets (minimum 48x48px)
- [ ] **Readable font sizes** (minimum 16px for inputs)
- [ ] **No horizontal scrolling**

#### Viewport Configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```

### Mobile-Specific Optimizations

- [ ] **Optimize images** for mobile (smaller sizes)
- [ ] **Reduce animations** on mobile (prefers-reduced-motion)
- [ ] **Simplify navigation** (hamburger menu)
- [ ] **Optimize forms** for mobile input
- [ ] **Test on real devices** (not just emulators)

### Mobile Page Speed Targets

| Metric | Mobile Target |
|--------|---------------|
| LCP | ≤ 2.5s |
| FID | ≤ 100ms |
| CLS | ≤ 0.1 |
| Total Page Size | < 1MB |

### Mobile Testing Checklist

- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on various screen sizes (320px to 428px)
- [ ] Test touch interactions
- [ ] Test form inputs
- [ ] Test navigation
- [ ] Verify no zoom on input focus

---

## 3. XML SITEMAP STRUCTURE

### Sitemap Architecture

```
slidetheory.io/
├── sitemap.xml (index)
├── sitemap-pages.xml
├── sitemap-blog.xml
├── sitemap-frameworks.xml
└── sitemap-templates.xml
```

### Sitemap Index

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://slidetheory.io/sitemap-pages.xml</loc>
    <lastmod>2026-02-04</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://slidetheory.io/sitemap-blog.xml</loc>
    <lastmod>2026-02-04</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://slidetheory.io/sitemap-frameworks.xml</loc>
    <lastmod>2026-02-04</lastmod>
  </sitemap>
</sitemapindex>
```

### Individual Sitemap Format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
  <url>
    <loc>https://slidetheory.io/</loc>
    <lastmod>2026-02-04</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <url>
    <loc>https://slidetheory.io/frameworks/mece-principle</loc>
    <lastmod>2026-02-04</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>https://slidetheory.io/images/mece-diagram.jpg</image:loc>
      <image:title>MECE Principle Diagram</image:title>
    </image:image>
  </url>
  
</urlset>
```

### Sitemap Priorities

| Page Type | Priority | Change Frequency |
|-----------|----------|------------------|
| Homepage | 1.0 | daily |
| Product pages | 0.9 | weekly |
| Pricing | 0.9 | monthly |
| Framework guides | 0.8 | weekly |
| Blog posts | 0.7 | weekly |
| Templates | 0.7 | monthly |
| About/Contact | 0.5 | monthly |

### Sitemap Requirements

- [ ] **Maximum 50,000 URLs** per sitemap
- [ ] **Maximum 50MB** uncompressed
- [ ] **UTF-8 encoding**
- [ ] **HTTPS URLs only**
- [ ] **Valid XML** (test with validator)
- [ ] **Submitted to Google Search Console**
- [ ] **Submitted to Bing Webmaster Tools**
- [ ] **Auto-generated** (not manual)
- [ ] **Lastmod reflects actual changes**

---

## 4. ROBOTS.TXT RECOMMENDATIONS

### Recommended robots.txt

```
User-agent: *
Allow: /

# Sitemap
Sitemap: https://slidetheory.io/sitemap.xml

# Crawl rate
Crawl-delay: 1

# Block non-essential paths
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /checkout/
Disallow: /account/
Disallow: /search?
Disallow: /*?*sort=
Disallow: /*?*filter=

# Block utility pages
Disallow: /404
Disallow: /500
Disallow: /maintenance

# Block test/staging
Disallow: /test/
Disallow: /staging/
Disallow: /dev/

# Allow important assets
Allow: /assets/
Allow: /images/
Allow: /fonts/
```

### Robots.txt Best Practices

- [ ] Place in root directory
- [ ] Use absolute URL for sitemap
- [ ] Test with Google Search Console
- [ ] Keep under 500KB
- [ ] Use comments for documentation
- [ ] Review quarterly

### Meta Robots Tags

```html
<!-- Index, follow (default) -->
<meta name="robots" content="index, follow">

<!-- No index for specific pages -->
<meta name="robots" content="noindex, follow">

<!-- No index, no follow for utility pages -->
<meta name="robots" content="noindex, nofollow">
```

#### Pages to Noindex

| Page | Robots Tag |
|------|------------|
| Thank you pages | noindex, follow |
| User account pages | noindex, follow |
| Search results | noindex, follow |
| Cart/checkout | noindex, nofollow |
| Admin panels | noindex, nofollow |
| Staging sites | noindex, nofollow |

---

## 5. CANONICAL TAGS

### Canonical Implementation

```html
<!-- Self-referencing canonical (default) -->
<link rel="canonical" href="https://slidetheory.io/frameworks/mece-principle">

<!-- Cross-domain canonical (if syndicating) -->
<link rel="canonical" href="https://slidetheory.io/blog/original-post">
```

### Canonical Use Cases

| Scenario | Canonical Strategy |
|----------|-------------------|
| URL parameters | Canonical to clean URL |
| Trailing slashes | Canonical to preferred version |
| HTTP/HTTPS | Canonical to HTTPS |
| WWW vs non-WWW | Canonical to preferred |
| Pagination | Self-canonical or canonical to view-all |
| Similar content | Canonical to most comprehensive |

### URL Parameter Handling

```html
<!-- For: ?utm_source=newsletter&page=2 -->
<link rel="canonical" href="https://slidetheory.io/blog">
```

### Canonical Checklist

- [ ] Every page has a canonical tag
- [ ] Canonicals use absolute URLs
- [ ] Canonicals use HTTPS
- [ ] Canonicals are consistent (www or non-www)
- [ ] No canonical chains (A → B → C)
- [ ] No canonical loops (A → B → A)
- [ ] Pagination handled correctly

---

## 6. CORE WEB VITALS TARGETS

### LCP (Largest Contentful Paint)

**Target:** ≤ 2.5 seconds

**Optimization Strategies:**
- [ ] Optimize hero image (compress, preload)
- [ ] Preload LCP image
- [ ] Inline critical CSS
- [ ] Reduce server response time
- [ ] Use CDN for assets

```html
<!-- Preload LCP image -->
<link rel="preload" as="image" href="/hero-image.webp" type="image/webp">
```

### FID (First Input Delay) / INP (Interaction to Next Paint)

**Target:** ≤ 100 milliseconds (FID) / ≤ 200ms (INP)

**Optimization Strategies:**
- [ ] Break up Long Tasks
- [ ] Defer non-critical JavaScript
- [ ] Use web workers for heavy computations
- [ ] Minimize main thread work
- [ ] Code split JavaScript

### CLS (Cumulative Layout Shift)

**Target:** ≤ 0.1

**Optimization Strategies:**
- [ ] Set explicit dimensions on images
- [ ] Set explicit dimensions on ads/embeds
- [ ] Reserve space for dynamic content
- [ ] Avoid inserting content above existing content
- [ ] Use transform animations (not position)

```html
<!-- Reserve space for dynamic content -->
<div style="min-height: 200px;">
  <!-- Dynamic content loads here -->
</div>
```

### Core Web Vitals Monitoring

| Tool | Metrics | Frequency |
|------|---------|-----------|
| Search Console (CWV report) | Field data | Weekly |
| PageSpeed Insights | Lab + field data | Weekly |
| CrUX Dashboard | Real user data | Monthly |
| Web Vitals JS library | Real-time RUM | Continuous |

---

## 7. SECURITY & HTTPS

### SSL/TLS Requirements

- [ ] **Valid SSL certificate** (not expired)
- [ ] **HTTPS enforced** (redirect HTTP → HTTPS)
- [ ] **HSTS enabled**
- [ ] **TLS 1.2+ only**
- [ ] **Mixed content** resolved

### HTTPS Implementation

```
# Force HTTPS redirect
server {
    listen 80;
    server_name slidetheory.io;
    return 301 https://$server_name$request_uri;
}
```

### Security Headers

```
# HTTP Strict Transport Security
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Content Security Policy
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.example.com; style-src 'self' 'unsafe-inline';

# X-Frame-Options
X-Frame-Options: DENY

# X-Content-Type-Options
X-Content-Type-Options: nosniff

# Referrer Policy
Referrer-Policy: strict-origin-when-cross-origin

# Permissions Policy
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Security Checklist

- [ ] SSL certificate valid
- [ ] HTTPS redirect working
- [ ] No mixed content warnings
- [ ] Security headers implemented
- [ ] Regular security audits

---

## 8. CRAWLABILITY & INDEXABILITY

### Crawl Budget Optimization

- [ ] **Fix 404 errors** (soft and hard)
- [ ] **Fix redirect chains**
- [ ] **Eliminate duplicate content**
- [ ] **Optimize internal linking**
- [ ] **Keep XML sitemap updated**
- [ ] **Monitor crawl errors** in Search Console

### URL Structure Best Practices

- [ ] **Clean URLs** (no unnecessary parameters)
- [ ] **Consistent structure** across site
- [ ] **Hyphens** not underscores
- [ ] **Lowercase** only
- [ ] **Descriptive** (include keywords)

### Status Code Management

| Code | Usage | Handling |
|------|-------|----------|
| 200 | OK | Standard response |
| 301 | Permanent redirect | Use for URL changes |
| 302 | Temporary redirect | Avoid for SEO |
| 404 | Not found | Custom page, noindex |
| 410 | Gone | Permanently removed |
| 500 | Server error | Fix immediately |
| 503 | Service unavailable | Use for maintenance |

### Indexability Checklist

- [ ] No accidental noindex tags
- [ ] No robots.txt blocking important pages
- [ ] No orphan pages (all have internal links)
- [ ] XML sitemap includes all important pages
- [ ] No duplicate content issues

---

## 9. STRUCTURED DATA IMPLEMENTATION

### Schema Markup Requirements

- [ ] **Organization schema** (all pages)
- [ ] **WebSite schema** (homepage)
- [ ] **Product/SoftwareApplication** (product pages)
- [ ] **Article** (blog posts)
- [ ] **BreadcrumbList** (all pages)
- [ ] **FAQPage** (FAQ sections)
- [ ] **HowTo** (tutorial content)

### JSON-LD Implementation

Place in `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SlideTheory",
  "url": "https://slidetheory.io",
  "logo": "https://slidetheory.io/logo.png"
}
</script>
```

### Schema Validation

- [ ] Test with [Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Test with [Schema Validator](https://validator.schema.org/)
- [ ] Monitor "Enhancements" in Search Console
- [ ] Fix any errors or warnings

---

## 10. INTERNATIONAL SEO

### Hreflang Implementation

If/when expanding internationally:

```html
<link rel="alternate" hreflang="en-us" href="https://slidetheory.io/" />
<link rel="alternate" hreflang="en-gb" href="https://slidetheory.io/uk/" />
<link rel="alternate" hreflang="x-default" href="https://slidetheory.io/" />
```

### International Considerations

- [ ] **Consistent URL structure** across languages
- [ ] **Fully translated content** (not just template)
- [ ] **Localized keywords** research
- [ ] **Local hosting/CDN** for performance

---

## 11. MONITORING & MAINTENANCE

### Weekly Checks

- [ ] Search Console crawl errors
- [ ] Core Web Vitals status
- [ ] Sitemap status
- [ ] Index coverage

### Monthly Checks

- [ ] Full technical audit (Screaming Frog)
- [ ] Page speed analysis
- [ ] Security scan
- [ ] Schema validation
- [ ] Mobile usability

### Quarterly Reviews

- [ ] Robots.txt review
- [ ] Sitemap structure review
- [ ] URL structure audit
- [ ] Redirect audit
- [ ] Technical SEO best practices update

### Tools for Technical SEO

| Tool | Purpose |
|------|---------|
| Google Search Console | Indexing, CWV, errors |
| Screaming Frog | Crawl analysis |
| PageSpeed Insights | Performance testing |
| WebPageTest | Detailed performance |
| GTmetrix | Speed monitoring |
| Schema.org Validator | Structured data |
| SSL Labs | SSL testing |
| Security Headers | Header analysis |

---

## IMPLEMENTATION PRIORITY

### Immediate (Week 1)
1. HTTPS enforcement
2. XML sitemap creation
3. robots.txt setup
4. Canonical tags
5. Basic schema markup

### Short-term (Weeks 2-4)
1. Image optimization
2. JavaScript/CSS optimization
3. Mobile optimization
4. Core Web Vitals improvements
5. Security headers

### Ongoing
1. Performance monitoring
2. Search Console monitoring
3. Regular audits
4. Schema expansion
5. Technical debt management

---

*This audit should be reviewed monthly and updated based on Google algorithm changes and site evolution.*
