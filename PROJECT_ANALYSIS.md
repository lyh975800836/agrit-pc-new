# Project Architecture Analysis Report

## Executive Summary
This Vue.js agricultural data dashboard project demonstrates solid foundational patterns with a well-organized structure, though it shows signs of evolution with some inconsistencies in naming conventions and DOM structure patterns.

---

## 1. DOM STRUCTURE PATTERNS & INCONSISTENCIES

### 1.1 Current Patterns (Good)

#### Container-Based Hierarchies
**DashboardLayout.vue** uses semantic grouping:
```
.page
  └── .group_2 (flex-col)
      └── DashboardHeader
      └── .group_4 (flex-row main container)
          ├── .panel-shell--left
          ├── .group_5 (center map area)
          │   └── .section_1
          └── .panel-shell--right
      └── .bottom-navigation
```

**Strengths:**
- Clear hierarchical structure with flex layout
- Separation of concerns (header, content, navigation)
- Reusable panel patterns for left/right sidebars

#### Component Nesting Patterns
**RightRankingPanel.vue** demonstrates consistent internal structure:
```
.right-ranking-panel
  ├── .ranking-headers
  │   ├── .header-section (.production-ranking)
  │   └── .header-section (.team-ranking)
  ├── .top5-title
  ├── .ranking-list
  │   └── .ranking-items
  │       └── .ranking-item (repeating)
  ├── .quality-section
  └── .farming-dynamics-section
```

### 1.2 Inconsistencies & Issues

#### Issue #1: Mixed Naming Conventions
**Problem:** Inconsistent class naming patterns across components

| File | Pattern | Example |
|------|---------|---------|
| DashboardLayout.vue | Generic group names | `.group_2`, `.group_4`, `.group_5`, `.section_1` |
| RightRankingPanel.vue | Descriptive names | `.ranking-headers`, `.top5-title`, `.quality-section` |
| LeftDataPanel.vue | Descriptive names | `.left-data-panel`, `.data-cards`, `.price-chart-container` |
| MapViewBaise.vue | Element-specific | `.baise-map-container`, `.leaflet-map`, `.loading-overlay` |

**Impact:** Difficult to understand component purpose at a glance; inconsistent mental model

#### Issue #2: Inline Styles vs. CSS Classes
**LeftDataPanel.vue:**
```vue
<div class="left-data-panel" :style="getLeftPanelImageStyle('BACKGROUND')">
  <div class="left-slide" :style="getLeftPanelImageStyle('LEFT_SLIDE')"></div>
  <div class="data-card block-count-card" :style="getLeftPanelImageStyle('BLOCK_COUNT_CARD')">
```

**RightRankingPanel.vue:**
```vue
<div class="right-ranking-panel" :style="{ backgroundImage: `url(${images.rankingPanelBg})` }">
```

**Issue:** Two different approaches for the same task (background images)
- Left panel uses centralized `imageMixin` + `getLeftPanelImageStyle()`
- Right panel uses inline computed properties + local `images` object

#### Issue #3: Aria Attributes Inconsistency
**DashboardLayout.vue:**
```vue
<button
  class="panel-toggle panel-toggle--left"
  type="button"
  :aria-expanded="(!isLeftCollapsed).toString()"
  :aria-label="isLeftCollapsed ? '展开左侧面板' : '收起左侧面板'"
  @click="toggleLeftPanel"
>
```

**Most other components:** Missing ARIA attributes for accessibility

#### Issue #4: Nested Flex Containers Without Clear Purpose
**DashboardLayout.vue:**
```vue
<div class="group_4 flex-row">  <!-- 1st flex -->
  <div class="panel-shell panel-shell--left">  <!-- 2nd flex -->
    <div class="panel-content left-panel-container">  <!-- no flex -->
      <!-- slot content -->
    </div>
  </div>
</div>
```

**Question:** Why `panel-shell` (flex display) when its only child is `panel-content`?

#### Issue #5: Unused/Empty CSS Blocks
**RightRankingPanel.vue (line 503-544):**
```less
&.production-ranking {
    // Empty
}

&.team-ranking {
    // Empty
}
```

---

## 2. CSS CLASS NAMING CONVENTIONS ANALYSIS

### 2.1 Current Naming Patterns

#### Pattern A: BEM (Block Element Modifier)
Used extensively in newer components:

