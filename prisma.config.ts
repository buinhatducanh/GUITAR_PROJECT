import { defineConfig } from 'prisma/config';
import 'dotenv/config';
import process from 'node:process';

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL?.replace('&channel_binding=require', ''),
    },
});
