# Plan: Fix 3 Issues — Guest Checkout + Admin Orders Tab + Cart Consolidation

**Branch:** `claude/fix-guest-checkout-order-jlblK`

---

## Fix 1: Guest Checkout — Lưu đơn hàng vào DB

### Phân tích root cause

**Vấn đề 1 — Backend:** `POST /api/orders` yêu cầu `authenticate` middleware (JWT Bearer token). Guest không có token → 401.

**Vấn đề 2 — Frontend race condition (`Checkout.tsx`):**
- Line 56–72: `setUser(newUser)` gọi với fake in-memory user (random ID, không có trong DB)
- Line 75: `if (user)` đọc state cũ (vẫn là `null`) vì React state không update synchronously
- → `ordersApi.create()` **không bao giờ được gọi** cho guest
- → Success modal hiển thị nhưng không có đơn hàng trong DB

**Vấn đề 3 — Schema:** `Order.userId String` (NOT nullable) → bắt buộc phải có userId hợp lệ trong DB.

### Giải pháp

#### A. Backend — Thêm endpoint `POST /api/orders/guest` (không cần auth)

File: `backend/routes/orders.ts`

Thêm route mới **trước** `router.post('/', authenticate, ...)`:
- Nhận: `{ guestName, phone, items, address, notes, totalAmount }`
- Tìm user theo phone: `prisma.user.findUnique({ where: { phone } })`
- Nếu chưa có → tạo mới với password system-generated (crypto.randomUUID)
- Tạo đơn hàng với userId vừa tìm/tạo
- Trả về `{ orderNumber, id, ... }` giống endpoint hiện tại

Cần thêm `import crypto from 'crypto'` (hoặc dùng `Math.random()` cho password).

#### B. Frontend — `src/app/lib/api.ts`

Thêm `createGuest` vào `ordersApi`:
```ts
createGuest: (data: {
  guestName: string; phone: string;
  items: any[]; address: string;
  notes?: string; totalAmount: number;
}) => request<any>('/orders/guest', { method: 'POST', body: JSON.stringify(data) }),
```

#### C. Frontend — `src/components/pages/Checkout.tsx`

Xóa block tạo fake user (lines 55–72):
```ts
// XÓA:
if (!user) {
  const newUser = { id: Math.random()..., ... };
  setUser(newUser);
  toast.success(`Tài khoản đã được tạo tự động...`);
}
```

Thay thế `if (user) { try { ordersApi.create(...) } }` bằng logic thống nhất:
```ts
try {
  const orderItems = cart.map(...);
  const address = isPickup ? 'Nhận tại cửa hàng' : `${formData.address}, ${formData.city}`;
  const notes = `Thanh toán: ${methodLabel}. Họ tên: ${formData.fullName}`;

  const result = user
    ? await ordersApi.create({ items: orderItems, address, phone: formData.phone, notes, totalAmount: total })
    : await ordersApi.createGuest({ guestName: formData.fullName, phone: formData.phone, items: orderItems, address, notes, totalAmount: total });

  setOrderNumber(result.orderNumber);
} catch (err) {
  console.error('Failed to create order:', err);
  // Vẫn hiện success modal — staff xác nhận qua SĐT
}
```

---

## Fix 2: Admin Orders Tab

### A. Tạo `src/components/organisms/admin/OrdersTab.tsx`

Component mới với:
- `useEffect` gọi `ordersApi.getAll()`, lưu vào local state `orders`
- Loading/error state
- Filter bar: All | PENDING | CONFIRMED | PROCESSING | SHIPPED | DELIVERED | CANCELLED
- Table với các cột:
  - **Mã đơn** (`orderNumber`, font-mono)
  - **Khách hàng** (user.name + phone)
  - **Sản phẩm** (số lượng items)
  - **Tổng tiền** (formatPrice)
  - **Trạng thái** (badge màu theo status)
  - **Ngày đặt** (createdAt formatted)
  - **Hành động** (select dropdown để update status)
