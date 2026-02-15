# 💼 Business Management Features

Comprehensive business management features for Guitar NOVA e-commerce platform.

## 🎯 Overview

This document outlines the business-critical features needed for effective e-commerce management.

## 📊 Feature Categories

### 1. 🏷️ Brand Management (Quản Lý Thương Hiệu)

**Why it's needed:**
- Customers trust established brands (Yamaha, Fender, Gibson)
- Filter products by brand
- Brand-specific promotions
- Brand analytics

**Features:**
- ✅ CRUD brands (Create, Read, Update, Delete)
- ✅ Brand logo upload
- ✅ Brand information (description, website, hotline)
- ✅ Link products to brands
- ✅ Brand performance analytics
- ✅ Brand-specific banners

**Database Schema:**
```prisma
model Brand {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  logo        String?
  description String?
  website     String?
  hotline     String?
  isActive    Boolean   @default(true)
  order       Int       @default(0)
  products    Product[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**API Endpoints:**
```
GET    /api/brands              # List all brands
GET    /api/brands/:slug        # Get brand by slug
POST   /api/brands              # Create brand (Admin)
PUT    /api/brands/:id          # Update brand (Admin)
DELETE /api/brands/:id          # Delete brand (Admin)
GET    /api/brands/:id/products # Get products by brand
```

---

### 2. ⚙️ Site Settings (Cấu Hình Website)

**Why it's needed:**
- Centralized configuration
- No code changes for updates
- SEO optimization
- Brand consistency

**Features:**
- ✅ Site information (name, slogan, description)
- ✅ Logo & favicon management
- ✅ Contact information (email, phone, address)
- ✅ Social media links
- ✅ SEO settings (meta tags)
- ✅ Business hours
- ✅ Payment methods
- ✅ Shipping policies

**Database Schema:**
```prisma
model SiteSettings {
  id              String   @id @default(cuid())
  siteName        String   @default("Guitar NOVA")
  slogan          String?
  logo            String?
  favicon         String?
  email           String?
  phone           String?
  address         String?
  facebookUrl     String?
  instagramUrl    String?
  youtubeUrl      String?
  tiktokUrl       String?
  metaTitle       String?
  metaDescription String?
  metaKeywords    String[]
  businessHours   Json?
  paymentMethods  String[]
  shippingInfo    Json?
  updatedAt       DateTime @updatedAt
}
```

**API Endpoints:**
```
GET  /api/settings       # Get site settings
PUT  /api/settings       # Update settings (Admin)
```

---

### 3. 📦 Inventory Management (Quản Lý Kho)

**Why it's needed:**
- Prevent overselling
- Track stock levels
- Reorder alerts
- Inventory reports

**Features:**
- ✅ Low stock alerts (< 10 items)
- ✅ Out of stock notifications
- ✅ Stock history tracking
- ✅ Bulk stock updates
- ✅ Inventory reports by category/brand
- ✅ Product variants (if needed)

**Enhanced Product Model:**
```prisma
model Product {
  // ... existing fields
  stock           Int       @default(0)
  lowStockAlert   Int       @default(10)
  stockHistory    StockHistory[]
}

