import { pool } from '@/configs/db';
import { redis } from '@/configs/redis';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long-!!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars-long-!!!';
process.env.PORT = '3000';
process.env.CORS_ORIGIN = '*';
process.env.S3_BUCKET = 'test-bucket';
process.env.S3_REGION = 'us-east-1';
process.env.S3_ACCESS_KEY = 'test';
process.env.S3_SECRET_KEY = 'test';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test';
process.env.SMTP_PASS = 'test';

jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => {
        return {
            on: jest.fn(),
            get: jest.fn(),
            set: jest.fn(),
            setex: jest.fn(),
            del: jest.fn(),
            exists: jest.fn(),
            sismember: jest.fn(),
            smembers: jest.fn(),
            sadd: jest.fn(),
            expire: jest.fn(),
            scan: jest.fn(),
            ping: jest.fn().mockResolvedValue('PONG'),
            quit: jest.fn().mockResolvedValue('OK'),
        };
    });
});

jest.mock('uuid', () => ({
    v4: () => 'mocked-uuid'
}));

afterAll(async () => {
    await pool.end();
    await redis.quit();
});

