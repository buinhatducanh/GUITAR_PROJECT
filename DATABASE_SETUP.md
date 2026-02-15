# 🗄️ Database Setup Guide

## ⚠️ Current Status

**Database connection is currently unavailable** in this environment due to network restrictions. The Neon PostgreSQL database cannot be reached from this sandbox environment.

However, all the necessary configurations and code are in place. You'll need to complete the database setup in an environment with internet access.

## 📋 What's Already Done

✅ **Dependencies Installed**
- All npm packages installed (519 packages)
- Prisma Client generated successfully

✅ **Configuration Files Ready**
- `.env` with Neon database credentials
- `.env.example` template for new setups
- `.env.local.example` for local database
- `docker-compose.yml` for local PostgreSQL

✅ **Database Schema Defined**
- Complete Prisma schema with 13 models
- All relations and constraints configured
- Seed file ready with demo data

## 🚀 Complete Setup Steps (Run in Your Environment)

### Option 1: Using Neon PostgreSQL (Cloud)

The `.env` file is already configured with Neon credentials:

```bash
# 1. Database is already configured in .env
# Just run these commands:

# Push schema to create tables
npm run db:push

# Seed demo data
npm run db:seed

# Verify connection
npx tsx test-db-connection.ts
```

**Expected Output:**
```
✅ Database connected successfully!
Database version: PostgreSQL 15.x
```

### Option 2: Using Local PostgreSQL (Docker)

If you prefer a local database:

```bash
# 1. Start PostgreSQL container
docker-compose up -d

# 2. Update .env with local database URL
# Replace DATABASE_URL with:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/guitar_nova?schema=public"

# 3. Push schema
npm run db:push

# 4. Seed data
npm run db:seed

# 5. Start development
npm run dev
```

### Option 3: Create New Neon Database

If you want your own Neon database:

1. **Go to https://neon.tech**
2. **Sign up** (Free tier available)
3. **Create new project**: "guitar-nova"
4. **Copy connection string**
5. **Update .env:**
   ```bash
   DATABASE_URL="your_new_connection_string"
   ```
6. **Run setup:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

## 🔍 Verifying Database Setup

### Check Tables Created

```bash
npx prisma studio
```

This opens a GUI at http://localhost:5555 where you can see:
- 13 tables created
- Seed data loaded
- Relationships working

### Test API Endpoints

After running `npm run dev`, test these endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Get products (should return seeded data)
curl http://localhost:3001/api/products

# Get categories
curl http://localhost:3001/api/categories

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gmail.com","password":"user123"}'
```

## 📊 What Gets Created

### Tables (13 models)

1. **users** - User accounts (admin + regular users)
2. **products** - Guitar products (~20 items)
3. **categories** - Product categories (7 categories)
4. **reviews** - Product reviews
5. **orders** - Customer orders
6. **order_items** - Order line items
7. **banners** - Homepage carousel banners (~5 banners)
8. **vouchers** - Discount vouchers (~10 vouchers)
9. **user_vouchers** - Redeemed vouchers
10. **events** - Loyalty events (~5 events)
11. **blog_posts** - Blog articles (~15 posts)
12. **landing_pages** - Custom landing pages (~3 pages)

### Demo Accounts Created

**Admin:**
- Email: `admin@guitarNOVA.com`
- Password: `admin123`
- Points: 99,999
- Role: ADMIN

**Regular User:**
- Email: `user@gmail.com`
- Password: `user123`
- Points: 2,500
- Role: USER

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Cause:** Network connectivity issue or wrong DATABASE_URL

**Solutions:**
1. Check internet connection
2. Verify DATABASE_URL in `.env`
3. Try using local Docker database
4. Check Neon dashboard (database might be sleeping)

### Error: "P1001: Can't reach database"

**Cause:** Database server not accessible

**Solutions:**
```bash
# Test DNS resolution
ping ep-bitter-paper-aia4uxky-pooler.c-4.us-east-1.aws.neon.tech

# Use local database instead
docker-compose up -d
# Update DATABASE_URL in .env to local
```

### Error: "Migration failed"

**Cause:** Schema conflicts or locked database

**Solutions:**
```bash
# Force reset and recreate
npx prisma db push --force-reset

# Then seed again
npm run db:seed
```

### Prisma Client Out of Sync

**Cause:** Schema changed but client not regenerated

**Solution:**
```bash
npm run db:generate
```

## 🔄 Database Reset

If you need to start fresh:

```bash
# WARNING: This deletes all data!

# 1. Reset database
npx prisma db push --force-reset

# 2. Regenerate client
npm run db:generate

# 3. Seed fresh data
npm run db:seed
```

## 📈 Database Performance

### Indexes Created

The schema includes indexes on frequently queried fields:

```prisma
@@index([categoryId])  // Products by category
@@index([slug])        // Products by slug
@@unique([email])      // User by email
```

### Optimizations

- Foreign key constraints for data integrity
- Cascade deletes for order items
- Default values to reduce NULL checks
- Decimal(12,0) for currency (no floating point errors)

## 🔐 Security Notes

### Production Checklist

- [ ] Change DATABASE_URL to production database
- [ ] Use strong JWT_SECRET (not the default)
- [ ] Enable SSL mode: `?sslmode=require`
- [ ] Set up database backups
- [ ] Create read-only user for analytics
- [ ] Enable row-level security if needed
- [ ] Monitor connection pooling
- [ ] Set up database monitoring/alerts

### Environment Variables

Never commit these to Git:
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Token signing key
- `CLOUDINARY_API_SECRET` - Image upload secret

## 📚 Prisma Commands Reference

| Command | Description |
|---------|-------------|
| `npx prisma db push` | Sync schema to database |
| `npx prisma db pull` | Pull schema from database |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma studio` | Open database GUI |
| `npx prisma migrate dev` | Create migration (for production) |
| `npx prisma db seed` | Run seed script |
| `npx prisma format` | Format schema file |
| `npx prisma validate` | Validate schema |

## 🎯 Next Steps

Once database is connected:

1. ✅ Run `npm run db:push`
2. ✅ Run `npm run db:seed`
3. ✅ Start dev server: `npm run dev`
4. ✅ Visit http://localhost:5173
5. ✅ Login with demo accounts
6. ✅ Test all features

## 📞 Support

If you encounter database issues:

1. Check this guide first
2. Read [SETUP.md](SETUP.md)
3. Review Prisma docs: https://www.prisma.io/docs
4. Check Neon status: https://neon.tech/status
5. Create issue on GitHub with error details

---

**The database setup is the final step to get Guitar NOVA fully operational! 🎸**
