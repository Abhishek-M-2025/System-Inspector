const { getSystemInfo, getCpuUsage } = require('./systemService');
const { getProcessInfo } = require('./processService');
const { getBatteryInfo } = require('./batteryService');
const { getDiskInfo } = require('./diskService');
const { getNetworkInfo } = require('./networkService');
const { getEnvironmentVariables } = require('./envService');
const { getProjectAnalytics } = require('./analyticsService');
const { getHealthScore } = require('./healthService');
const { readLogs, logActivity } = require('../utils/activityLogger');

async function generateSystemReport() {
  const [systemInfo, cpuData, processes, battery, disk, network, health] = await Promise.all([
    Promise.resolve(getSystemInfo()),
    getCpuUsage(),
    getProcessInfo(),
    getBatteryInfo(),
    getDiskInfo(),
    Promise.resolve(getNetworkInfo()),
    getHealthScore(),
  ]);

  return {
    type: 'system',
    generatedAt: new Date().toISOString(),
    system: { ...systemInfo, cpuUsagePercent: cpuData.cpuUsagePercent },
    processes,
    battery,
    disk,
    network,
    health,
  };
}

async function generateAnalyticsReport() {
  const analytics = await getProjectAnalytics();
  const health = await getHealthScore();

  return {
    type: 'analytics',
    generatedAt: new Date().toISOString(),
    project: analytics,
    health,
  };
}

async function generateEnvironmentReport() {
  const env = getEnvironmentVariables({ mask: true });

  return {
    type: 'environment',
    generatedAt: new Date().toISOString(),
    environment: env,
  };
}

async function generateReport(type) {
  let report;

  switch (type) {
    case 'system':
      report = await generateSystemReport();
      break;
    case 'analytics':
      report = await generateAnalyticsReport();
      break;
    case 'environment':
      report = await generateEnvironmentReport();
      break;
    default:
      throw new Error('Invalid report type');
  }

  await logActivity('Report Generated', { type });
  return report;
}

async function getDashboardData() {
  const [systemInfo, cpuData, diskInfo, batteryInfo, networkInfo, health, processes, logs] =
    await Promise.all([
      Promise.resolve(getSystemInfo()),
      getCpuUsage(),
      getDiskInfo(),
      getBatteryInfo(),
      Promise.resolve(getNetworkInfo()),
      getHealthScore(),
      getProcessInfo(),
      readLogs(),
    ]);

  return {
    system: { ...systemInfo, cpuUsagePercent: cpuData.cpuUsagePercent },
    disk: diskInfo,
    battery: batteryInfo,
    network: networkInfo,
    health,
    processes: {
      total: processes.totalProcesses,
      top: processes.topProcesses?.slice(0, 5) || [],
    },
    recentActivity: logs.slice(0, 8),
  };
}

module.exports = {
  generateReport,
  generateSystemReport,
  generateAnalyticsReport,
  generateEnvironmentReport,
  getDashboardData,
};
