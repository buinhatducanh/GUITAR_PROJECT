# 🚀 Hướng Dẫn Setup Dự Án Guitar NOVA

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: v18.x hoặc mới hơn
- **npm**: v9.x hoặc mới hơn
- **Database**: PostgreSQL (Neon, Supabase, hoặc local)
- **Git**: Để clone repository

## 🔧 Cài Đặt Chi Tiết

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd GUITAR_PROJECT
```

### Bước 2: Cài Đặt Dependencies

```bash
npm install
```

⏱️ Thời gian: ~2-3 phút (tùy thuộc tốc độ mạng)

### Bước 3: Cấu Hình Environment Variables

1. **Copy file .env.example:**
   ```bash
   cp .env.example .env
   ```

2. **Cập nhật các giá trị trong .env:**

   **a. Database (Neon PostgreSQL):**
   - Truy cập https://neon.tech
   - Tạo project mới (Free tier)
   - Copy connection string
   - Paste vào `DATABASE_URL`

   **b. Cloudinary (Upload ảnh):**
   - Truy cập https://cloudinary.com
   - Đăng ký tài khoản free
   - Vào Dashboard → Copy:
     - Cloud Name
     - API Key
     - API Secret
   - Paste vào file .env

   **c. JWT Secret:**
   - Tạo chuỗi random: `openssl rand -base64 32`
   - Hoặc dùng: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - Paste vào `JWT_SECRET`

### Bước 4: Thiết Lập Database

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push schema lên database (tạo tables)
npm run db:push

# 3. Seed dữ liệu mẫu
npm run db:seed
```

**Lưu ý:**
- Nếu `db:push` lỗi, kiểm tra lại `DATABASE_URL` trong `.env`
- Seed data bao gồm:
  - 2 users (admin + user)
  - 20+ products
  - Categories, banners, vouchers, events, blog posts

### Bước 5: Kiểm Tra Kết Nối Database (Optional)

```bash
npx tsx test-db-connection.ts
```

Kết quả mong đợi:
```
✅ Database connected successfully!
Database version: PostgreSQL 15.x
```

### Bước 6: Chạy Development Server

```bash
npm run dev
```

Dự án sẽ chạy trên:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🎯 Test Tính Năng

### 1. Đăng Nhập User

- URL: http://localhost:5173/login
- Email: `user@gmail.com`
- Password: `user123`
- Quyền: Người dùng thường (2,500 điểm)

### 2. Đăng Nhập Admin

- URL: http://localhost:5173/admin/login
- Email: `admin@guitarNOVA.com`
- Password: `admin123`
- Quyền: Quản trị viên (99,999 điểm)

### 3. Test API Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Get products
curl http://localhost:3001/api/products

# Get categories
curl http://localhost:3001/api/categories
```

## 📂 Cấu Trúc Dự Án

```
GUITAR_PROJECT/
├── backend/                 # Express API Server
│   ├── index.ts            # Entry point
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   └── lib/                # Prisma & Cloudinary
├── src/                    # React Frontend
│   ├── app/                # App components
│   ├── features/           # Auth, Cart features
│   ├── router/             # React Router setup
│   ├── shared/             # Shared types
│   └── styles/             # Global styles
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── .env                    # Environment variables
└── package.json            # Dependencies
```

## 🐛 Troubleshooting

### Lỗi: "Can't reach database server"

**Nguyên nhân:** DATABASE_URL không đúng hoặc database không accessible

**Giải pháp:**
1. Kiểm tra lại DATABASE_URL trong `.env`
2. Đảm bảo database server đang chạy
3. Kiểm tra firewall/network
4. Thử kết nối trực tiếp bằng `psql` hoặc GUI tool

### Lỗi: "Module not found"

**Giải pháp:**
```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "Port already in use"

**Giải pháp:**
```bash
# Tìm process đang dùng port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Hoặc đổi port trong .env
PORT=3002
```

### Prisma Client không sync

**Giải pháp:**
```bash
npm run db:generate
npx prisma db push --force-reset
npm run db:seed
```

## 🌐 Production Deployment

### Vercel (Frontend)

1. Push code lên GitHub
2. Import project vào Vercel
3. Cấu hình Environment Variables
4. Deploy

### Railway/Render (Backend + Database)

1. Tạo PostgreSQL database
2. Deploy backend service
3. Set environment variables
4. Run migrations: `npx prisma db push`

## 📚 Scripts Có Sẵn

| Script | Mô Tả |
|--------|-------|
| `npm run dev` | Chạy cả FE + BE cùng lúc |
| `npm run dev:frontend` | Chỉ chạy frontend (Vite) |
| `npm run dev:backend` | Chỉ chạy backend (Express) |
| `npm run build` | Build frontend cho production |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema lên database |
| `npm run db:seed` | Seed dữ liệu mẫu |
| `npm run db:studio` | Mở Prisma Studio (GUI) |

## 🔐 Bảo Mật

**⚠️ QUAN TRỌNG cho Production:**

1. **Đổi JWT_SECRET:**
   ```bash
   # Generate secure random key
   openssl rand -base64 64
   ```

2. **Enable CORS chặt chẽ hơn:**
   ```typescript
   // backend/index.ts
   app.use(cors({
     origin: ['https://yourdomain.com'],
     credentials: true
   }));
   ```

3. **Không commit .env lên Git**
   - File `.gitignore` đã bao gồm `.env`

4. **Hash passwords:**
   - Project đã dùng `bcryptjs` để hash passwords

## 📞 Hỗ Trợ

- **Documentation**: Xem file `ACCOUNTS.md` để biết tài khoản demo
- **Issues**: Tạo issue trên GitHub repository
- **Email**: your-email@example.com

## 📝 License

MIT License - Xem file LICENSE để biết chi tiết

---

**Chúc bạn code vui vẻ! 🎸✨**