model StockHistory {
  id          String   @id @default(cuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  type        StockChangeType // IN, OUT, ADJUSTMENT
  quantity    Int
  previousQty Int
  newQty      Int
  reason      String?
  createdBy   String?
  createdAt   DateTime @default(now())
}

enum StockChangeType {
  IN          // Nhập kho
  OUT         // Xuất kho (đơn hàng)
  ADJUSTMENT  // Điều chỉnh
  RETURN      // Trả hàng
}
```

**API Endpoints:**
```
GET    /api/inventory              # Get inventory overview
GET    /api/inventory/low-stock    # Get low stock products
POST   /api/inventory/adjust       # Adjust stock (Admin)
GET    /api/inventory/history      # Stock history
```

---

### 4. 📈 Business Analytics (Phân Tích Kinh Doanh)

**Why it's needed:**
- Data-driven decisions
- Identify trends
- Optimize inventory
- Customer insights

**Features:**
- ✅ Revenue by brand
- ✅ Top selling products
- ✅ Customer lifetime value
- ✅ Sales by category
- ✅ Peak sales hours/days
- ✅ Conversion rates
- ✅ Average order value
- ✅ Cart abandonment rate

**API Endpoints:**
```
GET /api/analytics/revenue         # Revenue analytics
GET /api/analytics/products        # Product performance
GET /api/analytics/customers       # Customer analytics
GET /api/analytics/brands          # Brand performance
GET /api/analytics/overview        # Dashboard overview
```

---

### 5. 🚚 Shipping Management (Quản Lý Vận Chuyển)

**Why it's needed:**
- Flexible shipping options
- Accurate shipping costs
- Order tracking
- Customer satisfaction

**Features:**
- ✅ Multiple shipping methods (Standard, Express, Same-day)
- ✅ Shipping zones & costs
- ✅ Free shipping thresholds
- ✅ Tracking number management
- ✅ Delivery time estimates

**Database Schema:**
```prisma
model ShippingMethod {
  id              String  @id @default(cuid())
  name            String
  description     String?
  baseCost        Decimal @db.Decimal(12, 0)
  costPerKm       Decimal @db.Decimal(12, 0)
  freeThreshold   Decimal @db.Decimal(12, 0)
  estimatedDays   String
  isActive        Boolean @default(true)
  order           Int     @default(0)
}
```

---

### 6. 🎨 Media Library (Thư Viện Media)

**Why it's needed:**
- Organized image storage
- Reuse images
- Gallery management
- Faster uploads

**Features:**
- ✅ Upload multiple images
- ✅ Image gallery browser
- ✅ Search & filter images
- ✅ Image optimization
- ✅ Cloudinary integration

---

### 7. 👥 Customer Management (Quản Lý Khách Hàng)

**Why it's needed:**
- Customer segmentation
- VIP customer identification
- Marketing campaigns
- Support tickets

**Enhanced Features:**
- ✅ Customer segments (VIP, Active, Inactive, New)
- ✅ Purchase history
- ✅ Customer notes
- ✅ Blacklist management
- ✅ Email marketing lists

**Enhanced User Model:**
```prisma
model User {
  // ... existing fields
  segment         CustomerSegment @default(NEW)
  totalSpent      Decimal         @db.Decimal(12, 0) @default(0)
  orderCount      Int             @default(0)
  notes           String?
  isBlacklisted   Boolean         @default(false)
  tags            String[]
}

enum CustomerSegment {
  NEW        // < 1 order
  ACTIVE     // 1-5 orders
  VIP        // 5+ orders or > 50M spent
  INACTIVE   // No order in 6 months
}
```

---

### 8. 📧 Email Templates (Mẫu Email)

**Why it's needed:**
- Automated notifications
- Professional communication
- Brand consistency

**Templates:**
- ✅ Order confirmation
- ✅ Shipping notification
- ✅ Delivery confirmation
- ✅ Review request
- ✅ Promotional emails
- ✅ Password reset

---

### 9. 🏷️ Discount Campaigns (Chiến Dịch Giảm Giá)

**Why it's needed:**
- Scheduled promotions
- Flash sales
- Category discounts
- Holiday sales

**Database Schema:**
```prisma
model Campaign {
  id          String         @id @default(cuid())
  name        String
  description String?
  type        CampaignType
  discountType DiscountType
  discountValue Float
  startDate   DateTime
  endDate     DateTime
  conditions  Json           // Min purchase, categories, brands
  isActive    Boolean        @default(true)
  usageCount  Int            @default(0)
  createdAt   DateTime       @default(now())
}

enum CampaignType {
  FLASH_SALE
  SEASONAL
  BRAND_SPECIFIC
  CATEGORY_SPECIFIC
  CLEARANCE
}
```

---

### 10. 📊 Dashboard Widgets (Tiện Ích Dashboard)

**Key Metrics:**

1. **Today's Overview**
   - Revenue today
   - Orders today
   - New customers
   - Products sold

2. **This Week/Month**
   - Revenue trend
   - Best selling products
   - Top customers
   - Low stock alerts

3. **Quick Actions**
   - Process pending orders
   - Add new product
   - Create promotion
   - View reports

---

## 🎯 Implementation Priority

### Phase 1: Critical (Implement First) ⭐⭐⭐
1. ✅ Brand Management
2. ✅ Site Settings
3. ✅ Inventory Alerts
4. ✅ Enhanced Analytics

### Phase 2: Important ⭐⭐
5. ✅ Shipping Management
6. ✅ Customer Segmentation
7. ✅ Discount Campaigns
8. ✅ Media Library

### Phase 3: Nice to Have ⭐
9. ✅ Email Templates
10. ✅ Advanced Reports

---

## 📝 Admin Dashboard Structure

```
Admin Dashboard
├── 📊 Overview (Tổng quan)
│   ├── Revenue charts
│   ├── Quick stats
│   └── Recent activity
│
├── 🎸 Products (Sản phẩm)
│   ├── All products
│   ├── Add new
│   ├── Categories
│   └── Brands ✨ NEW
│
├── 📦 Orders (Đơn hàng)
│   ├── All orders
│   ├── Pending
│   ├── Processing
│   └── Completed
│
├── 👥 Customers (Khách hàng)
│   ├── All customers
│   ├── VIP customers
│   └── Customer segments ✨ NEW
│
├── 📊 Analytics (Phân tích)
│   ├── Sales reports
│   ├── Product performance
│   ├── Customer analytics ✨ NEW
│   └── Brand analytics ✨ NEW
│
├── 🎨 Content (Nội dung)
│   ├── Banners
│   ├── Blogs
│   ├── Landing pages
│   └── Media library ✨ NEW
│
├── 💰 Marketing (Tiếp thị)
│   ├── Vouchers
│   ├── Events
│   ├── Campaigns ✨ NEW
│   └── Email templates ✨ NEW
│
├── 🚚 Operations (Vận hành)
│   ├── Inventory ✨ NEW
│   ├── Shipping methods ✨ NEW
│   └── Reviews
│
└── ⚙️ Settings (Cài đặt)
    ├── Site settings ✨ NEW
    ├── Payment methods ✨ NEW
    └── Admin users
```

---

## 🔄 User Flow Examples

### Example 1: Brand Management
```
Admin → Products → Brands
→ Click "Add Brand"
→ Enter: Name, Logo, Description, Website, Hotline
→ Save
→ Brand appears in product filters
→ Analytics track brand performance
```

### Example 2: Low Stock Alert
```
Product stock < 10
→ Dashboard shows alert badge
→ Admin clicks alert
→ Sees list of low stock products
→ Can bulk update stock
→ Or mark for reorder
```

### Example 3: Campaign Creation
```
Admin → Marketing → Campaigns
→ Click "Create Campaign"
→ Select: Flash Sale, 20% off
→ Set: Start/End date
→ Choose: All Electric Guitars
→ Save
→ Campaign auto-activates
→ Products show discount
```

---

## 💡 Business Benefits

| Feature | Business Impact |
|---------|----------------|
| **Brand Management** | Better product organization, brand-based marketing |
| **Site Settings** | Professional appearance, easy updates |
| **Inventory Alerts** | Prevent stockouts, optimize inventory |
| **Analytics** | Data-driven decisions, identify opportunities |
| **Shipping Management** | Customer satisfaction, cost optimization |
| **Campaigns** | Increase sales, clear old stock |
| **Customer Segmentation** | Targeted marketing, customer retention |

---

## 🚀 Next Steps

1. Update database schema with new models
2. Create backend API routes
3. Build admin UI components
4. Integrate with existing dashboard
5. Add analytics tracking
6. Create documentation
7. Test all features

---

**Built for real business needs! 💼**
