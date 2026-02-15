# 📡 Guitar NOVA API Documentation

Base URL: `http://localhost:3001`

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Get Token

**POST** `/api/auth/login`

```json
{
  "email": "user@gmail.com",
  "password": "user123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@gmail.com",
    "name": "User Name",
    "role": "USER",
    "points": 2500
  }
}
```

---

## 👤 Auth Routes

### Register

**POST** `/api/auth/register`

```json
{
  "email": "newuser@gmail.com",
  "password": "password123",
  "name": "New User"
}
```

### Login

**POST** `/api/auth/login`

```json
{
  "email": "user@gmail.com",
  "password": "user123"
}
```

### Get Current User

**GET** `/api/auth/me`

Headers: `Authorization: Bearer <token>`

---

## 🎸 Products Routes

### Get All Products

**GET** `/api/products`

Query params:
- `category`: Filter by category ID
- `search`: Search by name
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `sort`: Sort by (price_asc, price_desc, rating, newest)
- `limit`: Number of items (default: 20)
- `offset`: Skip items (default: 0)

Example:
```
GET /api/products?category=acoustic&sort=price_asc&limit=10
```

**Response:**
```json
{
  "products": [
    {
      "id": "prod_123",
      "name": "Yamaha F310",
      "slug": "yamaha-f310",
      "price": "3500000",
      "oldPrice": "4000000",
      "discount": 12,
      "image": "https://...",
      "images": ["https://...", "https://..."],
      "categoryId": "cat_123",
      "description": "Acoustic guitar...",
      "specs": ["Top: Spruce", "Back: Meranti"],
      "rating": 4.5,
      "stock": 50,
      "isActive": true,
      "isFeatured": true
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

### Get Product by Slug

**GET** `/api/products/:slug`

Example: `/api/products/yamaha-f310`

### Create Product (Admin only)

**POST** `/api/products`

Headers: `Authorization: Bearer <admin_token>`

```json
{
  "name": "Fender Stratocaster",
  "slug": "fender-stratocaster",
  "price": 15000000,
  "oldPrice": 18000000,
  "discount": 16,
  "image": "https://...",
  "images": ["https://...", "https://..."],
  "categoryId": "cat_electric",
  "description": "Classic electric guitar",
  "specs": ["Body: Alder", "Neck: Maple"],
  "stock": 10,
  "isFeatured": true
}
```

### Update Product (Admin only)

**PUT** `/api/products/:id`

Headers: `Authorization: Bearer <admin_token>`

### Delete Product (Admin only)

**DELETE** `/api/products/:id`

Headers: `Authorization: Bearer <admin_token>`

---

## 📂 Categories Routes

### Get All Categories

**GET** `/api/categories`

**Response:**
```json
{
  "categories": [
    {
      "id": "cat_123",
      "name": "Electric Guitar",
      "slug": "electric-guitar",
      "parentId": null,
      "children": [],
      "products": []
    }
  ]
}
```

### Create Category (Admin only)

**POST** `/api/categories`

Headers: `Authorization: Bearer <admin_token>`

```json
{
  "name": "Bass Guitar",
  "slug": "bass-guitar",
  "parentId": null
}
```

### Update Category (Admin only)

**PUT** `/api/categories/:id`

### Delete Category (Admin only)

**DELETE** `/api/categories/:id`

---

## 🎫 Vouchers Routes

### Get All Vouchers

**GET** `/api/vouchers`

### Get User's Redeemed Vouchers

**GET** `/api/vouchers/my-vouchers`

Headers: `Authorization: Bearer <token>`

### Redeem Voucher

**POST** `/api/vouchers/:id/redeem`

Headers: `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Đổi voucher thành công",
  "voucher": {...},
  "newPoints": 1500
}
```

### Create Voucher (Admin only)

**POST** `/api/vouchers`

```json
{
  "code": "SUMMER2024",
  "title": "Summer Sale",
  "description": "Giảm giá mùa hè",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "pointsCost": 1000,
  "minPurchase": 1000000,
  "maxDiscount": 500000,
  "expiryDate": "2024-12-31T23:59:59Z",
  "usageLimit": 100
}
```

---

## 🎉 Events Routes

### Get All Events

**GET** `/api/events`

Query params:
- `status`: active, upcoming, past

### Create Event (Admin only)

**POST** `/api/events`

```json
{
  "title": "Login Streak Event",
  "description": "Đăng nhập liên tiếp 7 ngày",
  "type": "LOGIN_STREAK",
  "rewardType": "POINTS",
  "rewardValue": 500,
  "conditions": {
    "days": 7
  },
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "image": "https://..."
}
```

---

## 📝 Blog Routes

### Get All Blog Posts

**GET** `/api/blogs`

Query params:
- `search`: Search title/content
- `category`: Filter by category
- `published`: true/false

### Get Blog Post by Slug

**GET** `/api/blogs/:slug`

### Increment Blog Views

**POST** `/api/blogs/:id/view`

### Create Blog Post (Admin only)

**POST** `/api/blogs`

```json
{
  "slug": "guitar-buying-guide",
  "title": "Hướng dẫn chọn mua guitar",
  "excerpt": "Bài viết chi tiết...",
  "content": "Full content...",
  "coverImage": "https://...",
  "authorName": "Admin",
  "authorAvatar": "https://...",
  "category": "Guides",
  "tags": ["guitar", "beginner", "guide"],
  "readTime": 10,
  "isPublished": true,
  "publishedDate": "2024-01-01T00:00:00Z"
}
```

---

## 🎨 Banners Routes

### Get All Active Banners

**GET** `/api/banners`

### Create Banner (Admin only)

**POST** `/api/banners`

```json
{
  "image": "https://...",
  "title": "Summer Sale",
  "subtitle": "Up to 50% off",
  "link": "/promo",
  "order": 1,
  "isActive": true
}
```

---

## 🏠 Landing Pages Routes

### Get All Landing Pages

**GET** `/api/landing-pages`

### Get Landing Page by Slug

**GET** `/api/landing-pages/:slug`

### Create Landing Page (Admin only)

**POST** `/api/landing-pages`

```json
{
  "slug": "summer-sale",
  "title": "Summer Sale 2024",
  "subtitle": "Giảm giá đến 50%",
  "sections": [
    {
      "type": "hero",
      "title": "Welcome",
      "content": "...",
      "image": "https://..."
    }
  ],
  "isPublished": true
}
```

---

## 🛒 Orders Routes

### Get User's Orders

**GET** `/api/orders`

Headers: `Authorization: Bearer <token>`

### Create Order

**POST** `/api/orders`

Headers: `Authorization: Bearer <token>`

```json
{
  "items": [
    {
      "productId": "prod_123",
      "name": "Yamaha F310",
      "price": 3500000,
      "quantity": 1
    }
  ],
  "totalAmount": 3500000,
  "address": "123 ABC Street, District 1, HCMC",
  "phone": "0912345678",
  "notes": "Giao hàng giờ hành chính"
}
```

### Update Order Status (Admin only)

**PUT** `/api/orders/:id/status`

```json
{
  "status": "CONFIRMED"
}
```

Status values: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED

---

## 📤 Upload Routes

### Upload Image

**POST** `/api/upload`

Headers:
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

Form data:
- `file`: Image file

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "guitar-nova/abc123"
}
```

