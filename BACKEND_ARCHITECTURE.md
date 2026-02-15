# 🏗️ Backend Architecture - Feature-based MVC

Guitar NOVA backend follows a **Feature-based MVC (Model-View-Controller)** architecture for scalability and maintainability.

## 📁 New Folder Structure

```
backend/
├── index.ts                      # Main entry point
│
├── features/                     # 🎯 Feature modules (MVC)
│   ├── auth/
│   │   ├── auth.controller.ts   # Request handlers
│   │   ├── auth.service.ts      # Business logic
│   │   ├── auth.routes.ts       # Route definitions
│   │   └── auth.types.ts        # TypeScript types
│   │
│   ├── products/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.routes.ts
│   │   └── products.types.ts
│   │
│   ├── brands/
│   ├── inventory/
│   ├── analytics/
│   └── ... (other features)
│
├── shared/                       # 🔧 Shared utilities
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Authentication
│   │   ├── error.middleware.ts  # Error handling
│   │   └── validator.middleware.ts
│   │
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client
│   │   ├── cloudinary.ts        # Image upload
│   │   └── logger.ts            # Logging
│   │
│   ├── utils/
│   │   ├── response.ts          # Standard responses
│   │   ├── validation.ts        # Input validation
│   │   └── helpers.ts           # Helper functions
│   │
│   └── types/
│       ├── express.d.ts         # Extended Express types
│       └── common.types.ts      # Common types
│
└── config/                       # ⚙️ Configuration
    ├── database.ts
    ├── cloudinary.ts
    └── constants.ts
```

## 🎯 MVC Pattern per Feature

Each feature follows this structure:

### 1. **Routes** (`*.routes.ts`)
- Define API endpoints
- Attach middleware
- Map to controllers

```typescript
// features/products/products.routes.ts
import { Router } from 'express';
import * as controller from './products.controller';
import { authenticate, requireAdmin } from '@/shared/middleware/auth.middleware';

const router = Router();

router.get('/', controller.getAllProducts);
router.get('/:slug', controller.getProductBySlug);
router.post('/', authenticate, requireAdmin, controller.createProduct);
router.put('/:id', authenticate, requireAdmin, controller.updateProduct);
router.delete('/:id', authenticate, requireAdmin, controller.deleteProduct);

export default router;
```

### 2. **Controllers** (`*.controller.ts`)
- Handle HTTP requests
- Validate input
- Call services
- Return responses

```typescript
// features/products/products.controller.ts
import { Request, Response } from 'express';
import * as service from './products.service';
import { successResponse, errorResponse } from '@/shared/utils/response';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await service.getAllProducts(req.query);
    return successResponse(res, products);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await service.createProduct(req.body);
    return successResponse(res, product, 201);
  } catch (error) {
    return errorResponse(res, error);
  }
};
```

### 3. **Services** (`*.service.ts`)
- Business logic
- Database operations
- Data transformation
- External API calls

```typescript
// features/products/products.service.ts
import { prisma } from '@/shared/lib/prisma';
import { CreateProductDto, UpdateProductDto } from './products.types';

export const getAllProducts = async (query: any) => {
  const { category, search, limit = 20, offset = 0 } = query;

  const products = await prisma.product.findMany({
    where: {
      ...(category && { categoryId: category }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      isActive: true
    },
    take: parseInt(limit),
    skip: parseInt(offset),
    include: {
      category: true,
      brand: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.product.count({ where: { isActive: true } });

  return { products, total, limit, offset };
};

export const createProduct = async (data: CreateProductDto) => {
  return await prisma.product.create({
    data: {
      ...data,
      slug: generateSlug(data.name)
    }
  });
};
```

### 4. **Types** (`*.types.ts`)
- Request DTOs
- Response types
- Domain models

```typescript
// features/products/products.types.ts
export interface CreateProductDto {
  name: string;
  price: number;
  categoryId?: string;
  brandId?: string;
  description?: string;
  stock?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  isActive?: boolean;
}

export interface ProductQuery {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}
```

