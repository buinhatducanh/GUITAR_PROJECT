import 'dotenv/config';
import { prisma } from './backend/lib/prisma';

async function main() {
    try {
        console.log('Connecting to database...');
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('Successfully connected to database!');
        console.log('Query result:', result);
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