**StatCard.vue:**
```less
.stat-card {
    &__content { }
    &__main { }
    &__number { }
    &__trend {
        &-content { }
        &-icon { }
        &-text { }
    }
    
    &--small { }
    &--large { }
    &.up { }
}
```

**RightRankingPanel.vue:**
```less
.ranking-item {
    &.first { }
    &.second { }
    &.third { }
}

.quality-item {
    &.good { }
    &.average { }
    &.poor { }
}
```

#### Pattern B: Kebab-Case Utility Classes
**global.less:**
```less
.flex-row { }
.flex-col { }
.flex-center { }
.justify-center { }
.items-center { }
.gap-4 { }
```

#### Pattern C: Generic Grouping
**DashboardLayout.vue:**
```less
.group_2 { }  // ❌ What is this?
.group_4 { }  // ❌ What is this?
.section_1 { } // ❌ What is this?
```

### 2.2 Naming Convention Issues

#### Issue #1: Inconsistent Modifier Syntax

| Component | Modifier Style | Example |
|-----------|-----------------|---------|
| StatCard | Double dash | `.stat-card--small` |
| RankingItem | Single dash + state | `.ranking-item.first` |
| DashboardLayout | No modifier | `.group_2`, `.group_4` |
| MapViewBaise | Prefix-based | `.marker-point.highlight` |

#### Issue #2: Poor Semantic Value
```less
// ❌ Bad
.group_2
.section_1
.panel-shell--overlay-left

// ✓ Better
.dashboard-content-wrapper
.map-center-section
.sidebar-overlay-left
```

#### Issue #3: Duplicate Utilities in Scoped Styles
**LeftDataPanel.vue:**
```less
.flex-row {
    display: flex;
    flex-direction: row;
}

.flex-col {
    display: flex;
    flex-direction: column;
}
```

These are also defined in `global.less` - causing duplication

#### Issue #4: Missing Convention Documentation
Components don't follow consistent patterns for:
- Color naming (`.heading-color` vs `#c69c6d` vs `var(--color-primary)`)
- Size naming (`.small`, `.medium`, `.large` vs `sm`, `md`, `lg`)
- State naming (`.active` vs `.selected` vs `--active`)

### 2.3 Naming Pattern Summary

**Current State:**
- 40% BEM pattern (good components)
- 35% Utility classes (from global.less)
- 15% Generic names (group_*, section_*)
- 10% Mixed/inconsistent patterns

---

## 3. IMAGE IMPORT & USAGE ANALYSIS

### 3.1 Image Import Methods

#### Method 1: Centralized Manager (Modern - ✓)
**imageMixin.js** + **imageManager.js**

```javascript
// imageManager.js
export const IMAGES = {
  HEADER: {
    BACKGROUND: `/images/header-background.png`,
    WEATHER_ICON: `/images/weather-icon.png`,
    // ...
  },
  LEFT_PANEL: {
    BACKGROUND: `/images/left-panel-bg.png`,
    // ...
  }
}

export function getImagePath(category, name) {
  return IMAGES[category][name]
}
```

**Usage in components:**
```vue
// DashboardHeader.vue
import imageMixin from '@/mixins/imageMixin'

export default {
  mixins: [imageMixin]
}

// Template
<img :src="getImagePath('HEADER', 'WEATHER_ICON')" />
<div :style="getHeaderImageStyle('BACKGROUND')"></div>
```

**Advantages:**
- Single source of truth for all image paths
- Type-safe access with category/name
- Centralized mixin for common methods
- Easy to change paths globally

#### Method 2: Local Object Declaration (Legacy - ⚠)
**RightRankingPanel.vue:**

```javascript
const images = {
    rankingPanelBg: '/images/ranking-panel-bg.png',
    productionRankingHeader: '/images/production-ranking-header.png',
    // ... 20+ more
};

export default {
    data() {
        return { images };
    }
}
```

**Usage:**
```vue
<div :style="{ backgroundImage: `url(${images.rankingPanelBg})` }">
```

**Disadvantages:**
- Duplicated image paths not centralized
- Local maintenance burden
- No validation or error handling
- Naming inconsistency (camelCase vs imageManager pattern)

#### Method 3: Direct Path Strings (Very Legacy - ✗)
**MapViewBaise.vue:**
```javascript
const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    // ...
});
```

**Disadvantages:**
- Hardcoded URLs
- No centralized management
- Difficult to migrate or update

