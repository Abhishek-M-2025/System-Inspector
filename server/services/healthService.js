const { getSystemInfo, getCpuUsage } = require('./systemService');
const { getDiskInfo } = require('./diskService');
const { getBatteryInfo } = require('./batteryService');
const { clamp } = require('../utils/formatters');

async function getHealthScore() {
  const [systemInfo, cpuData, diskInfo, batteryInfo] = await Promise.all([
    Promise.resolve(getSystemInfo()),
    getCpuUsage(),
    getDiskInfo(),
    getBatteryInfo(),
  ]);

  const ramUsage = systemInfo.memoryUsagePercent;
  const cpuUsage = cpuData.cpuUsagePercent;
  const diskUsage = diskInfo.usagePercent;

  let batteryScore = 100;
  if (batteryInfo.available && batteryInfo.level != null) {
    batteryScore = batteryInfo.level;
  }

  const weights = batteryInfo.available
    ? { cpu: 0.25, ram: 0.30, disk: 0.25, battery: 0.20 }
    : { cpu: 0.30, ram: 0.35, disk: 0.35, battery: 0 };

  const penalty =
    cpuUsage * weights.cpu +
    ramUsage * weights.ram +
    diskUsage * weights.disk +
    (100 - batteryScore) * weights.battery;

  const score = clamp(Math.round(100 - penalty * 0.8), 0, 100);

  let rating;
  if (score >= 85) rating = 'Excellent';
  else if (score >= 70) rating = 'Good';
  else if (score >= 50) rating = 'Average';
  else rating = 'Poor';

  return {
    score,
    rating,
    breakdown: {
      cpu: { usage: cpuUsage, weight: weights.cpu },
      ram: { usage: ramUsage, weight: weights.ram },
      disk: { usage: diskUsage, weight: weights.disk },
      battery: {
        level: batteryInfo.available ? batteryInfo.level : null,
        weight: weights.battery,
        available: batteryInfo.available,
      },
    },
  };
}

module.exports = { getHealthScore };
