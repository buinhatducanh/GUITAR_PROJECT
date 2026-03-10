import prisma from './lib/prisma.js';

async function main() {
    console.log('🌱 Bắt đầu seed dữ liệu mẫu...\n');

    // ═══════════════════ BANNERS ═══════════════════
    console.log('📸 Seeding Banners...');
    const bannersData = [
        {
            image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1920&q=80',
            title: 'Bộ sưu tập Guitar 2026',
            subtitle: 'Khám phá những cây guitar hàng đầu thế giới với giá ưu đãi đặc biệt',
            link: '/products',
            order: 1,
            isActive: true,
        },
        {
            image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&q=80',
            title: 'Sale Tết Nguyên Đán',
            subtitle: 'Giảm đến 30% cho tất cả phụ kiện guitar - Ưu đãi có hạn!',
            link: '/products',
            order: 2,
            isActive: true,
        },
        {
            image: 'https://images.unsplash.com/photo-1514649923863-ceaf75b7ec40?w=1920&q=80',
            title: 'Guitar Acoustic Cao Cấp',
            subtitle: 'Âm thanh tự nhiên, thiết kế tinh xảo từ các thương hiệu hàng đầu',
            link: '/products',
            order: 3,
            isActive: true,
        },
    ];
    for (const b of bannersData) {
        await prisma.banner.create({ data: b });
    }
    console.log(`  ✅ Đã thêm ${bannersData.length} banners\n`);

    // ═══════════════════ VOUCHERS ═══════════════════
    console.log('🎫 Seeding Vouchers...');
    const vouchersData = [
        {
            code: 'NOVA500K',
            title: 'Giảm 500.000đ',
            description: 'Giảm 500.000đ cho đơn hàng từ 5.000.000đ',
            discountType: 'FIXED' as const,
            discountValue: 500000,
            pointsCost: 500,
            minPurchase: 5000000,
            expiryDate: new Date('2026-12-31'),
            isActive: true,
            image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80',
            usageLimit: 100,
            usedCount: 0,
        },
        {
            code: 'NOVA10',
            title: 'Giảm 10%',
            description: 'Giảm 10% cho đơn hàng từ 2.000.000đ, tối đa 1.000.000đ',
            discountType: 'PERCENTAGE' as const,
            discountValue: 10,
            pointsCost: 300,
            minPurchase: 2000000,
            maxDiscount: 1000000,
            expiryDate: new Date('2026-12-31'),
            isActive: true,
            image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80',
            usageLimit: 200,
            usedCount: 0,
        },
        {
            code: 'WELCOME50K',
            title: 'Chào mừng thành viên mới',
            description: 'Giảm 50.000đ cho đơn đầu tiên, không yêu cầu tối thiểu',
            discountType: 'FIXED' as const,
            discountValue: 50000,
            pointsCost: 0,
            minPurchase: 0,
            expiryDate: new Date('2026-12-31'),
            isActive: true,
            image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&q=80',
            usageLimit: 1000,
            usedCount: 0,
        },
    ];
    for (const v of vouchersData) {
        await prisma.voucher.upsert({
            where: { code: v.code },
            update: {},
            create: v,
        });
    }
    console.log(`  ✅ Đã thêm ${vouchersData.length} vouchers\n`);

    // ═══════════════════ EVENTS ═══════════════════
    console.log('🎉 Seeding Events...');
    const eventsData = [
        {
            title: 'Valentine Đôi Lứa',
            description: 'Nhập mã COUPLE khi mua từ 2 sản phẩm trở lên để nhận giảm 10%',
            type: 'PURCHASE_COUPLE' as const,
            rewardType: 'DISCOUNT' as const,
            rewardValue: 10,
            conditions: { requireCoupleCode: true, minPurchase: 1000000 },
            startDate: new Date('2026-02-01'),
            endDate: new Date('2026-02-15'),
            isActive: false,
            image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',
        },
        {
            title: 'Đăng nhập 7 ngày liên tiếp',
            description: 'Đăng nhập liên tục 7 ngày để nhận 1.000 điểm thưởng',
            type: 'LOGIN_STREAK' as const,
            rewardType: 'POINTS' as const,
            rewardValue: 1000,
            conditions: { days: 7 },
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            isActive: true,
            image: 'https://images.unsplash.com/photo-1533750516564-e371711d412d?w=400&q=80',
        },
        {
            title: 'Mua hàng lần đầu',
            description: 'Nhận ngay 200 điểm thưởng khi đặt đơn hàng đầu tiên',
            type: 'FIRST_PURCHASE' as const,
            rewardType: 'POINTS' as const,
            rewardValue: 200,
            conditions: {},
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
            isActive: true,
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
        },
    ];
    for (const e of eventsData) {
        await prisma.event.create({ data: e });
    }
    console.log(`  ✅ Đã thêm ${eventsData.length} events\n`);

    // ═══════════════════ BLOG POSTS ═══════════════════
    console.log('📝 Seeding Blog Posts...');
    const blogPostsData = [
        {
            slug: 'huong-dan-chon-guitar-cho-nguoi-moi',
            title: 'Hướng dẫn chọn guitar cho người mới bắt đầu',
            excerpt: 'Tìm hiểu cách chọn cây guitar phù hợp với nhu cầu và ngân sách của bạn.',
            content: `# Hướng dẫn chọn guitar cho người mới bắt đầu

Việc chọn cây guitar đầu tiên là một quyết định quan trọng. Bài viết này sẽ giúp bạn hiểu rõ các yếu tố cần xem xét.

## 1. Guitar Acoustic hay Electric?

**Guitar Acoustic** phù hợp nếu bạn thích nhạc folk, pop, hoặc muốn chơi ở mọi nơi mà không cần amplifier. Âm thanh tự nhiên, ấm áp.

**Guitar Electric** phù hợp nếu bạn thích rock, blues, jazz. Cần có amplifier nhưng linh hoạt hơn về âm sắc.

## 2. Ngân sách

- **Dưới 5 triệu**: Guitar nhập môn, chất lượng tốt cho người mới.
- **5-15 triệu**: Guitar tầm trung, âm thanh và chất liệu tốt hơn.
- **Trên 15 triệu**: Guitar cao cấp, dành cho người chơi nghiêm túc.

## 3. Thương hiệu uy tín

Yamaha, Fender, Gibson, Taylor, Martin là những thương hiệu đáng tin cậy bạn nên xem xét.`,
            coverImage: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
            authorName: 'Guitar NOVA',
            authorAvatar: 'https://i.pravatar.cc/150?img=1',
            category: 'Hướng dẫn',
            tags: ['guitar', 'người mới', 'hướng dẫn'],
            readTime: 5,
            views: 1250,
            isPublished: true,
            publishedDate: new Date('2026-01-15'),
        },
        {
            slug: 'top-5-guitar-acoustic-duoi-10-trieu',
            title: 'Top 5 Guitar Acoustic dưới 10 triệu đáng mua nhất 2026',
            excerpt: 'Điểm qua 5 cây guitar acoustic giá rẻ nhưng chất lượng tuyệt vời.',
            content: `# Top 5 Guitar Acoustic dưới 10 triệu đáng mua nhất 2026

Không cần bỏ ra quá nhiều tiền để sở hữu một cây guitar chất lượng. Dưới đây là 5 lựa chọn hàng đầu.

## 1. Yamaha FG800 - 8.900.000đ
Âm thanh cân bằng, bền bỉ, phù hợp mọi thể loại nhạc.

## 2. Fender CD-60S - 7.500.000đ
Thiết kế classic, âm thanh sáng và rõ ràng.

## 3. Epiphone DR-100 - 4.500.000đ
Giá cực tốt cho chất lượng vượt trội trong tầm giá.

## 4. Cort AD810 - 5.200.000đ
Thương hiệu Hàn Quốc với chất lượng đáng ngạc nhiên.

## 5. Takamine GD20 - 9.800.000đ
Âm thanh ấm áp, hoàn thiện tốt, phù hợp biểu diễn.`,
            coverImage: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&q=80',
            authorName: 'Guitar NOVA',
            authorAvatar: 'https://i.pravatar.cc/150?img=2',
            category: 'Review',
            tags: ['guitar', 'acoustic', 'review', 'top 5'],
            readTime: 7,
            views: 3400,
            isPublished: true,
            publishedDate: new Date('2026-02-01'),
        },
        {
            slug: 'cach-bao-quan-guitar-dung-cach',
            title: 'Cách bảo quản guitar đúng cách để sử dụng lâu dài',
            excerpt: 'Những mẹo đơn giản giúp guitar của bạn luôn trong tình trạng tốt nhất.',
            content: `# Cách bảo quản guitar đúng cách

Guitar là một nhạc cụ tinh tế, cần được chăm sóc đúng cách để giữ được âm thanh và vẻ ngoài tốt nhất.

## 1. Nhiệt độ và độ ẩm

Giữ guitar ở nơi có nhiệt độ 20-25°C và độ ẩm 45-55%. Tránh để ở nơi quá nóng hoặc quá ẩm.

## 2. Vệ sinh thường xuyên

Sau mỗi lần chơi, dùng khăn mềm lau sạch dây đàn và thân guitar để loại bỏ dầu từ tay.

## 3. Thay dây định kỳ

Nên thay dây mỗi 2-3 tháng hoặc khi dây bắt đầu sỉn màu, mất độ sáng.

## 4. Bảo quản trong bao/case

Luôn cất guitar trong bao hoặc case khi không sử dụng để tránh bụi bẩn và va đập.`,
            coverImage: 'https://images.unsplash.com/photo-1558098329-a11cff621064?w=800&q=80',
            authorName: 'Guitar NOVA',
            authorAvatar: 'https://i.pravatar.cc/150?img=3',
            category: 'Mẹo hay',
            tags: ['guitar', 'bảo quản', 'mẹo'],
            readTime: 4,
            views: 890,
            isPublished: true,
            publishedDate: new Date('2026-02-10'),
        },
    ];
    for (const bp of blogPostsData) {
        await prisma.blogPost.upsert({
            where: { slug: bp.slug },
            update: {},
            create: bp,
        });
    }
    console.log(`  ✅ Đã thêm ${blogPostsData.length} blog posts\n`);

    // ═══════════════════ BRANDS ═══════════════════
    console.log('🏷️ Seeding Brands...');
    const brandsData = [
        { name: 'Fender', slug: 'fender', description: 'Thương hiệu guitar huyền thoại từ Mỹ' },
        { name: 'Gibson', slug: 'gibson', description: 'Biểu tượng của rock and roll' },
        { name: 'Yamaha', slug: 'yamaha', description: 'Chất lượng Nhật Bản, giá cả phải chăng' },
        { name: 'Taylor', slug: 'taylor', description: 'Guitar acoustic cao cấp hàng đầu thế giới' },
        { name: 'Marshall', slug: 'marshall', description: 'Ampli huyền thoại cho guitar điện' },
        { name: 'Boss', slug: 'boss', description: 'Hiệu ứng guitar chuyên nghiệp' },
        { name: "D'Addario", slug: 'daddario', description: 'Dây đàn và phụ kiện chất lượng cao' },
    ];
    for (const brand of brandsData) {
        await prisma.brand.upsert({
            where: { slug: brand.slug },
            update: {},
            create: brand,
        });
    }
    console.log(`  ✅ Đã thêm ${brandsData.length} brands\n`);

    // ═══════════════════ SITE SETTINGS ═══════════════════
    console.log('⚙️ Seeding Site Settings...');
    const existing = await prisma.siteSettings.findFirst();
    if (!existing) {
        await prisma.siteSettings.create({
            data: {
                siteName: 'Guitar NOVA',
                slogan: 'Khám phá thế giới âm nhạc',
                email: 'contact@guitarnova.vn',
                phone: '0901234567',
                address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
                businessHours: 'T2-T7: 9:00 - 21:00 | CN: 10:00 - 18:00',
                paymentMethods: ['COD', 'Chuyển khoản ngân hàng', 'Ví MoMo', 'ZaloPay'],
                shippingInfo: 'Miễn phí ship cho đơn hàng trên 2.000.000đ',
                metaTitle: 'Guitar NOVA - Cửa hàng Guitar uy tín',
                metaDescription: 'Guitar NOVA - Mua guitar chính hãng, giá tốt nhất. Đa dạng guitar acoustic, electric, bass và phụ kiện.',
            },
        });
        console.log('  ✅ Đã tạo site settings\n');
    } else {
        console.log('  ⏭️ Site settings đã tồn tại, bỏ qua\n');
    }

    console.log('🎸 Seed hoàn tất! Tất cả dữ liệu mẫu đã được nạp vào database.');
}

main()
    .catch((e) => {
        console.error('❌ Seed thất bại:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
