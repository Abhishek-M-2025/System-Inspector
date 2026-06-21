const systemService = require('../services/systemService');
const processService = require('../services/processService');
const batteryService = require('../services/batteryService');
const diskService = require('../services/diskService');
const networkService = require('../services/networkService');

async function getSystemInfo(req, res, next) {
  try {
    const [systemInfo, cpuData, processes, battery, disk, network] = await Promise.all([
      Promise.resolve(systemService.getSystemInfo()),
      systemService.getCpuUsage(),
      processService.getProcessInfo(),
      batteryService.getBatteryInfo(),
      diskService.getDiskInfo(),
      Promise.resolve(networkService.getNetworkInfo()),
    ]);

    res.json({
      success: true,
      data: {
        ...systemInfo,
        cpuUsagePercent: cpuData.cpuUsagePercent,
        processes,
        battery,
        disk,
        network,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSystemInfo };
