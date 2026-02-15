# 🔄 MVC Migration Guide

Guide for migrating existing route-based backend to feature-based MVC architecture.

## ✅ Completed

- **Architecture Documentation**: BACKEND_ARCHITECTURE.md
- **Shared Utilities**: response.ts created
- **Brands Feature**: Fully migrated to MVC ✨
- **Auth Feature**: Fully migrated to MVC ✨

## 📋 Migration Checklist

### ✅ Brands Feature (COMPLETE - Use as Template)

Located in: `backend/features/brands/`

Files created:
- ✅ `brands.types.ts` - TypeScript interfaces
- ✅ `brands.service.ts` - Business logic
- ✅ `brands.controller.ts` - Request handlers
- ✅ `brands.routes.ts` - Route definitions

This serves as the **reference implementation** for migrating other features.

### ✅ Auth Feature (COMPLETE)

Located in: `backend/features/auth/`

Files created:
- ✅ `auth.types.ts` - TypeScript interfaces (RegisterDto, LoginDto, AuthResponse)
- ✅ `auth.service.ts` - Business logic (register, login, getCurrentUser)
- ✅ `auth.controller.ts` - Request handlers (3 endpoints)
- ✅ `auth.routes.ts` - Route definitions (POST /register, POST /login, GET /me)

### 🔄 Remaining Features to Migrate

| Feature | Priority | Complexity | Status |
|---------|----------|------------|--------|
| **products** | High | High | ⏳ Pending |
| **inventory** | High | Medium | ⏳ Pending |
| **analytics** | High | Medium | ⏳ Pending |
| **settings** | High | Low | ⏳ Pending |
| **categories** | Medium | Low | ⏳ Pending |
| **orders** | Medium | Medium | ⏳ Pending |
| **vouchers** | Medium | Medium | ⏳ Pending |
| **blogs** | Low | Low | ⏳ Pending |
| **banners** | Low | Low | ⏳ Pending |
| **events** | Low | Low | ⏳ Pending |
| **upload** | Low | Low | ⏳ Pending |
| **landing-pages** | Low | Low | ⏳ Pending |

## 🛠️ Step-by-Step Migration Process

### Step 1: Copy Brands Template

```bash
# For each feature, copy the brands structure
cp -r backend/features/brands backend/features/[feature-name]

# Rename files
cd backend/features/[feature-name]
mv brands.types.ts [feature].types.ts
mv brands.service.ts [feature].service.ts
mv brands.controller.ts [feature].controller.ts
mv brands.routes.ts [feature].routes.ts
```

### Step 2: Extract Types

From `backend/routes/[feature].ts`, identify:

**Request DTOs:**
```typescript
// What data comes from client?
export interface Create[Feature]Dto {
  // Fields from req.body in POST request
}

export interface Update[Feature]Dto {
  // Fields from req.body in PUT request
}

export interface [Feature]Query {
  // Fields from req.query
}
```

**Example from products:**
```typescript
export interface CreateProductDto {
  name: string;
  price: number;
  categoryId?: string;
  brandId?: string;
  stock?: number;
}
```

### Step 3: Extract Service Logic

Move all database operations and business logic:

**Before (in routes/products.ts):**
```typescript
router.get('/', async (req, res) => {
  const products = await prisma.product.findMany({ ... });
  res.json({ products });
});
```

**After (in features/products/products.service.ts):**
```typescript
export const getAllProducts = async (query: ProductQuery) => {
  const products = await prisma.product.findMany({
    where: buildWhereClause(query),
    ...
  });
  return { products };
};
```

### Step 4: Create Controllers

Controllers handle HTTP layer only:

```typescript
// features/products/products.controller.ts
import * as service from './products.service.js';
import { successResponse, errorResponse } from '@/shared/utils/response';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const result = await service.getAllProducts(req.query);
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};
```

### Step 5: Define Routes

Clean route definitions:

```typescript
// features/products/products.routes.ts
import { Router } from 'express';
import * as controller from './products.controller.js';
import { authenticate, requireAdmin } from '@/shared/middleware/auth';

const router = Router();

router.get('/', controller.getAllProducts);
router.post('/', authenticate, requireAdmin, controller.createProduct);

export default router;
```

### Step 6: Update index.ts

```typescript
// backend/index.ts
import productsRoutes from './features/products/products.routes.js';

app.use('/api/products', productsRoutes);
```

### Step 7: Test

```bash
# Test each endpoint
curl http://localhost:3001/api/products
curl http://localhost:3001/api/brands
```

### Step 8: Delete Old Route

```bash
# After verifying everything works
rm backend/routes/[feature].ts
```

## 📝 Code Templates

### Types Template

```typescript
// features/[feature]/[feature].types.ts
export interface Create[Feature]Dto {
  // Required fields
  name: string;
  // Optional fields
  description?: string;
}

export interface Update[Feature]Dto extends Partial<Create[Feature]Dto> {
  isActive?: boolean;
}

export interface [Feature]Query {
  search?: string;
  limit?: string;
  offset?: string;
}
```

### Service Template

```typescript
// features/[feature]/[feature].service.ts
import { prisma } from '@/shared/lib/prisma';
import { Create[Feature]Dto, Update[Feature]Dto } from './[feature].types';

export const getAll[Features] = async (query: [Feature]Query) => {
  const items = await prisma.[feature].findMany({ ... });
  return { items };
};

export const get[Feature]ById = async (id: string) => {
  const item = await prisma.[feature].findUnique({ where: { id } });
  if (!item) throw new Error('[Feature] not found');
  return item;
};

export const create[Feature] = async (data: Create[Feature]Dto) => {
  return await prisma.[feature].create({ data });
};

export const update[Feature] = async (id: string, data: Update[Feature]Dto) => {
  return await prisma.[feature].update({ where: { id }, data });
};

export const delete[Feature] = async (id: string) => {
  await prisma.[feature].delete({ where: { id } });
  return { message: '[Feature] deleted successfully' };
};
```

### Controller Template

```typescript
// features/[feature]/[feature].controller.ts
import { Request, Response } from 'express';
import * as service from './[feature].service.js';
import { successResponse, errorResponse, notFoundResponse } from '@/shared/utils/response';

export const getAll[Features] = async (req: Request, res: Response) => {
  try {
    const result = await service.getAll[Features](req.query);
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const get[Feature]ById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await service.get[Feature]ById(id);
    return successResponse(res, item);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return notFoundResponse(res, '[Feature]');
    }
    return errorResponse(res, error);
  }
};

export const create[Feature] = async (req: Request, res: Response) => {
  try {
    const item = await service.create[Feature](req.body);
    return successResponse(res, item, 201);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const update[Feature] = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await service.update[Feature](id, req.body);
    return successResponse(res, item);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const delete[Feature] = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await service.delete[Feature](id);
    return successResponse(res, result);
  } catch (error) {
    return errorResponse(res, error);
  }
};
```

### Routes Template

```typescript
// features/[feature]/[feature].routes.ts
import { Router } from 'express';
import * as controller from './[feature].controller.js';
import { authenticate, requireAdmin } from '@/shared/middleware/auth';

const router = Router();

// Public routes
router.get('/', controller.getAll[Features]);
router.get('/:id', controller.get[Feature]ById);

// Admin routes
router.post('/', authenticate, requireAdmin, controller.create[Feature]);
router.put('/:id', authenticate, requireAdmin, controller.update[Feature]);
router.delete('/:id', authenticate, requireAdmin, controller.delete[Feature]);

export default router;
```

## 🎯 Benefits After Migration

- ✅ Separation of concerns (Routes, Controllers, Services)
- ✅ Easier to test (unit test services, integration test controllers)
- ✅ Better code organization
- ✅ Reusable business logic
- ✅ Consistent error handling
- ✅ Type-safe with TypeScript interfaces

## 📊 Progress Tracking

Track migration progress:

```bash
# Check how many features migrated
ls -la backend/features/
# vs
ls -la backend/routes/
```

## 🚀 Next Steps

1. Migrate **auth** feature (high priority, used by all protected routes)
2. Migrate **products** feature (core business logic)
3. Migrate **inventory** feature (new feature, should be MVC from start)
4. Migrate remaining features in order of priority

---

**Migration in progress! Follow brands/ as the reference implementation.** 🏗️
