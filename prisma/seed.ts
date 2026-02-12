import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log('🌱 Seeding database...');

    // ─── Categories ─────────────────────────────────
    const categories = await Promise.all([
        prisma.category.upsert({ where: { slug: 'electric-guitar' }, update: {}, create: { name: 'Electric Guitar', slug: 'electric-guitar' } }),
        prisma.category.upsert({ where: { slug: 'acoustic-guitar' }, update: {}, create: { name: 'Acoustic Guitar', slug: 'acoustic-guitar' } }),
        prisma.category.upsert({ where: { slug: 'bass-guitar' }, update: {}, create: { name: 'Bass Guitar', slug: 'bass-guitar' } }),
        prisma.category.upsert({ where: { slug: 'amplifier' }, update: {}, create: { name: 'Amplifier', slug: 'amplifier' } }),
        prisma.category.upsert({ where: { slug: 'effects' }, update: {}, create: { name: 'Effects', slug: 'effects' } }),
        prisma.category.upsert({ where: { slug: 'accessories' }, update: {}, create: { name: 'Accessories', slug: 'accessories' } }),
        prisma.category.upsert({ where: { slug: 'classical-guitar' }, update: {}, create: { name: 'Classical Guitar', slug: 'classical-guitar' } }),
    ]);
    console.log(`✅ ${categories.length} categories seeded`);

    const catMap: Record<string, string> = {};
    categories.forEach(c => { catMap[c.name] = c.id; });

    // ─── Users ──────────────────────────────────────
    const hashedPassword = await bcrypt.hash('user123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    const users = await Promise.all([
        prisma.user.upsert({
            where: { email: 'admin@guitarNOVA.com' },
            update: {},
            create: { name: 'Admin Guitar NOVA', email: 'admin@guitarNOVA.com', password: adminPassword, role: 'ADMIN', points: 99999, tier: 'PLATINUM', avatar: 'https://i.pravatar.cc/150?img=68' },
        }),
        prisma.user.upsert({
            where: { email: 'user@gmail.com' },
            update: {},
            create: { name: 'User Demo', email: 'user@gmail.com', password: hashedPassword, role: 'USER', points: 2500, tier: 'GOLD', avatar: 'https://i.pravatar.cc/150?img=12' },
        }),
        prisma.user.upsert({
            where: { email: 'nguyenvanan@gmail.com' },
            update: {},
            create: { name: 'Nguyễn Văn An', email: 'nguyenvanan@gmail.com', password: hashedPassword, points: 2500, tier: 'GOLD', avatar: 'https://i.pravatar.cc/150?img=12' },
        }),
        prisma.user.upsert({
            where: { email: 'tranthib@gmail.com' },
            update: {},
            create: { name: 'Trần Thị Bình', email: 'tranthib@gmail.com', password: hashedPassword, points: 1200, tier: 'SILVER', avatar: 'https://i.pravatar.cc/150?img=45' },
        }),
        prisma.user.upsert({
            where: { email: 'leminhcuong@gmail.com' },
            update: {},
            create: { name: 'Lê Minh Cường', email: 'leminhcuong@gmail.com', password: hashedPassword, points: 850, tier: 'BRONZE', avatar: 'https://i.pravatar.cc/150?img=33' },
        }),
        prisma.user.upsert({
            where: { email: 'phamthuha@gmail.com' },
            update: {},
            create: { name: 'Phạm Thu Hà', email: 'phamthuha@gmail.com', password: hashedPassword, points: 5800, tier: 'PLATINUM', avatar: 'https://i.pravatar.cc/150?img=23' },
        }),
        prisma.user.upsert({
            where: { email: 'hoangducem@gmail.com' },
            update: {},
            create: { name: 'Hoàng Đức Em', email: 'hoangducem@gmail.com', password: hashedPassword, points: 300, tier: 'BRONZE', avatar: 'https://i.pravatar.cc/150?img=51' },
        }),
    ]);
    console.log(`✅ ${users.length} users seeded`);

    // ─── Products ───────────────────────────────────
    const products = await Promise.all([
        prisma.product.upsert({
            where: { slug: 'fender-stratocaster-american-professional-ii' },
            update: {},
            create: {
                name: 'Fender Stratocaster American Professional II',
                slug: 'fender-stratocaster-american-professional-ii',
                price: 45900000, oldPrice: 52000000, discount: 12,
                image: 'https://images.unsplash.com/photo-1763162603999-8a1958b13cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMHByZW1pdW0lMjB3b29kfGVufDF8fHx8MTc3MDQxMTY3NXww&ixlib=rb-4.1.0&q=80&w=1080',
                categoryId: catMap['Electric Guitar'],
                description: 'Guitar điện cao cấp với âm thanh đặc trưng Fender. Thiết kế classic với công nghệ hiện đại.',
                specs: ['Body: Alder', 'Neck: Maple', 'Fretboard: Rosewood', 'Pickups: V-Mod II Single-Coil'],
                rating: 4.9, stock: 15, isFeatured: true,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'gibson-les-paul-standard-60s' },
            update: {},
            create: {
                name: 'Gibson Les Paul Standard 60s',
                slug: 'gibson-les-paul-standard-60s',
                price: 68500000, oldPrice: 75000000, discount: 9,
                image: 'https://images.unsplash.com/photo-1692501735268-30251c6a30e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZ3VpdGFyJTIwY29sbGVjdGlvbnxlbnwxfHx8fDE3NzA0MTE2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
                categoryId: catMap['Electric Guitar'],
                description: 'Biểu tượng của rock với âm thanh ấm áp, thick và sustain tuyệt vời.',
                specs: ['Body: Mahogany', 'Top: Maple', 'Neck: Mahogany', 'Pickups: BurstBucker 61'],
                rating: 5.0, stock: 8, isFeatured: true,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'yamaha-fg800-acoustic' },
            update: {},
            create: {
                name: 'Yamaha FG800 Acoustic',
                slug: 'yamaha-fg800-acoustic',
                price: 8900000, oldPrice: 10500000, discount: 15,
                image: 'https://images.unsplash.com/photo-1763162603999-8a1958b13cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMHByZW1pdW0lMjB3b29kfGVufDF8fHx8MTc3MDQxMTY3NXww&ixlib=rb-4.1.0&q=80&w=1080',
                categoryId: catMap['Acoustic Guitar'],
                description: 'Guitar acoustic phổ biến nhất cho người mới bắt đầu và chuyên nghiệp.',
                specs: ['Top: Solid Spruce', 'Back/Sides: Nato', 'Neck: Nato', 'Finish: Natural'],
                rating: 4.7, stock: 30, isFeatured: true,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'fender-precision-bass' },
            update: {},
            create: {
                name: 'Fender Precision Bass',
                slug: 'fender-precision-bass',
                price: 42000000,
                image: 'https://images.unsplash.com/photo-1695192577284-fd1b10529579?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNzJTIwZ3VpdGFyJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDQxMTY3NXww&ixlib=rb-4.1.0&q=80&w=1080',
                categoryId: catMap['Bass Guitar'],
                description: 'Bass guitar legendary với âm thanh punchy và định nghĩa rõ ràng.',
                specs: ['Body: Alder', 'Neck: Maple', 'Fretboard: Pau Ferro', 'Pickups: Split Single-Coil'],
                rating: 4.8, stock: 12,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'marshall-dsl40cr-amplifier' },
            update: {},
            create: {
                name: 'Marshall DSL40CR Amplifier',
                slug: 'marshall-dsl40cr-amplifier',
                price: 24500000, oldPrice: 28000000, discount: 13,
                image: 'https://images.unsplash.com/photo-1565829073670-cd08d8c63643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBhbXBsaWZpZXIlMjBzdHVkaW8lMjB2aW50YWdlfGVufDF8fHx8MTc3MDQxMTY3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
                categoryId: catMap['Amplifier'],
                description: 'Ampli all-tube 40W với classic Marshall tone và hiệu ứng reverb.',
                specs: ['Power: 40W', 'Channels: 2', 'Effects: Reverb', 'Speaker: 12" Celestion'],
                rating: 4.9, stock: 10, isFeatured: true,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'boss-gt-1000-effects-processor' },
            update: {},
            create: {
                name: 'Boss GT-1000 Effects Processor',
                slug: 'boss-gt-1000-effects-processor',
                price: 18900000,
                image: 'https://images.unsplash.com/photo-1662434243640-42988ab42db8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBwZWRhbCUyMGVmZmVjdHMlMjBib2FyZHxlbnwxfHx8fDE3NzA0MTE2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
                categoryId: catMap['Effects'],
                description: 'Bộ xử lý hiệu ứng flagship với công nghệ AIRD và amp modeling.',
                specs: ['DSP: BOSS flagship', 'Presets: 250+', 'Effects: 200+', 'Interface: USB Audio'],
                rating: 4.8, stock: 20,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'daddario-nyxl-strings' },
            update: {},
            create: {
                name: "D'Addario NYXL Strings",
                slug: 'daddario-nyxl-strings',
                price: 280000, oldPrice: 350000, discount: 20,
                image: 'https://images.unsplash.com/photo-1674485146230-d654464e477c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBzdHJpbmdzJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzA0MTE2NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
                categoryId: catMap['Accessories'],
                description: 'Dây đàn cao cấp với độ bền gấp đôi và tuning stability tốt nhất.',
                specs: ['Gauge: 10-46', 'Material: Nickel Wound', 'Core: High Carbon Steel', 'Coating: NYXL'],
                rating: 4.6, stock: 100,
            },
        }),
        prisma.product.upsert({
            where: { slug: 'taylor-814ce-grand-auditorium' },
            update: {},
            create: {
                name: 'Taylor 814ce Grand Auditorium',
                slug: 'taylor-814ce-grand-auditorium',
                price: 89000000, oldPrice: 95000000, discount: 6,
                image: 'https://images.unsplash.com/photo-1741701862902-01b463d10435?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMGd1aXRhciUyMHdhbGx8ZW58MXx8fHwxNzcwNDExNjc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
                categoryId: catMap['Acoustic Guitar'],
                description: 'Acoustic guitar cao cấp với âm thanh cân bằng hoàn hảo.',
                specs: ['Top: Solid Sitka Spruce', 'Back/Sides: Indian Rosewood', 'Electronics: ES2', 'Cutaway: Venetian'],
                rating: 5.0, stock: 5, isFeatured: true,
            },
        }),
    ]);
    console.log(`✅ ${products.length} products seeded`);

    // ─── Banners ────────────────────────────────────
    const existingBanners = await prisma.banner.count();
    if (existingBanners === 0) {
        await prisma.banner.createMany({
            data: [
                { image: 'https://images.unsplash.com/photo-1626406512368-ae4ad84da00f?w=1200', title: 'Bộ Sưu Tập Mới 2026', subtitle: 'Khám phá các mẫu guitar premium mới nhất từ các thương hiệu hàng đầu thế giới', link: '/landing/collection-2026', order: 1 },
                { image: 'https://images.unsplash.com/photo-1692501735268-30251c6a30e3?w=1200', title: 'Giảm Giá Đến 30%', subtitle: 'Sale lớn nhất năm - Đừng bỏ lỡ cơ hội sở hữu guitar mơ ước', link: '/promo', order: 2 },
                { image: 'https://images.unsplash.com/photo-1741701862902-01b463d10435?w=1200', title: 'Thương Hiệu Guitar NOVA', subtitle: 'Hơn 10 năm mang âm nhạc đến gần hơn với bạn', link: '/landing/about', order: 3 },
            ],
        });
        console.log('✅ 3 banners seeded');
    }

    // ─── Blog Posts ─────────────────────────────────
    const blogPosts = [
        { slug: 'guitar-cho-nguoi-moi-bat-dau', title: 'Guitar cho Người Mới Bắt Đầu', excerpt: 'Hướng dẫn chọn guitar phù hợp cho người mới bắt đầu chơi đàn.', content: 'Đây là một bài viết hướng dẫn chi tiết...', coverImage: 'https://images.unsplash.com/photo-1692501735268-30251c6a30e3?w=1200', authorName: 'Nguyễn Văn An', authorAvatar: 'https://i.pravatar.cc/150?img=12', category: 'Hướng dẫn', tags: ['guitar', 'mới bắt đầu', 'hướng dẫn'], readTime: 5, views: 1200, isPublished: true, publishedDate: new Date('2026-02-01') },
        { slug: 'top-5-guitar-electric-hot-nhat-2026', title: 'Top 5 Guitar Điện Hot Nhất 2026', excerpt: 'Danh sách các mẫu guitar điện được yêu thích nhất năm 2026.', content: 'Đây là danh sách top 5 guitar điện...', coverImage: 'https://images.unsplash.com/photo-1626406512368-ae4ad84da00f?w=1200', authorName: 'Trần Thị Bình', authorAvatar: 'https://i.pravatar.cc/150?img=45', category: 'Đánh giá', tags: ['guitar điện', 'top 5', '2026'], readTime: 7, views: 2400, isPublished: true, publishedDate: new Date('2026-02-05') },
        { slug: 'cach-bao-quan-guitar', title: 'Cách Bảo Quản Guitar Đúng Cách', excerpt: 'Hướng dẫn bảo quản và chăm sóc guitar để giữ âm thanh tốt nhất.', content: 'Bảo quản guitar đúng cách...', coverImage: 'https://images.unsplash.com/photo-1763162603999-8a1958b13cf1?w=1200', authorName: 'Lê Minh Cường', authorAvatar: 'https://i.pravatar.cc/150?img=33', category: 'Hướng dẫn', tags: ['bảo quản', 'chăm sóc', 'guitar'], readTime: 6, views: 980, isPublished: true, publishedDate: new Date('2026-02-08') },
        { slug: 'lich-su-guitar-fender', title: 'Lịch Sử Huyền Thoại Fender', excerpt: 'Câu chuyện về thương hiệu guitar Fender.', content: 'Fender Musical Instruments Corporation...', coverImage: 'https://images.unsplash.com/photo-1695192577284-fd1b10529579?w=1200', authorName: 'Nguyễn Văn An', authorAvatar: 'https://i.pravatar.cc/150?img=12', category: 'Lịch sử', tags: ['Fender', 'lịch sử', 'guitar điện'], readTime: 8, views: 1560, isPublished: true, publishedDate: new Date('2026-02-03') },
        { slug: 'kien-thuc-co-ban-ve-am-thanh-guitar', title: 'Kiến Thức Cơ Bản Về Âm Thanh Guitar', excerpt: 'Tìm hiểu về các yếu tố ảnh hưởng đến âm thanh của guitar.', content: 'Âm thanh guitar phụ thuộc vào nhiều yếu tố...', coverImage: 'https://images.unsplash.com/photo-1565829073670-cd08d8c63643?w=1200', authorName: 'Trần Thị Bình', authorAvatar: 'https://i.pravatar.cc/150?img=45', category: 'Kiến thức', tags: ['âm thanh', 'tone', 'kiến thức'], readTime: 9, views: 1890, isPublished: true, publishedDate: new Date('2026-02-09') },
    ];

    for (const post of blogPosts) {
        await prisma.blogPost.upsert({ where: { slug: post.slug }, update: {}, create: post });
    }
    console.log(`✅ ${blogPosts.length} blog posts seeded`);

    // ─── Vouchers ───────────────────────────────────
    const vouchers = [
        { code: 'NOVA500K', title: 'Giảm 500K cho đơn hàng', description: 'Áp dụng cho đơn hàng từ 5 triệu', discountType: 'FIXED' as const, discountValue: 500000, pointsCost: 1000, minPurchase: 5000000, expiryDate: new Date('2026-03-31'), usageLimit: 100, usedCount: 23 },
        { code: 'NOVA15', title: 'Giảm 15% đơn hàng', description: 'Giảm tối đa 2 triệu cho mọi đơn hàng', discountType: 'PERCENTAGE' as const, discountValue: 15, pointsCost: 1500, minPurchase: 0, maxDiscount: 2000000, expiryDate: new Date('2026-04-30'), usageLimit: 50, usedCount: 12 },
        { code: 'FREESHIP', title: 'Miễn phí vận chuyển', description: 'Free ship toàn quốc mọi đơn hàng', discountType: 'FIXED' as const, discountValue: 50000, pointsCost: 500, minPurchase: 0, expiryDate: new Date('2026-05-31'), usageLimit: 200, usedCount: 89 },
        { code: 'PREMIUM20', title: 'Giảm 20% cho sản phẩm cao cấp', description: 'Áp dụng cho guitar trên 30 triệu', discountType: 'PERCENTAGE' as const, discountValue: 20, pointsCost: 2500, minPurchase: 30000000, maxDiscount: 5000000, expiryDate: new Date('2026-06-30'), usageLimit: 30, usedCount: 5 },
        { code: 'ACCESSORY', title: 'Giảm 100K phụ kiện', description: 'Dành cho phụ kiện guitar', discountType: 'FIXED' as const, discountValue: 100000, pointsCost: 300, minPurchase: 500000, expiryDate: new Date('2026-07-31'), usageLimit: 150, usedCount: 67 },
    ];

    for (const v of vouchers) {
        await prisma.voucher.upsert({ where: { code: v.code }, update: {}, create: v });
    }
    console.log(`✅ ${vouchers.length} vouchers seeded`);

    // ─── Events ─────────────────────────────────────
    const existingEvents = await prisma.event.count();
    if (existingEvents === 0) {
        await prisma.event.createMany({
            data: [
                { title: 'Đăng nhập liên tục 7 ngày', description: 'Đăng nhập mỗi ngày trong 7 ngày liên tiếp để nhận 1000 điểm thưởng', type: 'LOGIN_STREAK', rewardType: 'POINTS', rewardValue: 1000, conditions: { days: 7 }, startDate: new Date('2026-02-01'), endDate: new Date('2026-12-31'), isActive: true },
                { title: 'Valentine Couple Deal', description: 'Mua guitar cùng người yêu vào ngày Valentine để được giảm 10%', type: 'PURCHASE_COUPLE', rewardType: 'DISCOUNT', rewardValue: 10, conditions: { specificDate: '2026-02-14', requireCoupleCode: true }, startDate: new Date('2026-02-10'), endDate: new Date('2026-02-14'), isActive: true },
                { title: 'Khách hàng mới - Giảm ngay 15%', description: 'Đơn hàng đầu tiên được giảm 15%, tối đa 1 triệu đồng', type: 'FIRST_PURCHASE', rewardType: 'DISCOUNT', rewardValue: 15, conditions: {}, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), isActive: true },
                { title: 'Giới thiệu bạn bè', description: 'Giới thiệu bạn bè mua hàng, cả hai nhận 500 điểm', type: 'REFERRAL', rewardType: 'POINTS', rewardValue: 500, conditions: {}, startDate: new Date('2026-02-01'), endDate: new Date('2026-12-31'), isActive: true },
            ],
        });
        console.log('✅ 4 events seeded');
    }

    // ─── Landing Pages ──────────────────────────────
    const landingPages = [
        { slug: 'collection-2026', title: 'Bộ Sưu Tập 2026', subtitle: 'Khám phá những cây đàn đỉnh cao', sections: JSON.parse(JSON.stringify([{ type: 'hero', title: 'Bộ Sưu Tập Premium 2026', content: 'Những mẫu guitar cao cấp nhất', images: ['https://images.unsplash.com/photo-1626406512368-ae4ad84da00f?w=1200'] }, { type: 'content', title: 'Crafted to Perfection', content: 'Mỗi cây guitar đều được chọn lọc kỹ càng.' }])), isPublished: true },
        { slug: 'about', title: 'Về Guitar NOVA', subtitle: 'Câu chuyện thương hiệu', sections: JSON.parse(JSON.stringify([{ type: 'hero', title: 'Guitar NOVA', content: 'Hơn 10 năm đồng hành cùng âm nhạc Việt Nam', images: ['https://images.unsplash.com/photo-1741701862902-01b463d10435?w=1200'] }])), isPublished: true },
        { slug: 'vintage-collection', title: 'Bộ Sưu Tập Vintage', subtitle: 'Những viên ngọc quý từ quá khứ', sections: JSON.parse(JSON.stringify([{ type: 'hero', title: 'Vintage Guitar Collection', content: 'Khám phá những cây guitar vintage hiếm có', images: ['https://images.unsplash.com/photo-1692501735268-30251c6a30e3?w=1200'] }])), isPublished: true },
    ];

    for (const lp of landingPages) {
        await prisma.landingPage.upsert({ where: { slug: lp.slug }, update: {}, create: lp });
    }
    console.log(`✅ ${landingPages.length} landing pages seeded`);

    console.log('\n🎸 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
