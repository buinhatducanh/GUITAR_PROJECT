# 🔑 Tài Khoản Demo - Guitar NOVA (Cập nhật đầy đủ)

## 👑 Tài Khoản Admin

**Để truy cập Admin Dashboard:**

- **Email:** `admin@guitarNOVA.com`
- **Mật khẩu:** `admin123`
- **Quyền:** Quản trị viên (Full Access)
- **Điểm:** 99,999 điểm

**Tính năng Admin (Đồng bộ realtime với User):**
- ✅ Dashboard với analytics theo Ngày/Tuần/Tháng/Năm
- ✅ Biểu đồ doanh thu (LineChart)
- ✅ Biểu đồ phân loại sản phẩm (PieChart)
- ✅ Quản lý Sản phẩm (CRUD) → Thay đổi ngay lập tức trên trang user
- ✅ Quản lý Banner (CRUD) → Cập nhật carousel ngay lập tức
- ✅ Quản lý Người dùng (View + Delete)
- ✅ Quản lý Đánh giá (View + Delete)
- ✅ Quản lý Voucher (CRUD) → User thấy ngay khi admin thêm/xóa
- ✅ Quản lý Sự kiện (CRUD) → Đồng bộ với trang Events
- ✅ Quản lý Landing Pages (CRUD)
- ✅ Quản lý Blog Posts (CRUD) → **MỚI!**

---

## 👤 Tài Khoản User Thường

**Để test chức năng người dùng:**

- **Email:** `user@gmail.com`
- **Mật khẩu:** `user123`
- **Điểm thưởng:** 2,500 điểm
- **Quyền:** Người dùng thường

**Tính năng User:**
- ✅ Xem và mua sản phẩm
- ✅ Quản lý giỏ hàng
- ✅ Tích điểm thưởng (hiển thị ngay kế bên avatar)
- ✅ Đổi voucher bằng điểm
- ✅ Tham gia sự kiện
- ✅ Quản lý tài khoản cá nhân
- ✅ Đọc blog và tin tức
- ✅ Xem landing pages
- ❌ Không thể truy cập Admin Dashboard

---

## 🎯 Hướng Dẫn Test

### Test Admin Dashboard:
1. Click vào **Footer** → "Admin Dashboard"
2. Trang đăng nhập Admin sẽ xuất hiện
3. Click vào card **"👑 Admin"** để tự động điền thông tin
4. Hoặc nhập thủ công:
   - Email: `admin@guitarNOVA.com`
   - Password: `admin123`
5. Click **"Đăng nhập"**
6. Thử CRUD bất kỳ entity → Xem realtime update trên trang user

### Test User Account:
1. Click vào icon **User** ở header (góc phải)
2. Chọn **"Đăng nhập"**
3. Nhập:
   - Email: `user@gmail.com`
   - Password: `user123`
4. Click **"Đăng nhập"**
5. Điểm sẽ hiển thị ngay kế bên avatar

### Test Đồng Bộ Admin ↔ User:
1. Đăng nhập Admin trong 1 tab
2. Mở tab mới, đăng nhập User
3. Từ Admin: Thêm/Xóa sản phẩm, voucher, hoặc blog
4. Refresh trang User → Thấy thay đổi ngay lập tức
5. *Lưu ý:* Đây là React state sharing, không phải websocket realtime

---

## 🎨 Các Trang Đã Được Phân Biệt

### 1. **Trang Sản Phẩm** (`/products`)
- **Design:** Grid layout tiêu chuẩn
- **Màu:** Blue gradient
- Filter & sort options
- Hiển thị tất cả sản phẩm

### 2. **Trang Danh Mục** (`/categories`) - ĐA DẠNG!
- **Design:** Category cards với icons và màu sắc riêng biệt
- **Màu:** Multi-color (Blue, Amber, Purple, Green, Red, Pink)
- 7 categories với icon độc đáo
- Animated category selection
- Stats counter cho mỗi category

