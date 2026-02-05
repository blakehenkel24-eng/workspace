# SlideTheory MVP - UI Component Specifications

## Component Inventory

### 1. Layout Components

#### `AppShell`
**Purpose:** Root layout wrapper
**Props:**
- `children: ReactNode`

**Structure:**
```
<AppShell>
  <Header />
  <MainLayout>
    <InputPanel />
    <PreviewPanel />
  </MainLayout>
</AppShell>
```

---

#### `Header`
**Purpose:** Top navigation bar
**Props:** None

**Visual Spec:**
- Height: 60px
- Background: `--bg-primary` (white)
- Border-bottom: 1px solid `--border-light`
- Position: Sticky top
- Z-index: `--z-sticky`

**Content:**
- Left: Logo (wordmark "SlideTheory" in `--font-semibold`, `--text-xl`)
- Right: Icon buttons for Help (?) and Settings (gear)

**CSS:**
```css
.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}
```

---

#### `MainLayout`
**Purpose:** Split panel container
**Props:**
- `leftPanel: ReactNode`
- `rightPanel: ReactNode`

**Responsive Behavior:**
- Desktop: `display: grid; grid-template-columns: 400px 1fr;`
- Tablet: `grid-template-columns: 320px 1fr;`
- Mobile: `display: flex; flex-direction: column;`

**CSS:**
```css
.main-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  min-height: calc(100vh - 60px);
}

@media (min-width: 1280px) {
  .main-layout {
    grid-template-columns: var(--sidebar-width-lg) 1fr;
  }
}

@media (max-width: 767px) {
  .main-layout {
    display: flex;
    flex-direction: column;
  }
}
```

---

#### `InputPanel`
**Purpose:** Form container with scroll
**Props:**
- `children: ReactNode`

**Visual Spec:**
- Background: `--bg-primary` (white)
- Padding: `--space-6`
- Border-right: 1px solid `--border-light`
- Overflow-y: auto
- Max-width: 100%

---

#### `PreviewPanel`
**Purpose:** Slide preview container
**Props:**
- `slide: SlideData | null`
- `isLoading: boolean`
- `onRegenerate: () => void`
- `onDownload: (format: string) => void`

**Visual Spec:**
- Background: `--bg-secondary` (light gray)
- Padding: `--space-8`
- Display: flex, center content

---

### 2. Form Components

#### `FormSection`
**Purpose:** Group related form fields
**Props:**
- `title: string`
- `description?: string`
- `children: ReactNode`
- `required?: boolean`

**Visual Spec:**
- Margin-bottom: `--space-6`
- Title: `--text-sm`, `--font-semibold`, `--text-primary`
- Description: `--text-xs`, `--text-secondary`, margin-top `--space-1`
- Required indicator: Red asterisk

---

#### `Select`
**Purpose:** Dropdown for single selection
**Props:**
- `label: string`
- `value: string`
- `options: Array<{value, label, icon?}>`
- `onChange: (value) => void`
- `placeholder?: string`
- `required?: boolean`
- `error?: string`

**Visual Spec:**
- Height: 44px
- Padding: 0 `--space-4`
- Border: 1px solid `--border-default`
- Border-radius: `--radius-md`
- Background: `--bg-primary`
- Font-size: `--text-sm`

**States:**
- Default: border `--border-default`
- Hover: border `--color-gray-300`
- Focus: border `--border-focus`, box-shadow `--shadow-focus`
- Error: border `--color-error-500`, background `--color-error-50`
- Disabled: opacity 0.6, cursor not-allowed

**CSS:**
```css
.select {
  height: 44px;
  padding: 0 var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  font-size: var(--text-sm);
  width: 100%;
  appearance: none;
  background-image: url("chevron-down.svg");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.select:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.select--error {
  border-color: var(--color-error-500);
  background-color: var(--color-error-50);
}
```

---

#### `TextArea`
**Purpose:** Multi-line text input
**Props:**
- `label: string`
- `value: string`
- `onChange: (value) => void`
- `placeholder?: string`
- `required?: boolean`
- `maxLength?: number`
- `rows?: number` (default: 4)
- `error?: string`

**Visual Spec:**
- Min-height: calc(44px * rows)
- Padding: `--space-3` `--space-4`
- Border: 1px solid `--border-default`
- Border-radius: `--radius-md`
- Font-size: `--text-sm`
- Line-height: `--leading-relaxed`
- Resize: vertical only

