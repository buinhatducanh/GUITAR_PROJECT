import { prisma } from '../../shared/lib/prisma.js';
import { CreateBrandDto, UpdateBrandDto, BrandQuery } from './brands.types.js';
import { deleteCloudinaryImages, collectImageUrls } from '../../shared/utils/cloudinary-cleanup.js';

export const getAllBrands = async (query: BrandQuery) => {
    const { active } = query;

    const brands = await prisma.brand.findMany({
        where: active === 'true' ? { isActive: true } : undefined,
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: {
            _count: {
                select: { products: true }
            }
        }
    });

    return { brands };
};

export const getBrandBySlug = async (slug: string) => {
    const brand = await prisma.brand.findUnique({
        where: { slug },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });

    if (!brand) {
        throw new Error('Brand not found');
    }

    return brand;
};

export const getBrandProducts = async (id: string, limit: number = 20, offset: number = 0) => {
    const products = await prisma.product.findMany({
        where: { brandId: id, isActive: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.product.count({
        where: { brandId: id, isActive: true }
    });

    return { products, total };
};

export const createBrand = async (data: CreateBrandDto) => {
    // Check if slug already exists
    const existing = await prisma.brand.findUnique({ where: { slug: data.slug } });
    if (existing) {
        throw new Error('Brand slug already exists');
    }

    const brand = await prisma.brand.create({
        data: {
            name: data.name,
            slug: data.slug,
            logo: data.logo,
            description: data.description,
            website: data.website,
            hotline: data.hotline,
            order: data.order || 0
        }
    });

    return brand;
};

export const updateBrand = async (id: string, data: UpdateBrandDto) => {
    // If changing slug, check if new slug exists
    if (data.slug) {
        const existing = await prisma.brand.findFirst({
            where: { slug: data.slug, NOT: { id } }
        });
        if (existing) {
            throw new Error('Brand slug already exists');
        }
    }

    const brand = await prisma.brand.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.slug && { slug: data.slug }),
            ...(data.logo !== undefined && { logo: data.logo }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.website !== undefined && { website: data.website }),
            ...(data.hotline !== undefined && { hotline: data.hotline }),
            ...(typeof data.isActive === 'boolean' && { isActive: data.isActive }),
            ...(data.order !== undefined && { order: data.order })
        }
    });

    return brand;
};

export const deleteBrand = async (id: string) => {
    // Check if brand has products
    const productCount = await prisma.product.count({
        where: { brandId: id }
    });

    if (productCount > 0) {
        throw new Error(`Cannot delete brand with ${productCount} products. Please reassign or delete products first.`);
    }

    const brand = await prisma.brand.findUnique({
        where: { id },
        select: { logo: true },
    });

    await prisma.brand.delete({ where: { id } });

    // Clean up Cloudinary logo (non-blocking)
    if (brand) {
        const urls = collectImageUrls(brand, ['logo']);
        deleteCloudinaryImages(urls).catch(() => {});
    }

    return { message: 'Brand deleted successfully' };
};

export const getBrandAnalytics = async (id: string) => {
    const [brand, productCount, totalRevenue, topProducts] = await Promise.all([
        prisma.brand.findUnique({ where: { id } }),
        prisma.product.count({ where: { brandId: id } }),
        prisma.orderItem.aggregate({
            where: { product: { brandId: id } },
            _sum: { quantity: true }
        }),
        prisma.orderItem.groupBy({
            by: ['productId'],
            where: { product: { brandId: id } },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        })
    ]);

    return {
        brand,
        productCount,
        totalSold: totalRevenue._sum.quantity || 0,
        topProducts
    };
};