### 3. **Trang Khuyến Mãi** (`/promo`) - ĐA DẠNG!
- **Design:** Flash sale theme đặc biệt
- **Màu:** Red-Orange gradient
- Countdown timer animated
- Discount badges xoay và scale
- Stats cards: Max discount, Products, Savings
- Sort by Discount/Price/Name

### 4. **Trang Blog** (`/blog`) - MỚI!
- **Design:** Magazine-style layout
- **Màu:** Emerald-Teal gradient
- Search và filter theo category
- Blog detail page với meta info
- View counter tự động tăng
- Tags và author cards

### 5. **Trang Landing Pages** - MỚI!
- Hiển thị dynamic landing pages
- Hero sections với parallax
- Content, Gallery, CTA sections
- Admin có thể tạo/sửa/xóa

### 6. **Trang Đổi Quà** (`/rewards`)
- Voucher cards đẹp mắt
- User tier display
- Filter: All / Redeemed

### 7. **Trang Sự Kiện** (`/events`)
- Events với nhiều loại khác nhau
- Progress tracking
- Filter: Active / Upcoming / Past

### 8. **Trang Account** (`/account`)
- Thông tin cá nhân
- Stats: Orders, Spending, Vouchers
- Tabs: Info / Orders / My Vouchers

---

## 🎁 Tính Năng Mới Nhất

### ✨ Điểm Hiển Thị Kế Bên Avatar
- **Trước:** Điểm hiển thị riêng, xa avatar
- **Sau:** `[⭐ 2,500 điểm] [👤 Avatar] [🛒 Cart]`
- Compact, dễ nhìn hơn
- Amber gradient background

### 📝 Hệ Thống Blog (MỚI!)
- **BlogList Component:**
  - Grid layout 3 columns
  - Search bar chức năng đầy đủ
  - Filter theo category
  - Cover image, excerpt, tags
  - Meta info: Date, Read time, Views
  
- **BlogDetail Component:**
  - Full article view
  - Auto-increment views
  - Tags clickable
  - Author card
  - Like & Share buttons (UI only)
  - Related posts suggestion

### 🏠 Landing Pages (MỚI!)
- **LandingPageView Component:**
  - Dynamic sections: Hero, Content, Gallery, CTA
  - Responsive layout
  - Admin có thể quản lý

### 🔐 Admin Authentication
- **AdminLogin Component:**
  - Purple gradient theme professional
  - Demo accounts hiển thị sẵn
  - Click to auto-fill
  - Show/hide password
  - User không có quyền sẽ bị chặn

### 🔄 Database Đồng Bộ
- **Shared React State:**
  - Admin CRUD → User thấy ngay (sau refresh)
  - Products, Banners, Vouchers, Events, Blog
  - Không cần backend, tất cả trong AppContext

---

## 📊 Admin Dashboard - Tabs Đầy Đủ

| Tab | Tính Năng | Đồng Bộ User |
|-----|-----------|--------------|
| **Dashboard** | Analytics, Charts, Recent Activity | N/A |
| **Sản phẩm** | Add/Edit/Delete Products | ✅ Products page |
| **Banner** | Add/Edit/Delete Banners | ✅ Home carousel |
| **Người dùng** | View/Delete Users | N/A |
| **Đánh giá** | View/Delete Reviews | ✅ Product detail |
| **Voucher** | Add/Edit/Delete Vouchers | ✅ Rewards page |
| **Sự kiện** | Add/Edit/Delete Events | ✅ Events page |
| **Landing Pages** | Add/Edit/Delete Pages | ✅ Landing routes |
| **Blog Posts** | Add/Edit/Delete Posts | ✅ Blog page |

---

## 🚀 Test Flow Hoàn Chỉnh

### 1. Test Categories (Đa dạng màu sắc)
```
Header → Danh mục
→ Click "Electric Guitar" (Blue card)
→ Filter products
→ Click "Acoustic Guitar" (Amber card)
→ Thấy màu thay đổi động
```

