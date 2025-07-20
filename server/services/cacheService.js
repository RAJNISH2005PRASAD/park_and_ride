const { getRedisClient } = require('../config/redis');

const setupCaching = () => {
  const redisClient = getRedisClient();

  const cacheService = {
    // Set cache with TTL
    set: async (key, value, ttl = 3600) => {
      try {
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        await redisClient.setEx(key, ttl, serializedValue);
        return true;
      } catch (error) {
        console.error('Cache set error:', error);
        return false;
      }
    },

    // Get cache value
    get: async (key) => {
      try {
        const value = await redisClient.get(key);
        if (!value) return null;
        
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      } catch (error) {
        console.error('Cache get error:', error);
        return null;
      }
    },

    // Delete cache key
    del: async (key) => {
      try {
        await redisClient.del(key);
        return true;
      } catch (error) {
        console.error('Cache delete error:', error);
        return false;
      }
    },

    // Clear all cache
    clear: async () => {
      try {
        await redisClient.flushAll();
        return true;
      } catch (error) {
        console.error('Cache clear error:', error);
        return false;
      }
    },

    // Cache middleware for Express routes
    middleware: (ttl = 300) => {
      return async (req, res, next) => {
        const key = `cache:${req.originalUrl}`;
        
        try {
          const cached = await cacheService.get(key);
          if (cached) {
            return res.json(cached);
          }
          
          // Store original send method
          const originalSend = res.json;
          
          // Override send method to cache response
          res.json = function(data) {
            cacheService.set(key, data, ttl);
            return originalSend.call(this, data);
          };
          
          next();
        } catch (error) {
          next();
        }
      };
    }
  };

  return cacheService;
};

module.exports = { setupCaching }; 