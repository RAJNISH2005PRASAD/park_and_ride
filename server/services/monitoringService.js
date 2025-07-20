const os = require('os');
const { getRedisClient } = require('../config/redis');

const setupMonitoring = (app, logger) => {
  // System health monitoring
  const getSystemHealth = () => {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;

    return {
      uptime: process.uptime(),
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usage: memoryUsage.toFixed(2)
      },
      cpu: {
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      platform: os.platform(),
      nodeVersion: process.version
    };
  };

  // Performance monitoring middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('Request processed', {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`
      });
    });
    next();
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const health = getSystemHealth();
      const redisHealth = await checkRedisHealth();
      
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        system: health,
        redis: redisHealth,
        environment: process.env.NODE_ENV || 'development'
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Health check failed',
        error: error.message
      });
    }
  });

  return { getSystemHealth };
};

const checkRedisHealth = async () => {
  try {
    const redisClient = getRedisClient();
    await redisClient.ping();
    return { status: 'OK', connected: true };
  } catch (error) {
    return { status: 'ERROR', connected: false, error: error.message };
  }
};

module.exports = { setupMonitoring }; 