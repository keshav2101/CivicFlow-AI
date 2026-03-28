import IORedis from 'ioredis';

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`[CacheService] Fast Cache miss/fail for ${key}`);
      return null;
    }
  }

  static async set(key: string, value: any, ttlSeconds: number = 3600) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      console.error(`[CacheService] Could not set key ${key}`, error);
    }
  }

  static async flush() {
    await redis.flushall();
  }
}
