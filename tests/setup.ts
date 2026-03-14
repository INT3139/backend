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

// Simple in-memory mock for Redis
const redisStore = new Map<string, any>();
const setStore = new Map<string, Set<string>>();

jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => {
        return {
            on: jest.fn(),
            get: jest.fn(async (k) => redisStore.get(k) ?? null),
            set: jest.fn(async (k, v) => { redisStore.set(k, v); return 'OK' }),
            setex: jest.fn(async (k, t, v) => { redisStore.set(k, v); return 'OK' }),
            del: jest.fn(async (...keys) => { keys.forEach(k => { redisStore.delete(k); setStore.delete(k); }); return keys.length }),
            exists: jest.fn(async (k) => (redisStore.has(k) || setStore.has(k) ? 1 : 0)),
            sismember: jest.fn(async (k, m) => (setStore.get(k)?.has(m) ? 1 : 0)),
            smembers: jest.fn(async (k) => Array.from(setStore.get(k) || [])),
            sadd: jest.fn(async (k, ...m) => {
                if (!setStore.has(k)) setStore.set(k, new Set());
                const set = setStore.get(k)!;
                m.forEach(item => set.add(item));
                return m.length;
            }),
            expire: jest.fn(async () => 1),
            scan: jest.fn(async () => ['0', []]),
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

beforeEach(() => {
    redisStore.clear();
    setStore.clear();
});
