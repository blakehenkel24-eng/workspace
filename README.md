# Workspace

Personal workspace for AI-assisted development, product management, and knowledge organization.

## Quick Navigation

| Folder | Purpose |
|--------|---------|
| [`docs/`](docs/) | Documentation and guides |
| [`memory/`](memory/) | Daily notes and long-term memory |
| [`products/`](products/) | Active product work |
| [`public/`](public/) | SlideTheory website (deployed to slidetheory.io) |
| [`tools/`](tools/) | Utilities and tools |
| [`archive/`](archive/) | Old/stale content |
| [`skills/`](skills/) | Reusable skill definitions |

## Repository Structure

```
workspace/
├── README.md              # This file -  start here
├── .gitignore             # Git ignore rules
├── LICENSE                # License file
│
├── docs/                  # Documentation & guides
│   ├── guides/            # Master guides and tutorials
│   └── README.md          # Docs index
│
├── memory/                # Daily notes & logs
│   ├── MEMORY.md          # Curated long-term memory
│   ├── SEMANTIC-MEMORY.md # Semantic memory config
│   └── YYYY-MM-DD.md      # Daily session logs
│
├── products/              # Product work
│   ├── slidetheory/       # SlideTheory - AI slide generator
│   └── client-hawk/       # Client Hawk - client intelligence
│
├── public/                # SlideTheory website
│   ├── index.html         # Main website
│   ├── app.js             # Application logic
│   ├── styles.css         # Styles
│   └── ...
│
├── tools/                 # Tools & utilities
│   └── mission-control/   # Dashboard interface
│
├── archive/               # Archived content
│
├── skills/                # Skill definitions
│   └── self-improving-agent-1-0-1/
│
└── .clawhub/              # Clawhub data
```

## Agent Context Files (Root Level)

These files define how the AI agent operates in this workspace:

| File | Purpose |
|------|---------|
| `AGENTS.md` | Agent workspace guide and conventions |
| `SOUL.md` | Agent identity and personality |
| `USER.md` | User context and preferences |
| `TOOLS.md` | Environment-specific tool notes |
| `HEARTBEAT.md` | Periodic check reminders |
| `IDENTITY.md` | Identity configuration |
| `BOOTSTRAP.md` | First-run setup guide (delete after onboarding) |
| `MEMORY.md` | Curated long-term memory |

## Products

### SlideTheory (AI Slide Generator)
**Status:** Website deployed at https://slidetheory.io  
**Location:** `products/slidetheory/` and `public/`

| Resource | Path |
|----------|------|
| **Website** | `public/index.html` |
| **Product Spec** | `products/slidetheory/PRODUCT-SPEC.md` |
| **Marketing** | `products/slidetheory/marketing/` |
| **Research** | `products/slidetheory/research/` |
| **Documentation** | `products/slidetheory/docs/` |

### Client Hawk (Client Intelligence)
**Status:** Product spec complete  
**Location:** `products/client-hawk/`

| Resource | Path |
|----------|------|
| **Product Spec** | `products/client-hawk/PRODUCT-SPEC.md` |

## Usage

1. **Agent onboarding**: Read `AGENTS.md`
2. **Daily work**: Check `memory/` for recent context
3. **Product work**: Navigate to `products/[product-name]/`
4. **Documentation**: See `docs/guides/`

---

*Last updated: February 5, 2026*
