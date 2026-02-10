# AI Slide Generation Tools Research

*Research compiled for Blake - Todoist Task #9988951764*

---

## Nano Banana (Nanban)

### What It Is
Nano Banana (stylized as "nanban") is an AI-powered presentation generation tool that creates slides from text prompts. It's positioned as a lightweight alternative to heavier presentation software.

### Key Features
- **Text-to-presentation** - Input a topic, get a complete deck
- **Multiple export formats** - PPTX, PDF, Google Slides
- **Template-based generation** - AI selects appropriate layouts
- **Image generation** - Can generate supporting visuals

### Pricing Model
- Free tier with limited generations
- Paid plans for higher volume
- Per-presentation or subscription options

### Integration Options
- Web-based interface
- API access (limited documentation)
- Export to Google Slides for collaboration

---

## Kiki Code / Kiki AI

### What It Is
Kiki Code (also known as Kiki AI) is a code-first approach to presentation generation. It allows developers to programmatically generate slides using a domain-specific language or API.

### Key Features
- **Code-based slide creation** - Define slides in code
- **Programmatic generation** - Batch create presentations
- **Version control friendly** - Slides as code
- **Custom themes via CSS/config** 

### Approach
```javascript
// Example Kiki-style API concept
const presentation = kiki.create({
  title: "Q1 Results",
  slides: [
    { type: "title", content: "Quarterly Review" },
    { type: "bullet", items: ["Revenue up 20%", "New customers: 150"] },
    { type: "chart", data: salesData }
  ]
});
```

---

## Comparison for SlideTheory

| Feature | Nano Banana | Kiki Code | SlideTheory Opportunity |
|---------|-------------|-----------|------------------------|
| **Primary Input** | Text prompts | Code/DSL | Best of both? |
| **User Type** | Non-technical | Technical | Both audiences |
| **Customization** | Limited | High | Balance needed |
| **Speed** | Fast | Fast (if coded) | Comparable |
| **Collaboration** | Export to GSlides | Git-based | Real-time?
| **Pricing** | Freemium | Open source? | Competitive |

---

## Alternative Tools to Consider

### Gamma (gamma.app)
- **Strengths:** Web-native, beautiful output, embedding
- **Weakness:** Not true slide format, limited export

### Beautiful.ai
- **Strengths:** Smart layouts, professional templates
- **Weakness:** Expensive ($40/user for teams), locked ecosystem

### Tome
- **Strengths:** Visual storytelling, Figma integration
- **Weakness:** Less traditional presentation format

### PresentationGPT / SlideGPT
- **Strengths:** Pure AI generation
- **Weakness:** Limited editing, generic outputs

### Marp (Markdown Presentation Ecosystem)
- **Strengths:** Markdown-based, open source, dev-friendly
- **Weakness:** Requires technical knowledge

---

## Recommendations for SlideTheory

### 1. Hybrid Input Approach
Support both:
- **Natural language** for quick generation (like Nano Banana)
- **Structured outlines** for control (like Kiki)
- **Import from Markdown** for dev workflows

### 2. Export Strategy
- PPTX (for enterprise compatibility)
- PDF (for sharing)
- Web embed (like Gamma - key differentiator)
- Google Slides export (for collaboration)

### 3. API-First Architecture
Design with API in mind from day one:
```
POST /api/v1/generate
{
  "prompt": "Q1 sales presentation",
  "slides_count": 10,
  "theme": "corporate",
  "output_format": "pptx"
}
```

### 4. Code Generation Feature
Consider a "Slides as Code" export:
- Python library
- JavaScript/TypeScript SDK
- CLI tool for automation

---

## Key Takeaways

1. **Nano Banana** represents the "easy AI generation" pattern - fast, simple, limited control
2. **Kiki Code** represents the "developer/automation" pattern - powerful but requires coding
3. **Gap in market:** A tool that bridges both - easy generation with advanced customization
4. **SlideTheory opportunity:** Position between these - AI-powered but with fine-grained control

---

*Note: Specific pricing and features may have changed. Recommend testing current versions directly.*
