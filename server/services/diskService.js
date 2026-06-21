const os = require('os');
const { execFileAsync } = require('./systemService');
const { formatBytes, percentage } = require('../utils/formatters');

async function getDiskInfo() {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      return await getWindowsDisk();
    }
    return await getUnixDisk();
  } catch (error) {
    return {
      disks: [],
      totalStorage: 0,
      usedStorage: 0,
      freeStorage: 0,
      usagePercent: 0,
      error: error.message,
    };
  }
}

async function getWindowsDisk() {
  const { stdout } = await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-Command',
    `Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Select-Object DeviceID, Size, FreeSpace | ConvertTo-Json`,
  ], { timeout: 10000 });

  const parsed = parseJsonOutput(stdout);
  const disks = parsed.map((d) => {
    const total = parseInt(d.Size, 10) || 0;
    const free = parseInt(d.FreeSpace, 10) || 0;
    const used = total - free;
    return {
      drive: d.DeviceID,
      totalStorage: total,
      freeStorage: free,
      usedStorage: used,
      totalFormatted: formatBytes(total),
      freeFormatted: formatBytes(free),
      usedFormatted: formatBytes(used),
      usagePercent: percentage(used, total),
    };
  });

  return aggregateDisks(disks);
}

async function getUnixDisk() {
  const { stdout } = await execFileAsync('df', ['-k', '/'], { timeout: 5000 });
  const lines = stdout.trim().split('\n');
  if (lines.length < 2) return aggregateDisks([]);

  const parts = lines[1].split(/\s+/);
  const total = parseInt(parts[1], 10) * 1024;
  const used = parseInt(parts[2], 10) * 1024;
  const free = parseInt(parts[3], 10) * 1024;

  const disks = [{
    drive: parts[0],
    totalStorage: total,
    usedStorage: used,
    freeStorage: free,
    totalFormatted: formatBytes(total),
    usedFormatted: formatBytes(used),
    freeFormatted: formatBytes(free),
    usagePercent: percentage(used, total),
  }];

  return aggregateDisks(disks);
}

function parseJsonOutput(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

function aggregateDisks(disks) {
  const totalStorage = disks.reduce((sum, d) => sum + d.totalStorage, 0);
  const freeStorage = disks.reduce((sum, d) => sum + d.freeStorage, 0);
  const usedStorage = totalStorage - freeStorage;

  return {
    disks,
    totalStorage,
    usedStorage,
    freeStorage,
    totalFormatted: formatBytes(totalStorage),
    usedFormatted: formatBytes(usedStorage),
    freeFormatted: formatBytes(freeStorage),
    usagePercent: percentage(usedStorage, totalStorage),
  };
}

module.exports = { getDiskInfo };
