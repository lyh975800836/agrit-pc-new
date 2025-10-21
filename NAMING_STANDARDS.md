# CSS & DOM Naming Standards Guide

## Current State Analysis

### Problem 1: Generic Class Names in DashboardLayout.vue

**Current (BAD):**
```vue
<div class="page flex-col" :class="layoutClasses">
  <div class="group_2 flex-col">
    <DashboardHeader />
    
    <div class="group_4 flex-row">
      <div class="panel-shell panel-shell--left">
        <div class="panel-content left-panel-container">
          <slot name="left-panel"></slot>
        </div>
      </div>
      
      <div class="group_5 flex-grow">
        <div class="section_1 center-content">
          <slot name="center-map"></slot>
        </div>
      </div>
      
      <div class="panel-shell panel-shell--right">
        <!-- ... -->
      </div>
    </div>
    
    <div class="bottom-navigation">
      <!-- ... -->
    </div>
  </div>
</div>
```

**Why It's Bad:**
- `.group_2`, `.group_4`, `.group_5` - What do these represent?
- `.section_1` - Is this generic naming? Why underscore?
- No semantic meaning from class names
- Hard to maintain and search

**Improved (GOOD):**
```vue
<div class="dashboard-page flex-col" :class="layoutClasses">
  <div class="dashboard-wrapper flex-col">
    <DashboardHeader />
    
    <div class="dashboard-panels flex-row">
      <div class="dashboard-sidebar dashboard-sidebar--left">
        <div class="dashboard-sidebar__content">
          <slot name="left-panel"></slot>
        </div>
      </div>
      
      <div class="dashboard-map-area flex-grow">
        <div class="dashboard-map-container center-content">
          <slot name="center-map"></slot>
        </div>
      </div>
      
      <div class="dashboard-sidebar dashboard-sidebar--right">
        <!-- ... -->
      </div>
    </div>
    
    <nav class="dashboard-bottom-nav">
      <!-- ... -->
    </nav>
  </div>
</div>
```

**Benefits:**
- Clear semantic meaning
- Easy to search and maintain
- Follows BEM convention
- Self-documenting code

---

### Problem 2: Image Import Inconsistency

**Current State - Two Methods:**

#### Method A: Using imageMixin (GOOD)
```javascript
// DashboardHeader.vue
import imageMixin from '@/mixins/imageMixin'

export default {
  name: 'DashboardHeader',
  mixins: [imageMixin],
  // ...
}

// Template
<img :src="getImagePath('HEADER', 'WEATHER_ICON')" alt="天气图标" />
<div :style="getHeaderImageStyle('BACKGROUND')"></div>
```

**Advantages:**
- Centralized in imageManager.js
- Type-safe with category/name
- Easy to change paths globally
- Includes error handling
- Supports preloading

#### Method B: Local Object (BAD)
```javascript
// RightRankingPanel.vue
const images = {
    rankingPanelBg: '/images/ranking-panel-bg.png',
    productionRankingHeader: '/images/production-ranking-header.png',
    teamRankingHeader: '/images/team-ranking-header.png',
    productionUnderline: '/images/production-underline.png',
    teamUnderline: '/images/team-underline.png',
    // ... 20+ more
};

export default {
    data() {
        return { images };
    }
}

// Template
<div :style="{ backgroundImage: `url(${images.rankingPanelBg})` }">
```

**Disadvantages:**
- Duplicated image paths
- No centralized management
- No validation
- Inconsistent naming (camelCase)
- Local maintenance burden

**Migration Path:**

