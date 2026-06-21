const os = require('os');
const { execFileAsync } = require('./systemService');

async function getBatteryInfo() {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      return await getWindowsBattery();
    }
    if (platform === 'linux' || platform === 'darwin') {
      return await getUnixBattery();
    }
    return unavailableBattery();
  } catch {
    return unavailableBattery();
  }
}

function unavailableBattery() {
  return {
    available: false,
    message: 'Battery Not Available',
    health: null,
    level: null,
    status: null,
    charging: null,
    remainingTime: null,
  };
}

async function getWindowsBattery() {
  const { stdout } = await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-Command',
    `Get-CimInstance -ClassName Win32_Battery -ErrorAction SilentlyContinue | Select-Object EstimatedChargeRemaining, BatteryStatus, EstimatedRunTime | ConvertTo-Json`,
  ], { timeout: 8000 });

  const trimmed = stdout.trim();
  if (!trimmed) return unavailableBattery();

  let data;
  try {
    data = JSON.parse(trimmed);
    if (Array.isArray(data)) data = data[0];
  } catch {
    return unavailableBattery();
  }

  if (!data || data.EstimatedChargeRemaining == null) {
    return unavailableBattery();
  }

  const statusMap = {
    1: 'Discharging',
    2: 'AC Connected',
    3: 'Fully Charged',
    4: 'Low',
    5: 'Critical',
    6: 'Charging',
    7: 'Charging High',
    8: 'Charging Low',
    9: 'Charging Critical',
  };

  const level = data.EstimatedChargeRemaining;
  const charging = [6, 7, 8, 9, 2].includes(data.BatteryStatus);

  return {
    available: true,
    message: null,
    health: level >= 80 ? 'Excellent' : level >= 50 ? 'Good' : level >= 20 ? 'Fair' : 'Poor',
    level,
    status: statusMap[data.BatteryStatus] || 'Unknown',
    charging,
    remainingTime: data.EstimatedRunTime > 0 ? `${data.EstimatedRunTime} min` : 'Calculating...',
  };
}

async function getUnixBattery() {
  const fs = require('fs/promises');
  const basePath = '/sys/class/power_supply';

  let entries;
  try {
    entries = await fs.readdir(basePath);
  } catch {
    return unavailableBattery();
  }

  const batteryDir = entries.find((e) => e.toLowerCase().includes('bat'));
  if (!batteryDir) return unavailableBattery();

  const prefix = `${basePath}/${batteryDir}`;

  const readValue = async (file) => {
    try {
      return (await fs.readFile(`${prefix}/${file}`, 'utf-8')).trim();
    } catch {
      return null;
    }
  };

  const capacity = parseInt(await readValue('capacity'), 10);
  const status = await readValue('status');

  if (capacity == null || isNaN(capacity)) return unavailableBattery();

  return {
    available: true,
    message: null,
    health: capacity >= 80 ? 'Excellent' : capacity >= 50 ? 'Good' : capacity >= 20 ? 'Fair' : 'Poor',
    level: capacity,
    status: status || 'Unknown',
    charging: status?.toLowerCase() === 'charging',
    remainingTime: 'N/A',
  };
}

module.exports = { getBatteryInfo };