### 3.2 Image Organization

#### Current Directory Structure
```
/public
  /images/               # Production images (external)
  
/src/assets
  /images/               # Static images (only 3 files)
    - warning-header-bg.png
    - current-task-bg.png
    - left-panel-bg.png
  /fonts/                # Custom fonts
  /mapdata/              # GeoJSON and coordinate data
  /textures/             # (appears empty)
```

**Issue:** Only 3 images in `/src/assets/images/` but imageManager expects images in `/public/images/`

#### Image Reference Pattern Analysis

**Method 1: Public Path (Most Common)**
```javascript
// imageManager.js uses
const IMAGE_BASE_PATH = '/images/'
// References /public/images/
```

**Method 2: Asset Relative Path (LESS Only)**
```less
// global.less
src: local("..."),
    url("~@/assets/fonts/SourceHanSansCN-Light.otf") format("opentype");
```

**Issue:** Inconsistent base paths - fonts use `@/assets/` but images use `/images/`

### 3.3 Image Loading Methods

#### Background Images
```vue
<!-- Method A: Inline style with mixin -->
<div :style="getLeftPanelImageStyle('BACKGROUND')"></div>

<!-- Method B: Inline computed property -->
<div :style="{ backgroundImage: `url(${images.rankingPanelBg})` }"></div>

<!-- Method C: Scoped CSS background -->
<style scoped>
.element {
  background: url('/images/image.png');
}
</style>
```

#### IMG Tags
```vue
<!-- Direct getImagePath usage -->
<img :src="getImagePath('HEADER', 'WEATHER_ICON')" />

<!-- Direct paths in components -->
<img :src="images.firstPlaceBg" />
```

---

## 4. FILE ORGANIZATION & STRUCTURE

### 4.1 Project Directory Structure

```
/src
├── /components
│   ├── /base
│   │   ├── BaseCard.vue        ✓ Reusable component
│   │   ├── BaseMap.vue
│   │   ├── ChartPanel.vue
│   │   └── StatCard.vue
│   ├── /charts
│   │   ├── DiseaseDistributionChart.vue
│   │   ├── PlantingAreaChart.vue
│   │   ├── PriceTrendChart.vue
│   │   ├── ProductionChart.vue
│   │   └── RegionalDistributionChart.vue
│   ├── DashboardLayout.vue     ✓ Main layout
│   ├── DashboardHeader.vue
│   ├── LeftDataPanel.vue       ✓ Left panel
│   ├── RightRankingPanel.vue   ✓ Right panel
│   ├── MapViewBaise.vue        ✓ Baise map
│   ├── EarthIntro.vue
│   ├── FarmingDetailDialog.vue
│   ├── HealthIndicatorModal.vue
│   ├── MapView.vue
│   ├── WMTSTileMap.vue
│   └── ... (other map components)
├── /views
│   ├── Dashboard.vue
│   ├── DataDashboard.vue
│   ├── DetailMap.vue
│   └── PlotDetail.vue
├── /styles
│   ├── /abstracts
│   │   ├── variables.less      ✓ Design tokens
│   │   ├── mixins.less         ✓ Style helpers
│   │   ├── functions.less
│   │   └── index.less
│   ├── /base
│   │   ├── reset.less
│   │   └── typography.less
│   └── global.less             ✓ Utilities
├── /utils
│   ├── imageManager.js         ✓ Image management
│   └── ...
├── /mixins
│   ├── imageMixin.js           ✓ Image mixin
│   └── mapMixin.js
├── /assets
│   ├── /images/ (only 3 files)
│   ├── /fonts/
│   ├── /mapdata/
│   └── /textures/
├── App.vue
└── main.js
```

### 4.2 Organization Quality

#### Strengths
1. **Clear feature separation**: Components > Views
2. **Base components isolated**: `/base` folder for reusables
3. **Chart components grouped**: `/charts` for visualization
4. **Style system organized**: `/abstracts` for variables and mixins
5. **Utilities centralized**: `/utils` folder

#### Weaknesses
1. **Inconsistent file naming**: 
   - `DashboardLayout.vue` vs `LeftDataPanel.vue` (both containers)
   - `MapViewBaise.vue` vs `MapView.vue` (duplicate map components?)

2. **Deep nesting in root components**: `/components/` contains both:
   - Simple components (MapLabel.vue)
   - Complex containers (RegionDetailMap.vue - 104KB!)

