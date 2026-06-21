import { api } from '../api.js';
import { renderError, escapeHtml, getUsageColor, renderTableSkeleton } from '../utils.js';

export async function renderSystemPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">System Information</h1>
      <p class="page-subtitle">Detailed hardware, process, and network diagnostics</p>
    </div>
    ${renderTableSkeleton(6, 2)}`;

  try {
    const data = await api.getSystemInfo();

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">System Information</h1>
        <p class="page-subtitle">Detailed hardware, process, and network diagnostics</p>
      </div>

      <div class="system-tabs" id="system-tabs">
        <button class="tab-btn active" data-tab="general">General</button>
        <button class="tab-btn" data-tab="processes">Processes</button>
        <button class="tab-btn" data-tab="disk">Storage</button>
        <button class="tab-btn" data-tab="network">Network</button>
        <button class="tab-btn" data-tab="battery">Battery</button>
      </div>

      <div class="tab-panel active" id="tab-general">
        <div class="card">
          <div class="card-header"><span class="card-title">System Details</span></div>
          <div class="info-grid">
            ${field('Computer Name', data.computerName)}
            ${field('Hostname', data.hostname)}
            ${field('Operating System', data.operatingSystem)}
            ${field('OS Version', data.osVersion)}
            ${field('Platform', data.platform)}
            ${field('Architecture', data.cpuArchitecture)}
            ${field('CPU Model', data.cpuModel, true)}
            ${field('CPU Cores', data.cpuCores)}
            ${field('CPU Usage', `${data.cpuUsagePercent}%`)}
            ${field('Node.js', data.nodeVersion)}
            ${field('Username', data.username)}
            ${field('Home Directory', data.homeDirectory, true)}
            ${field('Working Directory', data.currentWorkingDirectory, true)}
            ${field('Timezone', data.timezone)}
            ${field('Boot Time', data.bootTimeFormatted)}
            ${field('Uptime', data.systemUptimeFormatted)}
          </div>
        </div>

        <div class="card" style="margin-top:16px">
          <div class="card-header"><span class="card-title">Memory</span></div>
          <div class="info-grid">
            ${field('Total', data.totalMemoryFormatted)}
            ${field('Used', data.usedMemoryFormatted)}
            ${field('Free', data.freeMemoryFormatted)}
            ${field('Usage', `${data.memoryUsagePercent}%`)}
          </div>
          <div class="progress-bar" style="margin-top:12px">
            <div class="progress-fill ${getUsageColor(data.memoryUsagePercent)}" style="width:${data.memoryUsagePercent}%"></div>
          </div>
        </div>
      </div>

      <div class="tab-panel" id="tab-processes">
        <div class="page-grid grid-2">
          <div class="card">
            <div class="card-header">
              <span class="card-title">Process Summary</span>
              <span class="badge badge-info">${data.processes.totalProcesses} total</span>
            </div>
            ${processTable(data.processes.topProcesses, 'Top Processes')}
          </div>
          <div class="card">
            <div class="card-header"><span class="card-title">High Memory</span></div>
            ${processTable(data.processes.highMemoryProcesses, null, true)}
          </div>
        </div>
        <div class="card" style="margin-top:16px">
          <div class="card-header"><span class="card-title">High CPU</span></div>
          ${processTable(data.processes.highCpuProcesses, null, false, true)}
        </div>
      </div>

      <div class="tab-panel" id="tab-disk">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Storage Overview</span>
            <span class="badge badge-${getUsageColor(data.disk.usagePercent) === 'red' ? 'danger' : 'success'}">${data.disk.usagePercent}% used</span>
          </div>
          <div class="info-grid">
            ${field('Total', data.disk.totalFormatted)}
            ${field('Used', data.disk.usedFormatted)}
            ${field('Free', data.disk.freeFormatted)}
          </div>
          <div class="progress-bar" style="margin-top:12px;height:10px">
            <div class="progress-fill ${getUsageColor(data.disk.usagePercent)}" style="width:${data.disk.usagePercent}%"></div>
          </div>
        </div>
        ${
          data.disk.disks?.length
            ? `<div class="card" style="margin-top:16px"><div class="table-wrap"><table class="data-table">
            <thead><tr><th>Drive</th><th>Total</th><th>Used</th><th>Free</th><th>Usage</th></tr></thead>
            <tbody>${data.disk.disks
              .map(
                (d) => `<tr>
                <td><strong>${escapeHtml(d.drive)}</strong></td>
                <td>${d.totalFormatted}</td>
                <td>${d.usedFormatted}</td>
                <td>${d.freeFormatted}</td>
                <td><span class="badge badge-${d.usagePercent > 85 ? 'danger' : 'info'}">${d.usagePercent}%</span></td>
              </tr>`
              )
              .join('')}</tbody></table></div></div>`
            : ''
        }
      </div>

      <div class="tab-panel" id="tab-network">
        <div class="card">
          <div class="card-header">
            <span class="card-title">Network Status</span>
            <span class="badge badge-${data.network.networkStatus === 'Connected' ? 'success' : 'danger'}">${data.network.networkStatus}</span>
          </div>
          <div class="info-grid">
            ${field('Primary IP', data.network.ipAddress, true)}
            ${field('Interfaces', data.network.interfaceCount)}
          </div>
        </div>
        ${
          data.network.localInterfaces?.length
            ? `<div class="card" style="margin-top:16px"><div class="table-wrap"><table class="data-table">
            <thead><tr><th>Interface</th><th>Address</th><th>Family</th><th>MAC</th></tr></thead>
            <tbody>${data.network.localInterfaces
              .map(
                (i) => `<tr>
                <td>${escapeHtml(i.name)}</td>
                <td class="mono">${escapeHtml(i.address)}</td>
                <td>${i.family}</td>
                <td class="mono text-muted">${escapeHtml(i.mac)}</td>
              </tr>`
              )
              .join('')}</tbody></table></div></div>`
            : ''
        }
      </div>

      <div class="tab-panel" id="tab-battery">
        <div class="card">
          ${
            data.battery.available
              ? `<div class="card-header"><span class="card-title">Battery Status</span>
               <span class="badge badge-success">${data.battery.health}</span></div>
               <div class="info-grid">
                 ${field('Level', `${data.battery.level}%`)}
                 ${field('Status', data.battery.status)}
                 ${field('Charging', data.battery.charging ? 'Yes' : 'No')}
                 ${field('Remaining', data.battery.remainingTime)}
                 ${field('Health', data.battery.health)}
               </div>
               <div class="progress-bar" style="margin-top:16px;height:10px">
                 <div class="progress-fill green" style="width:${data.battery.level}%"></div>
               </div>`
              : `<div class="empty-state">
                 <div class="empty-state-icon">🔌</div>
                 <div class="empty-state-title">Battery Not Available</div>
                 <p>This system appears to be a desktop PC without a battery.</p>
               </div>`
          }
        </div>
      </div>`;

    bindTabs(container);
  } catch (err) {
    renderError(container, err.message);
  }
}

