import prisma from './lib/prisma.js';

const initialProducts = [
    {
        id: '1',
        name: 'Fender Stratocaster American Professional II',
        price: 45900000,
        oldPrice: 52000000,
        discount: 12,
        image: 'https://images.unsplash.com/photo-1763162603999-8a1958b13cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMHByZW1pdW0lMjB3b29kfGVufDF8fHx8MTc3MDQxMTY3NXww&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Electric Guitar',
        description: 'Guitar điện cao cấp với âm thanh đặc trưng Fender. Thiết kế classic với công nghệ hiện đại.',
        specs: ['Body: Alder', 'Neck: Maple', 'Fretboard: Rosewood', 'Pickups: V-Mod II Single-Coil'],
        rating: 4.9,
    },
    {
        id: '2',
        name: 'Gibson Les Paul Standard 60s',
        price: 68500000,
        oldPrice: 75000000,
        discount: 9,
        image: 'https://images.unsplash.com/photo-1692501735268-30251c6a30e3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwZ3VpdGFyJTIwY29sbGVjdGlvbnxlbnwxfHx8fDE3NzA0MTE2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Electric Guitar',
        description: 'Biểu tượng của rock với âm thanh ấm áp, thick và sustain tuyệt vời.',
        specs: ['Body: Mahogany', 'Top: Maple', 'Neck: Mahogany', 'Pickups: BurstBucker 61'],
        rating: 5.0,
    },
    {
        id: '3',
        name: 'Yamaha FG800 Acoustic',
        price: 8900000,
        oldPrice: 10500000,
        discount: 15,
        image: 'https://images.unsplash.com/photo-1763162603999-8a1958b13cf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY291c3RpYyUyMGd1aXRhciUyMHByZW1pdW0lMjB3b29kfGVufDF8fHx8MTc3MDQxMTY3NXww&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Acoustic Guitar',
        description: 'Guitar acoustic phổ biến nhất cho người mới bắt đầu và chuyên nghiệp.',
        specs: ['Top: Solid Spruce', 'Back/Sides: Nato', 'Neck: Nato', 'Finish: Natural'],
        rating: 4.7,
    },
    {
        id: '4',
        name: 'Fender Precision Bass',
        price: 42000000,
        image: 'https://images.unsplash.com/photo-1695192577284-fd1b10529579?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNzJTIwZ3VpdGFyJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MDQxMTY3NXww&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Bass Guitar',
        description: 'Bass guitar legendary với âm thanh punchy và định nghĩa rõ ràng.',
        specs: ['Body: Alder', 'Neck: Maple', 'Fretboard: Pau Ferro', 'Pickups: Split Single-Coil'],
        rating: 4.8,
    },
    {
        id: '5',
        name: 'Marshall DSL40CR Amplifier',
        price: 24500000,
        oldPrice: 28000000,
        discount: 13,
        image: 'https://images.unsplash.com/photo-1565829073670-cd08d8c63643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBhbXBsaWZpZXIlMjBzdHVkaW8lMjB2aW50YWdlfGVufDF8fHx8MTc3MDQxMTY3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Amplifier',
        description: 'Ampli all-tube 40W với classic Marshall tone và hiệu ứng reverb.',
        specs: ['Power: 40W', 'Channels: 2', 'Effects: Reverb', 'Speaker: 12" Celestion'],
        rating: 4.9,
    },
    {
        id: '6',
        name: 'Boss GT-1000 Effects Processor',
        price: 18900000,
        image: 'https://images.unsplash.com/photo-1662434243640-42988ab42db8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBwZWRhbCUyMGVmZmVjdHMlMjBib2FyZHxlbnwxfHx8fDE3NzA0MTE2ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Effects',
        description: 'Bộ xử lý hiệu ứng flagship với công nghệ AIRD và amp modeling.',
        specs: ['DSP: BOSS flagship', 'Presets: 250+', 'Effects: 200+', 'Interface: USB Audio'],
        rating: 4.8,
    },
    {
        id: '7',
        name: "D'Addario NYXL Strings",
        price: 280000,
        oldPrice: 350000,
        discount: 20,
        image: 'https://images.unsplash.com/photo-1674485146230-d654464e477c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndWl0YXIlMjBzdHJpbmdzJTIwY2xvc2V1cHxlbnwxfHx8fDE3NzA0MTE2NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Accessories',
        description: 'Dây đàn cao cấp với độ bền gấp đôi và tuning stability tốt nhất.',
        specs: ['Gauge: 10-46', 'Material: Nickel Wound', 'Core: High Carbon Steel', 'Coating: NYXL'],
        rating: 4.6,
    },
    {
        id: '8',
        name: 'Taylor 814ce Grand Auditorium',
        price: 89000000,
        oldPrice: 95000000,
        discount: 6,
        image: 'https://images.unsplash.com/photo-1741701862902-01b463d10435?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMHN0dWRpbyUyMGd1aXRhciUyMHdhbGx8ZW58MXx8fHwxNzcwNDExNjc2fDA&ixlib=rb-4.1.0&q=80&w=1080',
        category: 'Acoustic Guitar',
        description: 'Acoustic guitar cao cấp với âm thanh cân bằng hoàn hảo.',
        specs: ['Top: Solid Sitka Spruce', 'Back/Sides: Indian Rosewood', 'Electronics: ES2', 'Cutaway: Venetian'],
        rating: 5.0,
    }
];

function generateSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function main() {
    console.log('Starting product seeding...');

    const categoryMap = new Map();

    for (const item of initialProducts) {
        // 1. Ensure category exists
        let catSlug = generateSlug(item.category);
        let catRecord = categoryMap.get(item.category);
        if (!catRecord) {
            catRecord = await prisma.category.upsert({
                where: { slug: catSlug },
                update: {},
                create: {
                    name: item.category,
                    slug: catSlug,
                },
            });
            categoryMap.set(item.category, catRecord);
        }

        // 2. Ensure product exists with EXACT SAME ID
        const productSlug = generateSlug(item.name) + '-' + item.id;

        await prisma.product.upsert({
            where: { id: item.id },
            update: {
                name: item.name,
                slug: productSlug,
                price: item.price,
                oldPrice: item.oldPrice || null,
                discount: item.discount || null,
                image: item.image,
                images: [item.image],
                categoryId: catRecord.id,
                description: item.description,
                specs: item.specs,
                rating: item.rating,
                stock: 100, // Dummy stock
            },
            create: {
                id: item.id, // FORCE SAME ID
                name: item.name,
                slug: productSlug,
                price: item.price,
                oldPrice: item.oldPrice || null,
                discount: item.discount || null,
                image: item.image,
                images: [item.image],
                categoryId: catRecord.id,
                description: item.description,
                specs: item.specs,
                rating: item.rating,
                stock: 100,
            }
        });
        console.log(`Upserted Product: ${item.name} (${item.id})`);
    }

    console.log('Seeding finished!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
