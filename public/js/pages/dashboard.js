import { api } from '../api.js';
import {
  renderDashboardSkeleton,
  renderError,
  createHealthRing,
  getUsageColor,
  getBatteryColor,
  getUsageStatus,
  getUsageBadgeClass,
  getHealthColor,
  escapeHtml,
  getActivityDotClass,
  formatDate,
  formatTime,
  createTrendIndicator,
  createCircularIndicator,
  renderEmpty,
  renderTableSkeleton,
} from '../utils.js';
import { isActivityLogsEnabled } from './settings.js';

let prevStats = null;
let lastRefreshTime = null;

export async function renderDashboard(container) {
  renderDashboardSkeleton(container);

  try {
    const data = await api.getDashboard();
    lastRefreshTime = new Date();

    const { system, disk, battery, network, health, processes, recentActivity } = data;
    const cpu = system.cpuUsagePercent;
    const ram = system.memoryUsagePercent;
    const processCount = processes.total;

    const trends = {
      cpu: createTrendIndicator(cpu, prevStats?.cpu),
      ram: createTrendIndicator(ram, prevStats?.ram),
      processes: createTrendIndicator(processCount, prevStats?.processes, ''),
      battery: battery.available
        ? createTrendIndicator(battery.level, prevStats?.battery)
        : '<span class="trend-indicator stable">—</span>',
    };

    prevStats = { cpu, ram, processes: processCount, battery: battery.level };

    const systemStatus = health.rating === 'Poor' ? 'warning' : 'online';
    const statusLabel = systemStatus === 'online' ? 'System Online' : 'Needs Attention';
    const statusBadge = systemStatus === 'online' ? 'badge-success' : 'badge-warning';

    container.innerHTML = `
      <div class="page-header dashboard-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Real-time system overview and activity monitor</p>
        </div>
        <div class="dashboard-meta">
          <span class="system-status-badge badge ${statusBadge}">${statusLabel}</span>
          <span class="health-pill badge badge-${getHealthColor(health.rating)}">
            Health: ${health.rating} (${health.score})
          </span>
          <span class="last-refresh text-muted">Last refresh: ${formatTime(lastRefreshTime)}</span>
        </div>
      </div>

      <div class="quick-stats page-grid grid-4">
        ${quickStatCard({
          label: 'CPU Usage',
          value: `${cpu}%`,
          icon: '⬡',
          percent: cpu,
          status: getUsageStatus(cpu),
          trend: trends.cpu,
        })}
        ${quickStatCard({
          label: 'RAM Usage',
          value: `${ram}%`,
          icon: '▣',
          percent: ram,
          status: getUsageStatus(ram),
          trend: trends.ram,
        })}
        ${quickStatCard({
          label: 'Running Processes',
          value: processCount,
          icon: '⚙',
          percent: null,
          status: processCount > 200 ? 'High Load' : 'Active',
          trend: trends.processes,
          isCount: true,
        })}
        ${batteryStatCard(battery, trends.battery)}
      </div>

      <div class="dashboard-hero">
        <div class="page-grid grid-2">
          <div class="card hover-card">
            <div class="card-header">
              <span class="card-title">System Overview</span>
              <span class="badge badge-info">${escapeHtml(system.platform)}</span>
            </div>
            <div class="info-grid">
              ${infoItem('Hostname', system.hostname)}
              ${infoItem('OS', system.operatingSystem)}
              ${infoItem('CPU', system.cpuModel, true)}
              ${infoItem('Cores', system.cpuCores)}
              ${infoItem('Node.js', system.nodeVersion)}
              ${infoItem('Uptime', system.systemUptimeFormatted)}
              ${infoItem('Memory', `${system.usedMemoryFormatted} / ${system.totalMemoryFormatted}`)}
              ${infoItem('Network', network.networkStatus)}
            </div>
            <div class="usage-row" style="margin-top:16px">
              <div class="usage-item">
                <div class="usage-label"><span>CPU</span><span class="mono">${cpu}%</span></div>
                ${createCircularIndicator(cpu, 48)}
                <div class="progress-bar"><div class="progress-fill ${getUsageColor(cpu)}" style="width:${cpu}%"></div></div>
              </div>
              <div class="usage-item">
                <div class="usage-label"><span>RAM</span><span class="mono">${ram}%</span></div>
                ${createCircularIndicator(ram, 48)}
                <div class="progress-bar"><div class="progress-fill ${getUsageColor(ram)}" style="width:${ram}%"></div></div>
              </div>
            </div>
          </div>

          <div class="card hover-card">
            <div class="card-header">
              <span class="card-title">Top Processes</span>
              <span class="text-muted">${processes.total} running</span>
            </div>
            ${
              processes.top.length
                ? `<div class="table-wrap"><table class="data-table">
                <thead><tr><th>Process</th><th>PID</th><th>Memory</th></tr></thead>
                <tbody>${processes.top
                  .map(
                    (p) => `<tr>
                    <td>${escapeHtml(p.name)}</td>
                    <td class="mono">${p.pid}</td>
                    <td>${p.memoryMB?.toFixed?.(1) || p.memoryMB} MB</td>
                  </tr>`
                  )
                  .join('')}</tbody></table></div>`
                : renderEmpty('No process data available', 'Process metrics will appear when available')
            }
          </div>
        </div>

        <div class="card hover-card health-card">
          <div class="card-header" style="justify-content:center">
            <span class="card-title">System Health Score</span>
          </div>
          ${createHealthRing(health.score, health.rating)}
          <div class="health-breakdown">
            ${healthMetric('CPU', health.breakdown.cpu.usage)}
            ${healthMetric('RAM', health.breakdown.ram.usage)}
            ${healthMetric('Disk', health.breakdown.disk.usage)}
            ${healthMetric('Battery', health.breakdown.battery.available ? health.breakdown.battery.level : null, !health.breakdown.battery.available)}
          </div>
        </div>
      </div>

      <div class="page-grid grid-2" style="margin-top:20px">
        <div class="card hover-card">
          <div class="card-header">
            <span class="card-title">Storage</span>
            <span class="badge ${getUsageBadgeClass(disk.usagePercent)}">${getUsageStatus(disk.usagePercent)}</span>
          </div>
          <div class="storage-row">
            ${createCircularIndicator(disk.usagePercent, 64)}
            <div class="storage-details">
              <div class="card-value">${disk.usedFormatted}</div>
              <div class="card-sub">of ${disk.totalFormatted} used (${disk.usagePercent}%)</div>
              <div class="progress-bar"><div class="progress-fill ${getUsageColor(disk.usagePercent)}" style="width:${disk.usagePercent}%"></div></div>
            </div>
          </div>
        </div>

        <div class="card hover-card">
          <div class="card-header">
            <span class="card-title">Battery</span>
          </div>
          ${
            battery.available
              ? `<div class="storage-row">
                  ${createCircularIndicator(battery.level, 64, true)}
                  <div class="storage-details">
                    <div class="card-value">${battery.level}%</div>
                    <div class="card-sub">${escapeHtml(battery.status)} · ${battery.charging ? 'Charging' : 'On Battery'}</div>
                    <div class="progress-bar"><div class="progress-fill ${getBatteryColor(battery.level)}" style="width:${battery.level}%"></div></div>
                  </div>
                </div>`
              : renderEmpty('Battery Not Available', 'Desktop Device Detected')
          }
        </div>
      </div>

      <div class="card hover-card" style="margin-top:20px">
        <div class="card-header">
          <span class="card-title">Recent Activity Logs</span>
        </div>
        ${
          !isActivityLogsEnabled()
            ? renderEmpty('Activity logs disabled', 'Enable activity logs in Settings to track events')
            : recentActivity.length
              ? `<ul class="activity-list">${recentActivity
                  .map(
                    (log) => `
              <li class="activity-item">
                <span class="activity-dot ${getActivityDotClass(log.action)}"></span>
                <span class="activity-text">${escapeHtml(log.action)}${log.details?.path ? ` — <span class="mono text-accent">${escapeHtml(log.details.path)}</span>` : ''}</span>
                <span class="activity-time">${formatDate(log.timestamp)}</span>
              </li>`
                  )
                  .join('')}</ul>`
              : renderEmpty('No activity logs available', 'File and report actions will appear here')
        }
      </div>`;
  } catch (err) {
    renderError(container, err.message, () => renderDashboard(container));
  }
}

