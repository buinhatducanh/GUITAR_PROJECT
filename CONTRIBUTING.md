# 🤝 Contributing to Guitar NOVA

Thank you for your interest in contributing to Guitar NOVA! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

## 🚀 Getting Started

1. **Fork the repository**
   ```bash
   # Click "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/GUITAR_PROJECT.git
   cd GUITAR_PROJECT
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/GUITAR_PROJECT.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Setup environment**
   ```bash
   cp .env.example .env
   # Update .env with your credentials
   ```

6. **Setup database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

## 💻 Development Workflow

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### Make Your Changes

1. Write clean, readable code
2. Follow the coding standards
3. Add comments for complex logic
4. Update documentation if needed

### Test Your Changes

```bash
# Run development server
npm run dev

# Test in browser
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3001
```

### Commit Your Changes

```bash
git add .
git commit -m "feat: add user profile page"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### Create Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Fill in the PR template
4. Submit for review

## 📐 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for data structures
- Avoid `any` type when possible
- Use proper type annotations

```typescript
// Good
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// Bad
function getUser(id: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Use meaningful component names
- Keep components small and focused
- Extract reusable logic into hooks

```typescript
// Good
export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  return (
    <div className="product-card">
      {/* ... */}
    </div>
  );
}

// Bad
export default function PC(props: any) {
  // Large component with mixed concerns
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatPrice.ts`)
- Hooks: `use*.ts` (e.g., `useAuth.ts`)
- Types: `*.types.ts` (e.g., `product.types.ts`)

### Styling

- Use Tailwind CSS classes
- Follow mobile-first approach
- Use consistent spacing (4, 8, 16, 24, 32px)
- Prefer dark theme colors

```tsx
// Good
<div className="p-4 md:p-8 bg-zinc-900 rounded-lg">

// Bad
<div style={{ padding: "15px", background: "#333" }}>
```

### API Routes

- Use RESTful conventions
- Validate input data
- Return consistent response formats
- Handle errors properly

```typescript
// Good
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## 📝 Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(auth): add social login with Google"

# Bug fix
git commit -m "fix(cart): calculate total price correctly"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Refactor
git commit -m "refactor(products): extract filtering logic to hook"

# With body
git commit -m "feat(checkout): add voucher code input

- Add input field for voucher codes
- Validate voucher on backend
- Apply discount to total price
- Show success/error messages

Closes #123"
```

## 🔄 Pull Request Process

### Before Submitting

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test thoroughly**
   - Manual testing in browser
   - Check console for errors
   - Test on mobile viewport

3. **Clean up commits**
   ```bash
   git rebase -i HEAD~n  # Squash if needed
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)
[Add screenshots here]

## Testing
- [ ] Tested on Chrome
- [ ] Tested on mobile
- [ ] No console errors
- [ ] API endpoints work

## Checklist
- [ ] Code follows project standards
- [ ] Self-reviewed the code
- [ ] Updated documentation
- [ ] No breaking changes (or documented)
```

### Review Process

1. Maintainer reviews PR
2. Address feedback if requested
3. PR gets approved
4. Maintainer merges PR

## 🧪 Testing

### Manual Testing Checklist

**Frontend:**
- [ ] Page loads without errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Forms validate correctly
- [ ] Images load properly
- [ ] Navigation works
- [ ] Authentication works

**Backend:**
- [ ] API endpoints return correct data
- [ ] Error handling works
- [ ] Authentication middleware works
- [ ] Database queries are efficient

### Test Accounts

Use these accounts for testing:

**Regular User:**
- Email: `user@gmail.com`
- Password: `user123`

**Admin:**
- Email: `admin@guitarNOVA.com`
- Password: `admin123`

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 💡 Getting Help

- Check existing issues
- Ask in discussions
- Read documentation
- Contact maintainers

## 🎉 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Thanked in the community

---

**Thank you for contributing! 🎸✨**
