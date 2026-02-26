import prisma from './backend/shared/lib/prisma.js';

async function main() {
    const user = await prisma.user.findUnique({ where: { phone: '0378443602' } });
    if (user) {
        console.log('User found:', JSON.stringify({ id: user.id, name: user.name, phone: user.phone, role: user.role }));
    } else {
        console.log('User NOT FOUND in database');
        // List all users
        const users = await prisma.user.findMany({ select: { id: true, name: true, phone: true, role: true }, take: 10 });
        console.log('Existing users:', JSON.stringify(users, null, 2));
    }
    await prisma.$disconnect();
}

main().catch(console.error);