```javascript
// Step 1: Add to imageManager.js
export const IMAGES = {
  // ... existing
  RIGHT_PANEL: {
    // ... existing
    RANKING_BG: `${IMAGE_BASE_PATH}ranking-panel-bg.png`,
    PRODUCTION_HEADER: `${IMAGE_BASE_PATH}production-ranking-header.png`,
    TEAM_HEADER: `${IMAGE_BASE_PATH}team-ranking-header.png`,
    PRODUCTION_UNDERLINE: `${IMAGE_BASE_PATH}production-underline.png`,
    TEAM_UNDERLINE: `${IMAGE_BASE_PATH}team-underline.png`,
    // ... etc
  }
}

// Step 2: Update RightRankingPanel.vue
import imageMixin from '@/mixins/imageMixin'

export default {
    name: 'RightRankingPanel',
    mixins: [imageMixin],
    // Remove: const images = { ... }
    // Remove: data() { return { images } }
}

// Step 3: Update template
<!-- Before -->
<div :style="{ backgroundImage: `url(${images.rankingPanelBg})` }">

<!-- After -->
<div :style="getBackgroundImageStyle(getImagePath('RIGHT_PANEL', 'RANKING_BG'))">
```

---

## CSS Class Naming Conventions

### BEM Pattern (Recommended for Components)

**Structure:** `.block--modifier__element`

```less
// Block
.dashboard-panel { }

// Block with modifier
.dashboard-panel--primary { }
.dashboard-panel--secondary { }
.dashboard-panel--small { }

// Block element
.dashboard-panel__header { }
.dashboard-panel__content { }
.dashboard-panel__footer { }

// Block element with modifier
.dashboard-panel__header--sticky { }
.dashboard-panel__content--scrollable { }
```

**Good Examples in Project:**
```less
// StatCard.vue
.stat-card { }
.stat-card--small { }
.stat-card__number { }
.stat-card__trend { }
.stat-card__trend-icon { }
.stat-card__label { }

// RightRankingPanel.vue
.ranking-item { }
.ranking-item.first { }
.quality-item { }
.quality-item.good { }
```

### Utility Classes (Recommended for global.less)

```less
// Layout
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }

// Spacing
.m-4 { margin: var(--space-4); }
.p-6 { padding: var(--space-6); }
.gap-2 { gap: var(--space-2); }

// Display
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }

// State
.is-active { /* specific styling */ }
.is-disabled { opacity: 0.5; }
.has-error { border-color: var(--color-error); }
```

### State Modifiers

Use consistent prefixes for states:

```less
// ✓ Good
.is-active { }
.is-disabled { }
.is-loading { }
.is-hidden { }
.has-error { }
.has-success { }

// ✗ Avoid
.active { }  // Ambiguous: is it applied or a property?
.disabled { }
.error { }
```

### Naming Guidelines

| Context | Pattern | Example | Notes |
|---------|---------|---------|-------|
| Block/Component | kebab-case | `.dashboard-panel` | Main container |
| Modifier | `--kebab-case` | `.dashboard-panel--primary` | Variant of block |
| Element | `__kebab-case` | `.dashboard-panel__header` | Child element |
| State | `is-` or `has-` | `.is-active`, `.has-error` | Boolean state |
| Utility | kebab-case | `.flex-row`, `.gap-4` | Single purpose |

### Naming Anti-Patterns

| Anti-Pattern | Why Bad | Fix |
|--------------|--------|-----|
| `.group_2`, `.section_1` | No semantic meaning | `.dashboard-panel`, `.map-area` |
| `.item` | Too generic | `.ranking-item`, `.data-item` |
| `.container` | Ambiguous | `.dashboard-wrapper`, `.panel-container` |
| `.wrapper-wrapper` | Redundant nesting | `.dashboard-panel` |
| `.float-left` (property as class) | Not semantic | `.sidebar--left` |
| Single letter | `.p`, `.m`, `.d` | Use full words: `.paragraph`, `.margin` |

---

## Image Naming Conventions

### In imageManager.js

```javascript
// ✓ Good
export const IMAGES = {
  HEADER: {
    BACKGROUND: '/images/header-background.png',
    WEATHER_ICON: '/images/weather-icon.png',
    CENTER_DECORATION_BG: '/images/center-decoration-bg.png',
  },
  LEFT_PANEL: {
    BACKGROUND: '/images/left-panel-bg.png',
    TITLE_UNDERLINE: '/images/title-underline.png',
    BLOCK_COUNT_CARD: '/images/block-count-card.png',
  }
}

// ✗ Bad
export const IMAGES = {
  headerBg: '/images/header-background.png',  // camelCase
  icon1: '/images/weather-icon.png',          // vague
  panel_bg: '/images/left-panel-bg.png',      // snake_case
}
```

