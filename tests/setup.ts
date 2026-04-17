import path from 'path';

// Set an absolute path so Prisma can find the test DB from any working directory
process.env.DATABASE_URL = `file:${path.resolve(__dirname, '../prisma/test.db')}`;
