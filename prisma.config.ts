import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), 'prisma', '.env') });

export default defineConfig({
    datasource: {
        url: process.env.DATABASE_URL,
    },
});
