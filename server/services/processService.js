const os = require('os');
const { execFileAsync } = require('./systemService');

async function getProcessInfo() {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      return await getWindowsProcesses();
    }
    return await getUnixProcesses();
  } catch (error) {
    return {
      totalProcesses: 0,
      topProcesses: [],
      highMemoryProcesses: [],
      highCpuProcesses: [],
      error: error.message,
    };
  }
}

async function getWindowsProcesses() {
  const { stdout } = await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-Command',
    `Get-Process | Select-Object Name, Id, @{N='MemoryMB';E={[math]::Round($_.WorkingSet64/1MB,1)}}, CPU | Sort-Object MemoryMB -Descending | Select-Object -First 15 | ConvertTo-Json`,
  ], { timeout: 10000, maxBuffer: 1024 * 1024 });

  const parsed = parseJsonOutput(stdout);
  const processes = normalizeWindowsProcesses(parsed);

  const { stdout: countOut } = await execFileAsync('powershell.exe', [
    '-NoProfile',
    '-Command',
    '(Get-Process).Count',
  ], { timeout: 5000 });

  const totalProcesses = parseInt(countOut.trim(), 10) || processes.length;

  return {
    totalProcesses,
    topProcesses: processes.slice(0, 10),
    highMemoryProcesses: [...processes].sort((a, b) => b.memoryMB - a.memoryMB).slice(0, 8),
    highCpuProcesses: [...processes].sort((a, b) => b.cpu - a.cpu).slice(0, 8),
  };
}

async function getUnixProcesses() {
  const { stdout } = await execFileAsync('ps', [
    'aux', '--sort=-%mem',
  ], { timeout: 10000, maxBuffer: 1024 * 1024 });

  const lines = stdout.trim().split('\n').slice(1);
  const processes = lines.slice(0, 15).map((line) => {
    const parts = line.trim().split(/\s+/);
    return {
      name: parts[10] || parts.slice(10).join(' ') || 'unknown',
      pid: parseInt(parts[1], 10) || 0,
      cpu: parseFloat(parts[2]) || 0,
      memoryMB: parseFloat(parts[5]) / 1024 || 0,
    };
  });

  const { stdout: countOut } = await execFileAsync('ps', ['-e'], { timeout: 5000 });
  const totalProcesses = countOut.trim().split('\n').length - 1;

  return {
    totalProcesses,
    topProcesses: processes.slice(0, 10),
    highMemoryProcesses: [...processes].sort((a, b) => b.memoryMB - a.memoryMB).slice(0, 8),
    highCpuProcesses: [...processes].sort((a, b) => b.cpu - a.cpu).slice(0, 8),
  };
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

function normalizeWindowsProcesses(parsed) {
  return parsed.map((p) => ({
    name: p.Name || 'unknown',
    pid: p.Id || 0,
    memoryMB: p.MemoryMB || 0,
    cpu: typeof p.CPU === 'number' ? p.CPU : 0,
  }));
}

module.exports = { getProcessInfo };