function field(label, value, mono = false) {
  return `
    <div class="info-item">
      <div class="info-label">${label}</div>
      <div class="info-value ${mono ? 'mono' : ''}">${escapeHtml(String(value ?? 'N/A'))}</div>
    </div>`;
}

function processTable(processes, title, byMemory = false, byCpu = false) {
  if (!processes?.length) return '<p class="text-muted">No data</p>';

  const maxMem = Math.max(...processes.map((p) => p.memoryMB || 0), 1);
  const maxCpu = Math.max(...processes.map((p) => p.cpu || 0), 1);

  return `<div class="table-wrap"><table class="data-table">
    <thead><tr><th>Name</th><th>PID</th><th>${byCpu ? 'CPU' : 'Memory'}</th><th></th></tr></thead>
    <tbody>${processes
      .slice(0, 8)
      .map((p) => {
        const val = byCpu ? p.cpu : p.memoryMB;
        const max = byCpu ? maxCpu : maxMem;
        const pct = max > 0 ? Math.round((val / max) * 100) : 0;
        return `<tr>
          <td>${escapeHtml(p.name)}</td>
          <td class="mono">${p.pid}</td>
          <td>${byCpu ? `${val?.toFixed?.(1) || val}` : `${val?.toFixed?.(1) || val} MB`}</td>
          <td style="width:120px"><div class="process-bar"><div class="process-bar-track"><div class="process-bar-fill" style="width:${pct}%"></div></div></div></td>
        </tr>`;
      })
      .join('')}</tbody></table></div>`;
}

function bindTabs(container) {
  const tabs = container.querySelectorAll('.tab-btn');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      container.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      container.querySelector(`#tab-${tab.dataset.tab}`)?.classList.add('active');
    });
  });
}