function quickStatCard({ label, value, icon, percent, status, trend, isCount = false }) {
  const color = percent != null ? getUsageColor(percent) : 'blue';
  const badgeClass = percent != null ? getUsageBadgeClass(percent) : 'badge-info';

  return `
    <div class="card stat-card quick-stat-card hover-card">
      <div class="quick-stat-top">
        <div class="stat-icon ${color}">${icon}</div>
        ${trend}
      </div>
      <div class="quick-stat-body">
        <div class="quick-stat-values">
          <div class="card-value">${value}</div>
          <div class="card-sub">${label}</div>
          <span class="badge ${badgeClass} quick-stat-status">${status}</span>
        </div>
        ${percent != null ? createCircularIndicator(percent, 44) : ''}
      </div>
      ${
        percent != null
          ? `<div class="progress-bar"><div class="progress-fill ${color}" style="width:${percent}%"></div></div>`
          : ''
      }
    </div>`;
}

function batteryStatCard(battery, trend) {
  if (!battery.available) {
    return `
      <div class="card stat-card quick-stat-card hover-card">
        <div class="quick-stat-top">
          <div class="stat-icon blue">🔋</div>
          ${trend}
        </div>
        <div class="card-value" style="font-size:1.1rem">N/A</div>
        <div class="card-sub">Battery Status</div>
        <span class="badge badge-muted quick-stat-status">Desktop Device</span>
      </div>`;
  }

  const level = battery.level;
  const color = getBatteryColor(level);
  const badgeClass = color === 'red' ? 'badge-danger' : color === 'yellow' ? 'badge-warning' : 'badge-success';
  const status = battery.charging ? 'Charging' : level <= 20 ? 'Low' : 'Healthy';

  return `
    <div class="card stat-card quick-stat-card hover-card">
      <div class="quick-stat-top">
        <div class="stat-icon ${color}">🔋</div>
        ${trend}
      </div>
      <div class="quick-stat-body">
        <div class="quick-stat-values">
          <div class="card-value">${level}%</div>
          <div class="card-sub">Battery Status</div>
          <span class="badge ${badgeClass} quick-stat-status">${status}</span>
        </div>
        ${createCircularIndicator(level, 44, true)}
      </div>
      <div class="progress-bar"><div class="progress-fill ${color}" style="width:${level}%"></div></div>
    </div>`;
}

function healthMetric(label, value, unavailable = false) {
  if (unavailable) {
    return `
      <div class="health-metric">
        <span class="health-metric-label">${label}</span>
        <span class="text-muted">N/A</span>
      </div>`;
  }

  const color = getUsageColor(value);
  return `
    <div class="health-metric">
      <span class="health-metric-label">${label}</span>
      <span class="mono">${value}%</span>
      <div class="progress-bar" style="margin-top:6px">
        <div class="progress-fill ${color}" style="width:${value}%"></div>
      </div>
    </div>`;
}

function infoItem(label, value, mono = false) {
  return `
    <div class="info-item">
      <div class="info-label">${label}</div>
      <div class="info-value ${mono ? 'mono' : ''}">${escapeHtml(String(value))}</div>
    </div>`;
}

export { renderTableSkeleton };
