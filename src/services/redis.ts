import Redis from 'ioredis';

// Define an interface for the Redis configuration
interface RedisConfig {
  port: number;
  host: string;
  password?: string;
  db?: number;
}

// Function to create and return a Redis client instance
const createRedisClient = (config: RedisConfig) => {
  const client = new Redis(config);

  client.on('connect', () => {
    console.log('✅✅✅✅✅ Redis client connected ✅✅✅✅✅');
  });

  client.on('error', (err: Error) => {
    console.error('❌❌❌❌❌ Redis error =>', err.message , "❌❌❌❌❌");
    client.quit();
  });

  return client;
};

export default createRedisClient;