- Status badge colors:
  - PENDING → amber
  - CONFIRMED → blue
  - PROCESSING → orange
  - SHIPPED → purple
  - DELIVERED → green
  - CANCELLED → red
- Status update: select dropdown → `ordersApi.updateStatus(id, newStatus)` → refetch danh sách
- Vietnamese status labels mapping

### B. Sửa `src/components/organisms/admin/AdminSidebar.tsx`

- Thêm `ShoppingBag` vào lucide-react imports
- Thêm tab entry (sau `inventory`, trước `banners`):
  ```ts
  { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
  ```

### C. Sửa `src/components/pages/AdminDashboard.tsx`

- Thêm import: `import { OrdersTab } from '@/components/organisms/admin/OrdersTab';`
- Thêm render case trong `<AnimatePresence>`:
  ```tsx
  {activeTab === 'orders' && (
    <motion.div key="orders" {...tabAnimation}><OrdersTab /></motion.div>
  )}
  ```

---

## Fix 3: Cart System Consolidation

### Phân tích hiện trạng

| Component | Cart items | Cart open/close |
|---|---|---|
| `Cart.tsx` (drawer) | `useApp().cart` ✅ | `useCartStore().isOpen` ✅ |
| `Checkout.tsx` | `useApp().cart` ✅ | — |
| `ProductCard.tsx` | `useApp().addToCart` ✅ | không mở cart |
| `ProductDetail.tsx` | `useApp().addToCart` ✅ | không mở cart |
| `Home.tsx` | `useCartStore().addItem` ❌ | auto-open trong addItem |
| `Header.tsx` | — | `useCartStore().setIsOpen` ✅ |

**Bug thực tế:** Items thêm từ `Home.tsx` vào `cartStore.items` nhưng Cart drawer hiển thị `AppContext.cart` → cart drawer luôn trống sau khi add từ Home page.

### Giải pháp

#### A. Sửa `src/components/pages/Home.tsx`

- Xóa: `const addItem = useCartStore((state) => state.addItem);`
- Thêm `addToCart` vào destructure từ `useApp()`: `const { products, ..., addToCart } = useApp();`
- Thêm: `const setIsOpen = useCartStore((state) => state.setIsOpen);`
- Thay mọi `addItem(product)` bằng `addToCart(product); setIsOpen(true);`

#### B. Sửa `src/features/cart/store/cartStore.ts`

Chỉ giữ lại `isOpen` state và `setIsOpen` action. Xóa toàn bộ cart item management:

**Xóa khỏi interface `CartState`:** `items: CartItem[]`
**Xóa khỏi interface `CartActions`:** `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `getTotalPrice`, `getTotalItems`
**Xóa implementations** của các actions trên
**Xóa imports:** `CartItem`, `Product`, `toast`
**Cập nhật `partialize`** trong persist: bỏ `items` (chỉ persist `isOpen` hoặc bỏ persist hoàn toàn vì `isOpen` không cần persist)

---

## Thứ tự thực hiện

1. **Fix 1 — Backend** (`backend/routes/orders.ts`) — thêm `/guest` endpoint
2. **Fix 1 — API** (`src/app/lib/api.ts`) — thêm `ordersApi.createGuest`
3. **Fix 1 — Frontend** (`src/components/pages/Checkout.tsx`) — xóa fake user, sửa logic gọi API
4. **Fix 2 — OrdersTab** (`src/components/organisms/admin/OrdersTab.tsx`) — tạo mới
5. **Fix 2 — Sidebar** (`src/components/organisms/admin/AdminSidebar.tsx`) — thêm tab
6. **Fix 2 — Dashboard** (`src/components/pages/AdminDashboard.tsx`) — wire up
7. **Fix 3 — Home.tsx** — switch addItem → addToCart + setIsOpen
8. **Fix 3 — cartStore.ts** — strip item management, keep isOpen only
9. **Commit & push** to `claude/fix-guest-checkout-order-jlblK`