**Features:**
- Auto-resize option (grows with content)
- Character counter in bottom-right
- Placeholder text in `--text-tertiary`

**CSS:**
```css
.textarea {
  min-height: calc(44px * var(--rows, 4));
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  width: 100%;
  resize: vertical;
  font-family: var(--font-sans);
}

.textarea::placeholder {
  color: var(--text-tertiary);
}

.textarea:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}
```

---

#### `Button`
**Purpose:** Action trigger
**Props:**
- `variant: 'primary' | 'secondary' | 'ghost' | 'danger'`
- `size: 'sm' | 'md' | 'lg'` (default: md)
- `children: ReactNode`
- `onClick?: () => void`
- `disabled?: boolean`
- `loading?: boolean`
- `icon?: ReactNode` (left-aligned)
- `fullWidth?: boolean`

**Visual Spec - Primary:**
- Background: `--color-accent-600`
- Color: `--text-inverse` (white)
- Border: none
- Hover: background `--color-accent-700`
- Active: background `--color-accent-800`

**Visual Spec - Secondary:**
- Background: `--bg-primary`
- Color: `--text-primary`
- Border: 1px solid `--border-default`
- Hover: background `--bg-secondary`

**Visual Spec - Ghost:**
- Background: transparent
- Color: `--text-secondary`
- Border: none
- Hover: background `--bg-secondary`

**Sizes:**
- sm: height 32px, padding 0 `--space-3`, font `--text-xs`
- md: height 44px, padding 0 `--space-4`, font `--text-sm`
- lg: height 56px, padding 0 `--space-6`, font `--text-base`

**Loading State:**
- Spinner replaces icon or appears left of text
- Disabled interaction
- Maintains layout (no size change)

**CSS:**
```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
}

.button--primary {
  background: var(--color-accent-600);
  color: var(--text-inverse);
}

.button--primary:hover:not(:disabled) {
  background: var(--color-accent-700);
}

.button--md {
  height: 44px;
  padding: 0 var(--space-4);
  font-size: var(--text-sm);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

---

#### `GenerateButton`
**Purpose:** Primary CTA with special styling
**Props:**
- `onClick: () => void`
- `loading: boolean`
- `disabled: boolean`

**Visual Spec:**
- Extends Button (primary, lg, fullWidth)
- Lightning bolt icon (animated when generating)
- Gradient background option: `linear-gradient(135deg, var(--color-accent-600), var(--color-accent-500))`
- Subtle shadow: `--shadow-md`

**Loading Animation:**
- Spinner rotates
- Text: "Generating..." → "Analyzing context..." → "Designing slide..." → "Finalizing..."

---

### 3. Display Components

#### `SlidePreview`
**Purpose:** Render generated slide
**Props:**
- `imageUrl: string`
- `aspectRatio: '16:9' | '4:3'` (default: 16:9)
- `onZoom?: () => void`

**Visual Spec:**
- Maintains aspect ratio via padding-bottom trick
- Max-width: 100% of container
- Background: white (slide background)
- Shadow: `--shadow-xl` to lift off page
- Border-radius: `--radius-lg`

**Empty State:**
- Dashed border container
- Icon: Document/slide outline
- Text: "Your slide will appear here"

**CSS:**
```css
.slide-preview {
  position: relative;
  width: 100%;
  max-width: 960px; /* 16:9 at reasonable size */
  margin: 0 auto;
}