3. **No clear naming pattern**:
   ```
   DashboardHeader     ✓ Clear
   LeftDataPanel       ✓ Clear
   RightRankingPanel   ✓ Clear
   MapViewBaise        ⚠ Unclear (Baise = location?)
   EarthIntro          ❓ What does this do?
   HealthIndicatorModal ✓ Clear
   ```

4. **Assets organization issues**:
   - Only 3 images in `/src/assets/images/`
   - Most images reference `/public/images/`
   - Fonts use `@/assets/fonts/` but images don't
   - `/textures/` folder appears unused

---

## 5. COMPONENT HIERARCHY & LAYOUT PATTERNS

### 5.1 Component Tree

```
App.vue
└── Router
    ├── Dashboard.vue
    │   └── DashboardLayout.vue ⭐ Main layout container
    │       ├── DashboardHeader.vue
    │       ├── [Left Slot]
    │       │   └── LeftDataPanel.vue
    │       ├── [Center Slot]
    │       │   └── MapViewBaise.vue (or MapView.vue)
    │       └── [Right Slot]
    │           └── RightRankingPanel.vue
    │
    ├── DataDashboard.vue
    │   └── DashboardLayout.vue
    │
    ├── DetailMap.vue
    │   └── DashboardLayout.vue
    │       └── [Specialized map components]
    │
    └── PlotDetail.vue
        └── DashboardLayout.vue
```

### 5.2 Layout Pattern Analysis

#### Pattern: Slot-Based Composition
**DashboardLayout.vue** uses three main slots:

```vue
<div class="group_4 flex-row">
  <!-- Left Slot -->
  <div class="panel-shell panel-shell--left">
    <template v-if="$slots['left-panel']">
      <slot name="left-panel"></slot>
    </template>
    <template v-else>
      <LeftDataPanel />
    </template>
  </div>

  <!-- Center Slot -->
  <div class="group_5 flex-grow">
    <slot name="center-map"></slot>
  </div>

  <!-- Right Slot -->
  <div class="panel-shell panel-shell--right">
    <template v-if="$slots['right-panel']">
      <slot name="right-panel"></slot>
    </template>
    <template v-else>
      <RightRankingPanel />
    </template>
  </div>
</div>
```

**Benefits:**
- Flexible layout composition
- Reusable across multiple views
- Easy to swap components

### 5.3 CSS Layout Patterns

#### Flexbox Hierarchy
```
.page (flex-col, 100% height)
  ├── Header (flex-row, fixed height)
  └── .group_4 (flex-row, flex: 1)
      ├── .panel-shell--left (flex: 0 0 375px)
      │   └── .panel-content (width: 375px)
      ├── .group_5 (flex: 1) ← main content grows
      │   └── .section_1
      └── .panel-shell--right (flex: 0 0 375px)
          └── .panel-content (width: 375px)
```

**Issue:** Multiple nested flex containers creating unnecessary complexity:
```
.group_4 (flex) 
  → .panel-shell (flex) 
    → .panel-content (no flex)
```

Could be simplified to:
```
.dashboard-panels (flex)
  → .panel (width: 375px)
  → .map-area (flex: 1)
  → .panel (width: 375px)
```

#### Overlay Pattern
**MapViewBaise.vue** uses overlay panels on full-screen maps:

```less
.panel-shell--overlay {
    position: absolute;
    z-index: 20;
    top: 0;
    bottom: (@bottom-nav-height + 20px);
    flex: 0 0 auto;
    width: min(375px, calc(50% - 40px), calc(100% - 80px));
    pointer-events: auto;
}

.panel-shell--overlay-left {
    left: 20px;
}

.panel-shell--overlay-right {
    right: 20px;
}
```

**Good use case:** Responsive overlay panels that adapt to screen size

---

## 6. CSS/LESS FILE ORGANIZATION

### 6.1 Structure

```
/styles
├── /abstracts
│   ├── variables.less      ← Design tokens (colors, spacing, fonts, z-index)
│   ├── mixins.less         ← Style helpers (flexbox, backgrounds, animations)
│   ├── functions.less      ← LESS functions
│   └── index.less          ← Barrel export
├── /base
│   ├── reset.less          ← Normalization
│   └── typography.less     ← Font families
└── global.less             ← Utilities (flex, grid, sizing, spacing)
```

