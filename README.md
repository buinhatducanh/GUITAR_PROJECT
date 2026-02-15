# 🎸 Guitar NOVA - Premium E-commerce Platform

A full-stack e-commerce platform for musical instruments built with React, TypeScript, Express, and PostgreSQL.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-18.3-blue)
![Node](https://img.shields.io/badge/Node-18+-green)

## ✨ Features

### 🛍️ E-commerce Core
- **Product Catalog**: Browse 100+ guitars with advanced filtering
- **Smart Search**: Find products by name, category, price range
- **Shopping Cart**: Real-time cart management with Zustand
- **Checkout**: Streamlined checkout process
- **Order Tracking**: Track order status from pending to delivered

### 🎁 Loyalty & Rewards
- **Points System**: Earn points on purchases and activities
- **Tier System**: Bronze → Silver → Gold → Platinum
- **Voucher Exchange**: Redeem points for discount vouchers
- **Special Events**: Login streaks, referrals, special day bonuses

### 👤 User Experience
- **Authentication**: Secure JWT-based auth with bcrypt
- **User Dashboard**: Manage profile, orders, vouchers
- **Product Reviews**: Rate and review products with images
- **Responsive Design**: Mobile-first, works on all devices

### 👑 Admin Dashboard
- **Analytics**: Sales charts, revenue tracking (Day/Week/Month/Year)
- **Product Management**: Full CRUD operations
- **User Management**: View and manage users
- **Content Management**: Banners, blogs, landing pages
- **Order Management**: Update order status, track deliveries

### 📱 Additional Features
- **Blog System**: SEO-friendly blog with categories and tags
- **Landing Pages**: Dynamic landing page builder
- **Image Uploads**: Cloudinary integration
- **Dark Theme**: Modern glassmorphism design
- **Animations**: Smooth transitions with Motion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon, Supabase, or local)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GUITAR_PROJECT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Setup database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## 📖 Documentation

- **[Setup Guide](SETUP.md)** - Detailed installation instructions
- **[Atomic Design](ATOMIC_DESIGN.md)** - ⚛️ Component architecture guide
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Account Credentials](ACCOUNTS.md)** - Demo accounts and features
- **[Database Setup](DATABASE_SETUP.md)** - Database configuration help

## 🏗️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 6.3** - Build tool
- **React Router 7** - Client-side routing
- **Zustand 5** - State management
- **TanStack Query 5** - Server state management
- **Tailwind CSS 4** - Styling
- **Motion** - Animations
- **Material UI** - UI components
- **Radix UI** - Headless components

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **Prisma 7** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image hosting
- **CORS** - Cross-origin requests

### DevOps
- **Docker** - Containerization (optional)
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📂 Project Structure

### ⚛️ Atomic Design Architecture

This project follows **Atomic Design** principles for component organization:

```
GUITAR_PROJECT/
├── backend/                 # Express API Server
│   ├── index.ts            # Server entry point
│   ├── routes/             # API routes (10 routes)
│   ├── middleware/         # Auth middleware
│   └── lib/                # Prisma & Cloudinary
│
├── src/
│   ├── components/         # ⚛️ ATOMIC DESIGN
│   │   ├── atoms/          # 🔹 Basic UI elements (48 components)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ... (45 more)
│   │   │
│   │   ├── molecules/      # 🔸 Simple combinations
│   │   │   └── (to be created)
│   │   │
│   │   ├── organisms/      # 🔶 Complex sections (5 components)
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── HeroBanner.tsx
│   │   │   └── Cart.tsx
│   │   │
│   │   ├── templates/      # 📄 Page layouts
│   │   │   ├── MainLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   │
│   │   └── pages/          # 📱 Actual pages (16 pages)
│   │       ├── Home.tsx
│   │       ├── Products.tsx
│   │       ├── AdminDashboard.tsx
│   │       └── ... (13 more)
│   │
│   ├── app/                # App core
│   │   ├── context/        # React context
│   │   └── App.tsx         # Root component
│   │
│   ├── features/           # Feature modules
│   │   ├── auth/           # Auth logic
│   │   └── cart/           # Cart logic
│   │
│   ├── router/             # React Router
│   ├── shared/             # Shared utilities
│   └── styles/             # Global styles
│
├── prisma/
│   ├── schema.prisma       # Database schema (13 models)
│   └── seed.ts             # Seed data
│
└── Configuration files
    ├── .env                # Environment variables
    ├── docker-compose.yml  # Docker setup
    ├── package.json        # Dependencies
    └── vite.config.ts      # Vite config
```

