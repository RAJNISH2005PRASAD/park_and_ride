const express = require('express');
const os = require('os');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    loadAverage: os.loadavg(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 