export class CacheService {
  constructor(private kv?: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    if (!this.kv) return null;
    try {
      const data = await this.kv.get(key, "json");
      return (data as T) || null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, expirationTtlSeconds = 86400): Promise<void> {
    if (!this.kv) return;
    try {
      await this.kv.put(key, JSON.stringify(value), {
        expirationTtl: expirationTtlSeconds,
      });
    } catch {
      // Gracefully ignore KV write errors
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.kv) return;
    try {
      await this.kv.delete(key);
    } catch {
      // Gracefully ignore KV delete errors
    }
  }
}
