import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    const phone = '0378443602';
    const password = 'ducanhnhatbui123';
    const name = 'Admin';

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { phone },
        update: { role: 'ADMIN', password: hashed },
        create: { phone, name, password: hashed, role: 'ADMIN' },
    });

    console.log('✅ Admin ready!');
    console.log('   SĐT:      ', user.phone);
    console.log('   Mật khẩu: ducanhnhatbui123');
    console.log('   Role:     ', user.role);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