**📚 Learn more**: See [ATOMIC_DESIGN.md](ATOMIC_DESIGN.md) for detailed architecture guide

## 🎯 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + backend |
| `npm run dev:frontend` | Start frontend only (Vite) |
| `npm run dev:backend` | Start backend only (Express) |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## 🔐 Demo Accounts

### User Account
- **Email**: `user@gmail.com`
- **Password**: `user123`
- **Points**: 2,500
- **Features**: Shopping, reviews, vouchers

### Admin Account
- **Email**: `admin@guitarNOVA.com`
- **Password**: `admin123`
- **Points**: 99,999
- **Features**: Full dashboard access

## 🎨 Key Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero banner, featured products |
| Products | `/products` | Product grid with filters |
| Categories | `/categories` | Browse by category |
| Promo | `/promo` | Flash sales & deals |
| Product Detail | `/products/:slug` | Product info & reviews |
| Cart | `/checkout` | Shopping cart |
| Account | `/account` | User dashboard |
| Rewards | `/rewards` | Loyalty program |
| Events | `/events` | Special events |
| Blog | `/blog` | Blog articles |
| Admin | `/admin` | Admin dashboard |

## 🌐 API Endpoints

Base URL: `http://localhost:3001/api`

### Public Routes
- `GET /health` - Health check
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /products` - List products
- `GET /products/:slug` - Product details
- `GET /categories` - List categories
- `GET /blogs` - List blog posts

### Protected Routes (Require Auth)
- `GET /auth/me` - Current user
- `POST /orders` - Create order
- `GET /orders` - User's orders
- `POST /vouchers/:id/redeem` - Redeem voucher

### Admin Routes (Require Admin Role)
- `POST/PUT/DELETE /products` - Manage products
- `POST/PUT/DELETE /categories` - Manage categories
- `POST/PUT/DELETE /banners` - Manage banners
- `POST/PUT/DELETE /vouchers` - Manage vouchers
- `PUT /orders/:id/status` - Update order status

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete reference.

## 🗄️ Database Schema

13 Prisma models with relations:

- **User** - Customer accounts
- **Product** - Guitar products
- **Category** - Product categories
- **Review** - Product reviews
- **Order** - Customer orders
- **OrderItem** - Order line items
- **Banner** - Homepage banners
- **Voucher** - Discount vouchers
- **UserVoucher** - Redeemed vouchers
- **Event** - Loyalty events
- **BlogPost** - Blog articles
- **LandingPage** - Custom landing pages

## 🐳 Docker Support

Run with local PostgreSQL:

```bash
# Start database
docker-compose up -d

# Update .env with local DB URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guitar_nova"

# Setup and run
npm run db:push
npm run db:seed
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code of Conduct
- Development workflow
- Coding standards
- PR process

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original design from [Figma Community](https://www.figma.com/design/Rtr0GPmjosZA5hqEr0QurL/Premium-E-commerce-Website-Design)
- Icons from [Lucide React](https://lucide.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Database hosting by [Neon](https://neon.tech)
- Image hosting by [Cloudinary](https://cloudinary.com)

## 📧 Contact

For questions or support:
- Create an [Issue](https://github.com/your-repo/issues)
- Email: support@guitarnova.com

## 🚧 Roadmap

- [ ] Add payment gateway integration (Stripe/PayPal)
- [ ] Implement email notifications
- [ ] Add real-time chat support
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Wishlist feature
- [ ] Product comparison
- [ ] Advanced search with Algolia

---

**Built with ❤️ and 🎸 by the Guitar NOVA Team**

⭐ Star this repo if you find it helpful!