### 2. Test Promo (Flash sale design)
```
Header → Khuyến mãi
→ Thấy countdown timer
→ Discount badges animated
→ Sort by "Giảm giá"
```

### 3. Test Blog
```
Header → Blog
→ Tìm kiếm: "guitar"
→ Click bài viết
→ Xem detail
→ Quay lại danh sách
```

### 4. Test Admin CRUD Blog
```
Login Admin
→ Tab "Blog Posts"
→ Click "Thêm blog post"
→ Nhập thông tin (UI only)
→ Click "Lưu"
→ Toast success
```

### 5. Test Điểm Hiển Thị
```
Login user
→ Xem header
→ Điểm hiển thị ngay kế avatar
→ Click avatar
→ Xem dropdown với điểm
```

---

## 📝 Danh Sách Tính Năng Đầy Đủ

### Frontend Pages (User):
1. ✅ Home - Hero với banner carousel
2. ✅ Products - Grid layout blue
3. ✅ Categories - Multi-color cards
4. ✅ Promo - Flash sale red-orange
5. ✅ Product Detail - Chi tiết sản phẩm
6. ✅ Checkout - Giỏ hàng & thanh toán
7. ✅ Auth - Login/Register
8. ✅ Account - Quản lý tài khoản
9. ✅ Rewards - Đổi voucher
10. ✅ Events - Sự kiện
11. ✅ Blog - Danh sách & chi tiết
12. ✅ Landing Pages - Dynamic pages

### Admin Dashboard:
1. ✅ Dashboard - Analytics
2. ✅ Products Management
3. ✅ Banners Management
4. ✅ Users Management
5. ✅ Reviews Management
6. ✅ Vouchers Management
7. ✅ Events Management
8. ✅ Landing Pages Management
9. ✅ Blog Posts Management

### Systems:
1. ✅ Loyalty Points System
2. ✅ Voucher Redemption System
3. ✅ Events Tracking System
4. ✅ Admin Authentication
5. ✅ React State Sync (Admin ↔ User)
6. ✅ Cart System
7. ✅ Search & Filter
8. ✅ Responsive Design
9. ✅ Animations (Motion/React)
10. ✅ Toast Notifications

---

## 🎨 Thiết Kế Đa Dạng

| Trang | Màu Chính | Layout | Đặc Điểm Nổi Bật |
|-------|-----------|--------|------------------|
| Products | Blue | Grid | Simple & clean |
| Categories | Multi | Cards Grid | 7 colors, animated selection |
| Promo | Red-Orange | Flash Sale | Countdown, badges, savings |
| Blog | Emerald-Teal | Magazine | Search, tags, views |
| Rewards | Amber | Cards | Points exchange |
| Events | Mixed | Timeline | Progress tracking |
| Admin | Purple | Dashboard | Charts, tables, CRUD |

---

## 💡 Lưu Ý Quan Trọng

1. **Mock Data Only:** Tất cả data trong React state, không có backend
2. **No Real Database:** Khi reload page, data reset về initial state
3. **Admin/User Sync:** Chỉ đồng bộ trong cùng 1 browser session
4. **Passwords:** Không mã hóa, chỉ để demo
5. **Tài khoản:** Hard-coded trong AdminLogin.tsx và Auth.tsx

---

## 🔥 Điểm Nổi Bật Website

1. **Dark Luxury Design** - Black background với gradient accents
2. **Glassmorphism** - Backdrop blur effects
3. **Micro-animations** - Motion/React animations mượt mà
4. **Responsive** - Mobile-first design
5. **Đa dạng trang** - Mỗi section có design riêng biệt
6. **Admin đầy đủ** - CRUD tất cả entities
7. **Đồng bộ realtime** - Admin changes → User sees immediately
8. **UX tốt** - Toast notifications, loading states, transitions

---

**Chúc bạn test vui vẻ và khám phá tất cả tính năng! 🎸✨**
