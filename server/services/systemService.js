const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { formatBytes, formatDuration, percentage } = require('../utils/formatters');

const execFileAsync = promisify(execFile);

function getSystemInfo() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const uptimeSeconds = os.uptime();
  const bootTime = new Date(Date.now() - uptimeSeconds * 1000);

  return {
    computerName: os.hostname(),
    hostname: os.hostname(),
    operatingSystem: `${os.type()} ${os.release()}`,
    osType: os.type(),
    osVersion: os.release(),
    platform: os.platform(),
    cpuArchitecture: os.arch(),
    cpuModel: os.cpus()[0]?.model || 'Unknown',
    cpuCores: os.cpus().length,
    nodeVersion: process.version,
    homeDirectory: os.homedir(),
    currentWorkingDirectory: process.cwd(),
    username: os.userInfo().username,
    totalMemory,
    freeMemory,
    usedMemory,
    totalMemoryFormatted: formatBytes(totalMemory),
    freeMemoryFormatted: formatBytes(freeMemory),
    usedMemoryFormatted: formatBytes(usedMemory),
    memoryUsagePercent: percentage(usedMemory, totalMemory),
    systemUptime: uptimeSeconds,
    systemUptimeFormatted: formatDuration(uptimeSeconds),
    bootTime: bootTime.toISOString(),
    bootTimeFormatted: bootTime.toLocaleString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    loadAverage: os.loadavg(),
  };
}

async function getCpuUsage() {
  const cpus = os.cpus();
  const startMeasures = cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    return { idle: cpu.times.idle, total };
  });

  await new Promise((resolve) => setTimeout(resolve, 200));

  const endCpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  endCpus.forEach((cpu, i) => {
    const endTotal = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle - startMeasures[i].idle;
    const total = endTotal - startMeasures[i].total;
    totalIdle += idle;
    totalTick += total;
  });

  const usage = totalTick > 0 ? Math.round((1 - totalIdle / totalTick) * 100) : 0;
  return { cpuUsagePercent: usage };
}

module.exports = {
  getSystemInfo,
  getCpuUsage,
  execFileAsync,
};