---

## 🏥 Health Check

**GET** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 📊 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (No token or invalid token) |
| 403 | Forbidden (User doesn't have permission) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔒 Admin Routes

Require `role: ADMIN` in JWT token:

- POST/PUT/DELETE `/api/products`
- POST/PUT/DELETE `/api/categories`
- POST/PUT/DELETE `/api/banners`
- POST/PUT/DELETE `/api/vouchers`
- POST/PUT/DELETE `/api/events`
- POST/PUT/DELETE `/api/blogs`
- POST/PUT/DELETE `/api/landing-pages`
- PUT `/api/orders/:id/status`

---

## 📝 Example Usage (cURL)

### Login and Get Token

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gmail.com","password":"user123"}'
```

### Get Products with Token

```bash
TOKEN="your_jwt_token_here"

curl http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN"
```

### Create Product (Admin)

```bash
ADMIN_TOKEN="admin_jwt_token_here"

curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fender Stratocaster",
    "slug": "fender-strat",
    "price": 15000000,
    "image": "https://example.com/image.jpg",
    "categoryId": "cat_123",
    "stock": 10
  }'
```

---

## 🧪 Testing with Postman

1. Import base URL: `http://localhost:3001`
2. Create environment variable: `token`
3. Set up authentication:
   - Login → Save token to environment
   - Use `{{token}}` in Authorization headers
4. Test all endpoints

---

**Cập nhật lần cuối: 2024**