### Category Organization

```javascript
// Well-organized by semantic category
HEADER: { }           // Header components
LEFT_PANEL: { }       // Left sidebar
RIGHT_PANEL: { }      // Right sidebar
POPUP: { }            // Modal/dialog
CHARTS: { }           // Chart components
MAPS: { }             // Map overlays
MARKERS: { }          // Map markers
```

---

## Implementation Checklist

### Phase 1: DashboardLayout.vue (Priority 1)
- [ ] Rename `.group_2` → `.dashboard-wrapper`
- [ ] Rename `.group_4` → `.dashboard-panels`
- [ ] Rename `.group_5` → `.dashboard-map-area`
- [ ] Rename `.section_1` → `.dashboard-map-container`
- [ ] Update `.panel-shell` → `.dashboard-sidebar`
- [ ] Update `.panel-content` → `.dashboard-sidebar__content`
- [ ] Update `.bottom-navigation` → `.dashboard-bottom-nav`
- [ ] Update CSS class references
- [ ] Test layout on desktop and tablet

### Phase 2: RightRankingPanel.vue (Priority 1)
- [ ] Add images to imageManager.js RIGHT_PANEL category
- [ ] Remove local `const images = { }`
- [ ] Add `mixins: [imageMixin]`
- [ ] Replace all `images.xxx` with `getImagePath('RIGHT_PANEL', 'XXX')`
- [ ] Replace all `:style="{ backgroundImage: ... }"` with mixin calls
- [ ] Remove empty CSS blocks for `.production-ranking` and `.team-ranking`
- [ ] Test all image loading

### Phase 3: Global Review (Priority 2)
- [ ] Audit all components for generic class names
- [ ] Add ARIA attributes to interactive elements
- [ ] Remove duplicate utility definitions from scoped styles
- [ ] Document findings in component

---

## Before/After Examples

### Example 1: Generic Names

```vue
<!-- BEFORE -->
<template>
  <div class="group_2">
    <div class="group_4">
      <div class="group_5">
        <div class="section_1">Content</div>
      </div>
    </div>
  </div>
</template>

<style>
.group_2 { display: flex; flex-direction: column; }
.group_4 { display: flex; flex-direction: row; flex: 1; }
.group_5 { display: flex; flex: 1; }
.section_1 { display: flex; flex: 1; }
</style>

<!-- AFTER -->
<template>
  <div class="dashboard-wrapper">
    <div class="dashboard-panels">
      <div class="dashboard-map-area">
        <div class="dashboard-map-container">Content</div>
      </div>
    </div>
  </div>
</template>

<style>
.dashboard-wrapper { .flex-col(); }
.dashboard-panels { .flex-row(); flex: 1; }
.dashboard-map-area { flex: 1; }
.dashboard-map-container { flex: 1; }
</style>
```

### Example 2: Image Import

```vue
<!-- BEFORE -->
<script>
const images = {
  bg: '/images/panel-bg.png',
  icon: '/images/icon.png',
};

export default {
  data() { return { images }; }
}
</script>

<template>
  <div :style="{ backgroundImage: `url(${images.bg})` }">
    <img :src="images.icon" />
  </div>
</template>

<!-- AFTER -->
<script>
import imageMixin from '@/mixins/imageMixin'

export default {
  mixins: [imageMixin]
}
</script>

<template>
  <div :style="getBackgroundImageStyle(getImagePath('LEFT_PANEL', 'BACKGROUND'))">
    <img :src="getImagePath('LEFT_PANEL', 'TITLE_ICON')" />
  </div>
</template>
```

---

## Resources

- **CSS Naming:** [BEM Methodology](http://getbem.com/)
- **Design Tokens:** `/src/styles/abstracts/variables.less`
- **Mixins:** `/src/styles/abstracts/mixins.less`
- **Image Manager:** `/src/utils/imageManager.js`
- **Image Mixin:** `/src/mixins/imageMixin.js`

---

## Questions?

Create an issue or ask in the team chat if you have questions about these standards.
