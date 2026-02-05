# Contributing to SlideTheory

Thank you for your interest in contributing to SlideTheory! This document provides guidelines and instructions for contributing to our open-source components.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [How to Contribute](#how-to-contribute)
4. [Development Setup](#development-setup)
5. [Coding Standards](#coding-standards)
6. [Submitting Changes](#submitting-changes)
7. [Community](#community)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct:

### Our Standards

**Positive behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Violations may result in temporary or permanent ban from project spaces.

---

## Getting Started

### What Can I Contribute?

We welcome contributions in these areas:

| Area | Examples | Repository |
|------|----------|------------|
| **Documentation** | User guides, API docs, tutorials | `slidetheory/docs` |
| **Frontend** | UI components, accessibility, mobile UX | `slidetheory/frontend` |
| **Templates** | New slide templates, examples | `slidetheory/templates` |
| **SDKs** | Client libraries (Python, Node, etc.) | `slidetheory/sdks` |
| **Bug Reports** | Issue reproductions, fixes | Any |
| **Translations** | Localized documentation | `slidetheory/docs` |

### What We Don't Accept

- AI model training data or prompts (proprietary)
- Backend infrastructure code (proprietary)
- Third-party API integrations without approval

---

## How to Contribute

### Reporting Bugs

Before reporting, please:
1. Check if the bug is already reported in [Issues](https://github.com/slidetheory/issues)
2. Try the latest version to see if it's fixed
3. Gather information: browser version, steps to reproduce

**Template:**
```markdown
**Bug Description:**
A clear description of the bug.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen.

**Actual Behavior:**
What actually happens.

**Environment:**
- OS: [e.g., macOS 14.2]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 2.0.1]

**Screenshots:**
If applicable, add screenshots.
```

### Suggesting Features

We love feature ideas! Please provide:
- Clear use case
- Expected behavior
- Potential implementation approach
- Why this benefits users

### Contributing Code

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to your fork (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## Development Setup

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.9+ (for Python SDK)
- Git

### Frontend Development

```bash
# Clone the repository
git clone https://github.com/slidetheory/frontend.git
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Python SDK Development

```bash
# Clone the repository
git clone https://github.com/slidetheory/python-sdk.git
cd python-sdk

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run tests
pytest

# Run linting
flake8 slidetheory/
black slidetheory/
```

### Documentation Development

```bash
git clone https://github.com/slidetheory/docs.git
cd docs

# Install dependencies
npm install

# Start local server
npm run serve

# Build
npm run build
```

---

## Coding Standards

### JavaScript/TypeScript

We use ESLint and Prettier for code formatting.

```javascript
// Good
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Bad
function calculate_total(items){
return items.reduce(function(sum,item){return sum+item.price;},0);
}
```

**Rules:**
- Use 2 spaces for indentation
- Use single quotes for strings
- Use camelCase for variables/functions
- Use PascalCase for classes/components
- Maximum line length: 100 characters
- Always use semicolons

### Python

We follow PEP 8 with some modifications:

```python
# Good
def calculate_total(items: list[Item]) -> float:
    """Calculate total price of items."""
    return sum(item.price for item in items)

# Bad
def calculate_total(items):
    return sum([item.price for item in items])
```

**Rules:**
- Line length: 100 characters
- Use type hints for function signatures
- Docstrings for public functions/classes
- Black for formatting
- isort for import sorting

### CSS/SCSS

```css
/* Good */
.button {
  display: flex;
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
}

.button:hover {
  background-color: var(--color-primary-dark);
}

/* Bad */
.button{ display:flex; padding:0.5rem 1rem; background:#000; }
```

**Rules:**
- Use CSS custom properties (variables)
- BEM naming convention
- Mobile-first responsive design
- Prefer rem/em over px

### Git Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build process, dependencies

**Examples:**
```
feat(ui): add dark mode toggle

fix(api): handle rate limit errors gracefully

docs(readme): update installation instructions
```

---

## Submitting Changes

### Pull Request Process

1. **Before Submitting:**
   - Ensure all tests pass
   - Update documentation if needed
   - Add entries to CHANGELOG.md
   - Rebase on latest main branch

2. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of changes.

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation
   - [ ] Breaking change

   ## Testing
   How was this tested?

   ## Screenshots (if UI changes)

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] CHANGELOG.md updated
   ```

3. **Review Process:**
   - Maintainers will review within 3 business days
   - Address review feedback
   - Once approved, maintainers will merge

### Code Review Guidelines

**As a submitter:**
- Keep PRs focused and reasonably sized
- Respond to feedback promptly
- Explain your reasoning for non-obvious choices

**As a reviewer:**
- Be constructive and respectful
- Suggest improvements, don't just point out problems
- Approve when satisfied, don't just leave comments

---

## Community

### Communication Channels

| Channel | Purpose | Link |
|---------|---------|------|
| GitHub Discussions | Q&A, ideas | [discussions](https://github.com/slidetheory/discussions) |
| Discord | Real-time chat | [discord.gg/slidetheory](https://discord.gg/slidetheory) |
| Twitter | Announcements | [@SlideTheory](https://twitter.com/SlideTheory) |
| Email | Private inquiries | community@slidetheory.io |

### Recognition

Contributors will be:
- Listed in our CONTRIBUTORS.md file
- Mentioned in release notes for significant contributions
- Eligible for contributor swag (t-shirts, stickers)

### Becoming a Maintainer

Regular contributors may be invited to become maintainers. Criteria:
- Consistent quality contributions
- Helpful code reviews
- Community participation
- Alignment with project values

---

## Development Roadmap

See our public roadmap at [roadmap.slidetheory.io](https://roadmap.slidetheory.io)

### Current Focus Areas

1. **Accessibility (a11y)** — WCAG 2.1 AA compliance
2. **Mobile Experience** — Native app development
3. **SDK Expansion** — Ruby, Go, PHP SDKs
4. **Template Library** — Community template submissions

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License (for open-source components).

---

## Questions?

- Technical questions: Open a [GitHub Discussion](https://github.com/slidetheory/discussions)
- Private inquiries: community@slidetheory.io

Thank you for contributing! 🙏

---

*Last updated: February 2026*
