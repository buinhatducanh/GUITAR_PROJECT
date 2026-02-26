import 'dotenv/config';
import prisma from './backend/shared/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    const phone = '0378443602';
    const password = 'ducanhnhatbui123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { phone },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
        },
        create: {
            name: 'Admin',
            phone,
            password: hashedPassword,
            role: 'ADMIN',
            points: 0,
        },
    });

    console.log('✅ Admin account created/updated:', {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
    });

    await prisma.$disconnect();
}

main().catch(console.error);