.slide-preview__aspect {
  padding-bottom: 56.25%; /* 16:9 ratio */
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.slide-preview__image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.slide-preview--empty {
  border: 2px dashed var(--border-default);
  background: transparent;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: var(--space-4);
}
```

---

#### `ActionBar`
**Purpose:** Slide action controls
**Props:**
- `onRegenerate: () => void`
- `onDownload: (format: string) => void`
- `isGenerating: boolean`

**Visual Spec:**
- Position: Below slide preview
- Layout: Flex, center, gap `--space-3`
- Background: Transparent
- Margin-top: `--space-6`

**Buttons:**
- Regenerate: Secondary variant, circular arrow icon
- Download: Primary variant, download icon + "Download"
- Format select: Dropdown (PNG / PDF / PPTX)

---

#### `FormatSelect`
**Purpose:** Export format selector
**Props:**
- `value: string`
- `onChange: (format) => void`
- `options: string[]`

**Visual Spec:**
- Small select, `--text-xs`
- Attached to download button (button group style)

---

### 4. Feedback Components

#### `LoadingOverlay`
**Purpose:** Indicate loading state on preview
**Props:**
- `isVisible: boolean`
- `message?: string`
- `progress?: number` (optional)

**Visual Spec:**
- Position: Absolute, cover parent
- Background: rgba(255,255,255,0.8)
- Backdrop-filter: blur(2px)
- Centered spinner + text

**CSS:**
```css
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  border-radius: var(--radius-lg);
}
```

---

#### `Spinner`
**Purpose:** Loading indicator
**Props:**
- `size: 'sm' | 'md' | 'lg'` (default: md)
- `color?: string`

**Visual Spec:**
- SVG circle with stroke-dasharray animation
- Sizes: sm (16px), md (24px), lg (32px)
- Color: `--color-accent-600` or currentColor

**CSS:**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

---

#### `Alert`
**Purpose:** Display error or info messages
**Props:**
- `variant: 'error' | 'warning' | 'info' | 'success'`
- `title?: string`
- `message: string`
- `onDismiss?: () => void`

**Visual Spec:**
- Padding: `--space-4`
- Border-radius: `--radius-md`
- Border-left: 4px solid (variant color)
- Background: variant color at 5% opacity

**Error Variant:**
- Border-color: `--color-error-500`
- Background: `--color-error-50`
- Icon: Alert circle

**CSS:**
```css
.alert {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--border-color);
  background: var(--bg-color);
}

.alert--error {
  --border-color: var(--color-error-500);
  --bg-color: var(--color-error-50);
}
```

---

#### `InlineError`
**Purpose:** Field-level error message
**Props:**
- `message: string`

**Visual Spec:**
- Margin-top: `--space-1`
- Font-size: `--text-xs`
- Color: `--color-error-600`
- Icon: Alert circle (12px)

---

#### `Toast`
**Purpose:** Temporary success notification
**Props:**
- `message: string`
- `duration?: number` (default: 3000ms)
- `onDismiss: () => void`

**Visual Spec:**
- Position: Fixed, bottom-right
- Background: `--color-gray-900`
- Color: `--text-inverse`
- Padding: `--space-4`
- Border-radius: `--radius-lg`
- Shadow: `--shadow-xl`
- Animation: Slide up + fade in

---

### 5. Icon Components

All icons are 24x24px SVG, stroke-width 2px.

**Required Icons:**
- `Lightning` - Generate action
- `RefreshCw` - Regenerate
- `Download` - Download
- `HelpCircle` - Help
- `Settings` - Settings
- `ChevronDown` - Dropdown indicator
- `AlertCircle` - Error/warning
- `Check` - Success
- `X` - Close/dismiss
- `FileText` - Slide/document placeholder

---

## Component Hierarchy

```
AppShell
├── Header
│   └── Logo, IconButtons
├── MainLayout
│   ├── InputPanel
│   │   └── Form
│   │       ├── FormSection x5
│   │       │   ├── Select (SlideType, Audience, Framework)
│   │       │   └── TextArea (Context, DataPoints)
│   │       └── GenerateButton
│   └── PreviewPanel
│       ├── SlidePreview
│       │   ├── LoadingOverlay (conditional)
│       │   └── SlideImage | EmptyState
│       └── ActionBar
│           ├── Button (Regenerate)
│           ├── FormatSelect
│           └── Button (Download)
└── Toast (portal, conditional)
```

---

## Form Validation States

### Field Validation Rules

| Field | Required | Validation | Error Message |
|-------|----------|------------|---------------|
| Slide Type | Yes | Not empty | "Please select a slide type" |
| Context | Yes | Min 10 chars | "Please provide more context (at least 10 characters)" |
| Context | Yes | Max 500 chars | "Context must be under 500 characters" |
| Data Points | No | Max 1000 chars | "Data points must be under 1000 characters" |
| Audience | Yes | Not empty | "Please select an audience" |
| Framework | No | - | - |

### Form Submission
- Validate all required fields
- Show inline errors on invalid fields
- Scroll to first error
- Disable submit until valid