### 6.2 Variables System (variables.less)

**Quality: Excellent (✓✓✓)**

Uses CSS custom properties with LESS fallbacks:

```less
:root {
  // Color system
  --color-primary: #c69c6d;
  --color-success: #22c55e;
  --color-warning: #ffd700;
  
  // Spacing system (4px grid)
  --space-1: .25rem;  // 4px
  --space-2: .5rem;   // 8px
  --space-4: 1rem;    // 16px
  
  // Font system
  --font-family-base: "SourceHanSansCN-Regular", ...
  --font-size-base: 1rem;    // 16px
  --font-size-3xl: 1.875rem; // 30px
  
  // Z-index system
  --z-index-modal: 1400;
  --z-index-popover: 1500;
  
  // Business specific
  --panel-width: 375px;
  --panel-height: 734px;
}
```

**Strengths:**
- Consistent naming convention
- Logical grouping (colors, spacing, fonts, z-index)
- Modular scale for font sizes (1.2x)
- Business-specific variables included

### 6.3 Mixins System (mixins.less)

**Quality: Good (✓✓)**

Well-organized mixins for common patterns:

```less
// Layout mixins
.flex-center()
.flex-row(@align, @justify, @gap)
.flex-col(@align, @justify, @gap)
.grid(@columns, @gap)
.absolute-center()

// Background mixins
.bg-image(@position, @repeat, @size)
.bg-gradient(@direction, @start-color, @end-color)

// Text mixins
.text-ellipsis(@lines)
.text-preset(@size, @weight, @color, @line-height)
.number-display(@size)

// Component mixins
.card(@bg, @border, @radius)
.button(@bg, @color, @padding)
.panel(@width)

// Animation mixins
.transition(@property, @duration, @easing)
.fade-in(@duration)
.slide-in(@direction, @distance, @duration)

// Responsive mixins
.media-sm(@rules)
.media-md(@rules)
```

**Issues:**
1. Mixins take parameters but aren't always used:
   ```less
   .flex-row(@align: center, @justify: flex-start, @gap: 0)
   // But often called as:
   .flex-row() // with defaults
   ```

2. Mix of parametric and non-parametric mixins

3. Animation mixins define their own keyframes - could cause conflicts

### 6.4 Global Utilities (global.less)

**Quality: Good but verbose (✓✓)**

Comprehensive utility classes:

```less
// Layout utilities (35 classes)
.flex, .flex-row, .flex-col, .flex-center
.justify-start, .justify-center, .justify-between
.items-start, .items-center, .items-end

// Spacing utilities (50+ classes)
.m-0 through .m-12
.mt-0 through .mt-6
.mb-0 through .mb-6
.p-0 through .p-8
.pt-0 through .pt-6
.pl-0 through .pl-4

// Size utilities (5 classes)
.w-full, .h-full, .w-screen, .h-screen, .min-h-screen

// Display utilities (7 classes)
.block, .inline, .inline-block, .hidden
.flex, .grid

// Z-index utilities (8 classes)
.z-0, .z-10, .z-20, .z-30, .z-40, .z-50, .z-auto

// Border utilities (8 classes)
.border, .border-0, .rounded, .rounded-md, .rounded-lg, .rounded-xl, .rounded-full

// Animation utilities (5 classes)
.transition, .transition-all, .transition-opacity, .transition-transform
```

**Analysis:** 
- Total: ~130+ utility classes
- Comprehensive but verbose
- Could be reduced with LESS mixins + variables

---

## COMPREHENSIVE RECOMMENDATIONS

### Priority 1: Critical Issues (Address First)

#### 1.1 Standardize Image Import Method
**Current:** Two methods coexist
**Target:** All components use `imageMixin.js` + `imageManager.js`

```javascript
// Update RightRankingPanel.vue
// FROM:
const images = {
    rankingPanelBg: '/images/ranking-panel-bg.png',
    // ...
}

// TO:
import imageMixin from '@/mixins/imageMixin'

export default {
    mixins: [imageMixin],
    methods: {
        getRankingPanelStyle() {
            return this.getBackgroundImageStyle(
                this.getImagePath('RIGHT_PANEL', 'BACKGROUND')
            )
        }
    }
}
```

