# ⚛️ Atomic Design Architecture

Guitar NOVA follows the **Atomic Design** methodology for organizing React components. This creates a scalable, maintainable, and reusable component architecture.

## 📚 Table of Contents

- [What is Atomic Design?](#what-is-atomic-design)
- [Folder Structure](#folder-structure)
- [Component Hierarchy](#component-hierarchy)
- [Guidelines](#guidelines)
- [Examples](#examples)
- [Best Practices](#best-practices)

## 🎯 What is Atomic Design?

Atomic Design is a methodology for creating design systems with five distinct levels:

```
Atoms → Molecules → Organisms → Templates → Pages
  ↓        ↓           ↓           ↓         ↓
Basic   Combinations  Complex    Layouts   Instances
```

### The 5 Levels

1. **Atoms** 🔹
   - Smallest building blocks
   - Cannot be broken down further
   - Examples: Button, Input, Label, Icon

2. **Molecules** 🔸
   - Simple combinations of atoms
   - Serve a single purpose
   - Examples: SearchBar (Input + Button), FormField (Label + Input + Error)

3. **Organisms** 🔶
   - Complex UI components
   - Combination of molecules and/or atoms
   - Examples: Header, Footer, ProductCard, Navigation

4. **Templates** 📄
   - Page-level layouts
   - Wireframe structures
   - Examples: MainLayout, AdminLayout, AuthLayout

5. **Pages** 📱
   - Specific instances of templates
   - Real content and data
   - Examples: HomePage, ProductsPage, CheckoutPage

## 📂 Folder Structure

```
src/
├── components/
│   ├── atoms/                    # 🔹 Atoms (48 components)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   └── ... (44 more)
│   │
│   ├── molecules/                # 🔸 Molecules
│   │   ├── SearchBar/
│   │   ├── PriceDisplay/
│   │   ├── ProductRating/
│   │   └── FormField/
│   │
│   ├── organisms/                # 🔶 Organisms (5 components)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── HeroBanner.tsx
│   │   └── Cart.tsx
│   │
│   ├── templates/                # 📄 Templates
│   │   ├── MainLayout.tsx
│   │   └── AuthLayout.tsx
│   │
│   └── pages/                    # 📱 Pages (16 pages)
│       ├── Home.tsx
│       ├── Products.tsx
│       ├── ProductDetail.tsx
│       ├── Checkout.tsx
│       └── ... (12 more)
│
├── features/                     # Feature modules
│   ├── auth/
│   └── cart/
│
├── router/                       # React Router
└── shared/                       # Shared utilities
```

## 🏗️ Component Hierarchy

### Current Component Breakdown

#### 🔹 Atoms (48 components)

All basic UI elements from shadcn/ui:

```
accordion, alert, alert-dialog, aspect-ratio, avatar,
badge, breadcrumb, button, calendar, card, carousel,
chart, checkbox, collapsible, command, context-menu,
dialog, drawer, dropdown-menu, form, hover-card, input,
input-otp, label, menubar, navigation-menu, pagination,
popover, progress, radio-group, resizable, scroll-area,
select, separator, skeleton, slider, sonner, switch,
table, tabs, textarea, toggle, toggle-group, tooltip
```

**Import Example:**
```typescript
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';
import { Badge } from '@/components/atoms/badge';
```

#### 🔸 Molecules (Potential - To Be Created)

Combinations of atoms for specific purposes:

| Component | Composition | Purpose |
|-----------|-------------|---------|
| **SearchBar** | Input + Button | Product search |
| **PriceDisplay** | Text + Badge | Show price with discount |
| **ProductRating** | Stars + Count | Display ratings |
| **FormField** | Label + Input + Error | Form input with validation |
| **ImageUpload** | Input + Button + Preview | Upload product images |
| **DatePicker** | Input + Calendar + Button | Select dates |

**Example Molecule:**
```typescript
// molecules/SearchBar.tsx
import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';
import { Search } from 'lucide-react';

export function SearchBar({ onSearch }: Props) {
  return (
    <div className="flex gap-2">
      <Input placeholder="Search products..." />
      <Button onClick={onSearch}>
        <Search className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

#### 🔶 Organisms (5 components)

Complex, reusable sections:

| Component | Description | Location |
|-----------|-------------|----------|
| **Header** | Navigation, search, cart, user menu | `organisms/Header.tsx` |
| **Footer** | Links, social, newsletter | `organisms/Footer.tsx` |
| **ProductCard** | Product display with CTA | `organisms/ProductCard.tsx` |
| **HeroBanner** | Homepage hero carousel | `organisms/HeroBanner.tsx` |
| **Cart** | Shopping cart sidebar | `organisms/Cart.tsx` |

**Import Example:**
```typescript
import { Header } from '@/components/organisms/Header';
import { ProductCard } from '@/components/organisms/ProductCard';
```

#### 📄 Templates (2 layouts)

Page layouts without content:

| Template | Purpose | Components Used |
|----------|---------|-----------------|
| **MainLayout** | Main site layout | Header + Footer + Cart |
| **AuthLayout** | Login/Register pages | Minimal layout |

**Example Template:**
```typescript
// templates/MainLayout.tsx
import { Header } from '@/components/organisms/Header';
import { Footer } from '@/components/organisms/Footer';

export function MainLayout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

#### 📱 Pages (16 components)

Actual pages with real data:

```
Home, Products, ProductDetail, Categories, Promo,
Checkout, Auth, Account, Rewards, Events, BlogList,
BlogDetail, LandingPages, LandingPageView, AdminLogin,
AdminDashboard
```

**Import Example:**
```typescript
// In router/routes.tsx
const HomePage = React.lazy(() => import('@/components/pages/Home'));
const ProductsPage = React.lazy(() => import('@/components/pages/Products'));
```

## 📋 Guidelines

### When to Create Each Type

#### 🔹 Create an Atom when:
- ✅ It's a basic UI element (button, input, icon)
- ✅ It can't be broken down further
- ✅ It's reusable across the app
- ✅ It has no business logic
- ❌ Don't create atoms for complex components

#### 🔸 Create a Molecule when:
- ✅ You combine 2-3 atoms
- ✅ It serves a single, specific purpose
- ✅ It's reused in multiple places
- ✅ It encapsulates simple logic
- ❌ Don't make molecules too complex

#### 🔶 Create an Organism when:
- ✅ It's a major section (header, footer)
- ✅ It combines multiple molecules/atoms
- ✅ It's a standalone UI feature
- ✅ It has its own state/logic
- ❌ Don't include page-specific logic

#### 📄 Create a Template when:
- ✅ It defines a page layout
- ✅ It's reused by multiple pages
- ✅ It handles layout structure only
- ❌ Don't include real data

#### 📱 Create a Page when:
- ✅ It's a route in your app
- ✅ It uses templates and organisms
- ✅ It fetches and displays real data
- ✅ It handles page-specific logic

## 💡 Examples

### Building a Product Page

```
Page: ProductDetail.tsx
├── Template: MainLayout
│   ├── Organism: Header
│   │   ├── Molecule: SearchBar
│   │   │   ├── Atom: Input
│   │   │   └── Atom: Button
│   │   └── Molecule: UserMenu
│   │       ├── Atom: Avatar
│   │       └── Atom: Dropdown
│   │
│   ├── Organism: ProductCard
│   │   ├── Molecule: PriceDisplay
│   │   │   ├── Atom: Badge (discount)
│   │   │   └── Atom: Text (price)
│   │   ├── Molecule: ProductRating
│   │   │   ├── Atom: Icon (stars)
│   │   │   └── Atom: Text (count)
│   │   └── Atom: Button (Add to Cart)
│   │
│   └── Organism: Footer
│       ├── Atom: Link
│       └── Atom: Icon
```

### Real Code Example

```typescript
// 📱 pages/ProductDetail.tsx
import { MainLayout } from '@/components/templates/MainLayout';
import { ProductCard } from '@/components/organisms/ProductCard';
import { Button } from '@/components/atoms/button';

export function ProductDetail() {
  return (
    <MainLayout>
      <div className="container">
        <ProductCard product={data} />
        <Button>Add to Cart</Button>
      </div>
    </MainLayout>
  );
}
```

## ✨ Best Practices

### 1. Naming Conventions

```typescript
// ✅ Good
components/atoms/button.tsx         // lowercase for atoms
components/molecules/SearchBar/     // PascalCase folder for molecules
components/organisms/Header.tsx     // PascalCase for organisms
components/pages/HomePage.tsx       // PascalCase + "Page" suffix

// ❌ Bad
components/atoms/Button.tsx         // Don't capitalize atoms
components/organisms/header.tsx     // Don't lowercase organisms
components/pages/Home.tsx           // Missing "Page" suffix
```

### 2. Import Paths

Always use absolute imports with `@/` alias:

```typescript
// ✅ Good
import { Button } from '@/components/atoms/button';
import { Header } from '@/components/organisms/Header';
import { MainLayout } from '@/components/templates/MainLayout';

// ❌ Bad
import { Button } from '../../../atoms/button';
import { Header } from './organisms/Header';
```

### 3. Component Structure

Each component level should only import from levels below:

```
Pages      → can import from Templates, Organisms, Molecules, Atoms
Templates  → can import from Organisms, Molecules, Atoms
Organisms  → can import from Molecules, Atoms
Molecules  → can import from Atoms
Atoms      → cannot import other components (only utilities)
```

### 4. File Organization

For complex molecules/organisms, use folder structure:

```
components/
├── molecules/
│   └── SearchBar/
│       ├── SearchBar.tsx       # Main component
│       ├── SearchBar.test.tsx  # Tests
│       ├── SearchBar.types.ts  # Types
│       └── index.ts            # Export
```

### 5. State Management

| Level | State Type | Example |
|-------|------------|---------|
| **Atoms** | No state (controlled) | Button receives onClick |
| **Molecules** | Local UI state | SearchBar manages input value |
| **Organisms** | Component state | Header manages menu open/close |
| **Pages** | Data fetching | Products page fetches from API |

## 🔄 Migration from Old Structure

### Before (Old Structure)
```
src/app/components/
├── Home.tsx                 # ❌ Mixed pages and components
├── ProductCard.tsx
├── Header.tsx
└── ui/
    └── button.tsx
```

### After (Atomic Design)
```
src/components/
├── atoms/
│   └── button.tsx          # ✅ Clear hierarchy
├── organisms/
│   ├── Header.tsx
│   └── ProductCard.tsx
└── pages/
    └── Home.tsx
```

## 📦 Component Index

Quick reference for all components:

### Atoms (48)
See full list in `src/components/atoms/`

### Organisms (5)
- Header - Main navigation
- Footer - Site footer
- ProductCard - Product display
- HeroBanner - Homepage hero
- Cart - Shopping cart drawer

### Pages (16)
- Home - Homepage
- Products - Product listing
- ProductDetail - Product detail
- Categories - Category browser
- Promo - Promotions page
- Checkout - Checkout flow
- Auth - Login/Register
- Account - User account
- Rewards - Loyalty program
- Events - Events listing
- BlogList - Blog index
- BlogDetail - Blog post
- LandingPages - Landing page list
- LandingPageView - Landing page view
- AdminLogin - Admin login
- AdminDashboard - Admin panel

## 🚀 Adding New Components

### Step 1: Determine the Level

Ask yourself:
- Is it a basic UI element? → **Atom**
- Does it combine 2-3 atoms? → **Molecule**
- Is it a major section? → **Organism**
- Is it a layout structure? → **Template**
- Is it a route/page? → **Page**

### Step 2: Create the Component

```bash
# For atoms (use lowercase)
touch src/components/atoms/new-atom.tsx

# For others (use PascalCase)
mkdir src/components/molecules/NewMolecule
touch src/components/molecules/NewMolecule/NewMolecule.tsx
touch src/components/molecules/NewMolecule/index.ts
```

### Step 3: Follow the Template

```typescript
// components/molecules/NewMolecule/NewMolecule.tsx
import { Button } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input';

interface NewMoleculeProps {
  // Props here
}

export function NewMolecule({ ...props }: NewMoleculeProps) {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Step 4: Export

```typescript
// components/molecules/NewMolecule/index.ts
export { NewMolecule } from './NewMolecule';
export type { NewMoleculeProps } from './NewMolecule';
```

## 📚 Further Reading

- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [React Component Patterns](https://reactpatterns.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🤝 Contributing

When adding components:
1. Follow the atomic design hierarchy
2. Use absolute imports with `@/`
3. Write clear prop types
4. Add JSDoc comments
5. Update this documentation

---

**Questions?** Check the [CONTRIBUTING.md](CONTRIBUTING.md) or create an issue.

**Built with ⚛️ Atomic Design principles**
