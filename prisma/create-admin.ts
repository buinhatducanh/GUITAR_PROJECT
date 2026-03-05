import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    const email = 'admin@guitar.vn';
    const password = 'admin123';
    const name = 'Admin';

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'ADMIN', password: hashed },
        create: { email, name, password: hashed, role: 'ADMIN' },
    });

    console.log('✅ Admin ready!');
    console.log('   Email:    ', user.email);
    console.log('   Mật khẩu: ', password);
    console.log('   Role:     ', user.role);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