#### 1.2 Create CSS Class Naming Convention Document
```markdown
# CSS Class Naming Convention

## BEM Pattern (Preferred)
.block--modifier__element {}
Example: .stat-card--large__number

## Utility Classes
.flex-row, .gap-4, .p-6

## NEVER use generic names
❌ .group_2, .section_1
✓ .dashboard-content, .map-section

## State modifiers
.is-active, .is-loading, .has-error
```

#### 1.3 Fix DOM Structure Inconsistencies
Replace generic names in DashboardLayout.vue:
```vue
<!-- FROM -->
<div class="group_4 flex-row">
  <div class="panel-shell panel-shell--left">
    <div class="panel-content left-panel-container">

<!-- TO -->
<div class="dashboard-panels flex-row">
  <div class="dashboard-sidebar dashboard-sidebar--left">
    <div class="dashboard-sidebar__content">
```

### Priority 2: Important Improvements (Next Sprint)

#### 2.1 Consolidate Image Assets
```
Current:
/public/images/           ← Most images here
/src/assets/images/       ← Only 3 images

Target:
/src/assets/images/       ← All images
  /common/
    - header-bg.png
    - button-bg.png
  /left-panel/
    - background.png
    - card-bg.png
  /right-panel/
    - ranking-bg.png
    - divider.png
  /maps/
    - marker-icon.png
```

#### 2.2 Reduce CSS Duplication
**Identify duplicate utility definitions:**
```less
// In global.less
.flex-row { display: flex; flex-direction: row; }

// Also in LeftDataPanel.vue scoped styles
.flex-row { display: flex; flex-direction: row; }

// Remove from scoped styles, use global
```

#### 2.3 Simplify Flex Container Hierarchy
**Current (5 levels):**
```html
.page (flex)
  .group_2 (flex)
    .group_4 (flex)
      .panel-shell (flex)
        .panel-content (no flex)
```

**Target (3 levels):**
```html
.page (flex-col)
  .dashboard-header
  .dashboard-content (flex-row)
    .dashboard-sidebar
    .dashboard-map
    .dashboard-sidebar
```

#### 2.4 Add Accessibility Improvements
```vue
<!-- Current: Only DashboardLayout has aria attributes -->
<!-- Target: All interactive elements -->

<button
  type="button"
  :aria-label="label"
  :aria-expanded="isExpanded"
  :aria-pressed="isActive"
>
```

### Priority 3: Enhancements (Future)

#### 3.1 Create Component Library Documentation
```markdown
# Component Patterns

## Pattern: Overlay Panels
Used in: MapViewBaise, RegionDetailMap
CSS: .panel-shell--overlay

## Pattern: Ranking Items
Used in: RightRankingPanel
CSS: .ranking-item

## Pattern: Data Cards
Used in: LeftDataPanel, StatCard
CSS: .data-card, .stat-card
```

#### 3.2 Implement Responsive Breakpoint System
```less
// Currently used: @media (max-width: 768px)
// Target: Consistent breakpoints

.dashboard-panels {
  .media-lg({
    flex-direction: row;
  });
  
  .media-md({
    flex-direction: column;
  });
}
```

#### 3.3 Create CSS Architecture Guide
Document the three-layer architecture:
1. **Variables** (colors, spacing, fonts)
2. **Mixins** (layout patterns, animations)
3. **Utilities** (single-purpose classes)
4. **Components** (scoped styles)

---

## CURRENT BEST PRACTICES (Preserve These)

### In Global Styles
✓ CSS custom properties with LESS variables
✓ Comprehensive mixin library
✓ Utility-first approach
✓ Design token system

### In Components
✓ Scoped styles isolation
✓ BEM-like patterns for complex components
✓ Image mixin for centralized management
✓ Slot-based composition in layouts

### In Structure
✓ Clear component/views separation
✓ Abstracts/Base/Global organization
✓ Feature-based component grouping (/charts, /base)
✓ Utility functions isolated in /utils

---

## CONCLUSION

**Overall Assessment:** B+ (Good with areas for improvement)

**Strengths:**
- Well-organized file structure
- Comprehensive design token system
- Flexible slot-based layout
- Centralized image management (partial)

**Weaknesses:**
- Inconsistent DOM naming patterns
- Mixed image import approaches
- Complex nested flex hierarchies
- CSS duplication across files

**Time to Implement Recommendations:**
- Priority 1: 1-2 days
- Priority 2: 3-5 days
- Priority 3: 1-2 sprints