## 🔧 Shared Utilities

### Middleware

**Auth Middleware:**
```typescript
// shared/middleware/auth.middleware.ts
export const authenticate = (req, res, next) => {
  // Verify JWT token
};

export const requireAdmin = (req, res, next) => {
  // Check admin role
};
```

**Error Middleware:**
```typescript
// shared/middleware/error.middleware.ts
export const errorHandler = (err, req, res, next) => {
  // Centralized error handling
};
```

### Response Utilities

```typescript
// shared/utils/response.ts
export const successResponse = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data
  });
};

export const errorResponse = (res, error, status = 500) => {
  return res.status(status).json({
    success: false,
    error: error.message
  });
};
```

## 📦 Feature List

| Feature | Routes | Description |
|---------|--------|-------------|
| **auth** | `/api/auth` | Authentication & authorization |
| **products** | `/api/products` | Product management |
| **categories** | `/api/categories` | Category management |
| **brands** | `/api/brands` | Brand management |
| **inventory** | `/api/inventory` | Stock management |
| **analytics** | `/api/analytics` | Business analytics |
| **orders** | `/api/orders` | Order processing |
| **users** | `/api/users` | User management |
| **vouchers** | `/api/vouchers` | Voucher system |
| **blogs** | `/api/blogs` | Blog posts |
| **banners** | `/api/banners` | Banner management |
| **settings** | `/api/settings` | Site configuration |

## 🎯 Benefits of This Architecture

### 1. **Separation of Concerns**
- Routes: HTTP layer
- Controllers: Request/Response handling
- Services: Business logic
- Clear responsibilities

### 2. **Maintainability**
- Easy to locate code
- Feature-based organization
- Each feature is self-contained

### 3. **Testability**
- Services can be unit tested
- Controllers can be integration tested
- Easy to mock dependencies

### 4. **Scalability**
- Add new features easily
- Reuse shared utilities
- Independent feature development

### 5. **Team Collaboration**
- Developers can work on different features
- Minimal merge conflicts
- Clear code ownership

## 🔄 Migration from Old Structure

### Before (Route-based):
```
backend/
├── routes/
│   ├── auth.ts          (mixed: routes + logic)
│   ├── products.ts      (mixed: routes + logic)
│   └── brands.ts        (mixed: routes + logic)
```

### After (Feature-based MVC):
```
backend/
├── features/
│   ├── auth/
│   │   ├── auth.routes.ts       (routes only)
│   │   ├── auth.controller.ts   (handlers)
│   │   └── auth.service.ts      (logic)
│   ├── products/
│   └── brands/
```

## 📝 Coding Standards

### File Naming
- Routes: `feature.routes.ts`
- Controllers: `feature.controller.ts`
- Services: `feature.service.ts`
- Types: `feature.types.ts`

### Function Naming
- Controllers: `getProducts`, `createProduct`, `updateProduct`
- Services: `getAllProducts`, `findProductById`, `createNewProduct`

### Import Aliases
```typescript
import { prisma } from '@/shared/lib/prisma';
import { authenticate } from '@/shared/middleware/auth.middleware';
import * as service from './products.service';
```

## 🚀 Usage Example

**Creating a new feature:**

```bash
# 1. Create feature folder
mkdir -p backend/features/reviews

# 2. Create MVC files
touch backend/features/reviews/reviews.routes.ts
touch backend/features/reviews/reviews.controller.ts
touch backend/features/reviews/reviews.service.ts
touch backend/features/reviews/reviews.types.ts

# 3. Implement each layer

# 4. Register in backend/index.ts
import reviewsRoutes from './features/reviews/reviews.routes';
app.use('/api/reviews', reviewsRoutes);
```

## 📚 Resources

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Project Structure](https://github.com/goldbergyoni/nodebestpractices)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Built with clean architecture principles for long-term maintainability! 🏗️**
