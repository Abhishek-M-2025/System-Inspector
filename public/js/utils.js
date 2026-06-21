export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatDate(iso) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '< 1m';
}

export function getHealthColor(rating) {
  const map = {
    Excellent: 'success',
    Good: 'success',
    Average: 'warning',
    Poor: 'danger',
  };
  return map[rating] || 'info';
}

export function getBatteryColor(level) {
  const value = Number(level) || 0;
  if (value <= 20) return 'red';
  if (value <= 50) return 'yellow';
  return 'green';
}

/** 0–50 green, 50–80 yellow, 80–100 red */
export function getUsageColor(percent) {
  const value = Number(percent) || 0;
  if (value >= 80) return 'red';
  if (value >= 50) return 'yellow';
  return 'green';
}

export function getUsageStatus(percent) {
  const value = Number(percent) || 0;
  if (value >= 80) return 'Critical';
  if (value >= 50) return 'Moderate';
  return 'Normal';
}

export function getUsageBadgeClass(percent) {
  const color = getUsageColor(percent);
  return color === 'red' ? 'badge-danger' : color === 'yellow' ? 'badge-warning' : 'badge-success';
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

export function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function getActivityDotClass(action) {
  if (action.includes('Created')) return 'create';
  if (action.includes('Updated') || action.includes('Renamed')) return 'update';
  if (action.includes('Deleted')) return 'delete';
  if (action.includes('Report')) return 'report';
  return 'update';
}

export function createTrendIndicator(current, previous, suffix = '%') {
  if (previous == null || previous === undefined) {
    return '<span class="trend-indicator stable" title="Stable">→</span>';
  }

  const diff = Number(current) - Number(previous);
  if (Math.abs(diff) < 1) {
    return '<span class="trend-indicator stable" title="Stable">→</span>';
  }

  if (diff > 0) {
    return `<span class="trend-indicator up" title="Up ${Math.abs(diff).toFixed(0)}${suffix}">↑</span>`;
  }

  return `<span class="trend-indicator down" title="Down ${Math.abs(diff).toFixed(0)}${suffix}">↓</span>`;
}

const USAGE_STROKE = { green: '#22C55E', yellow: '#F59E0B', red: '#EF4444' };

export function createCircularIndicator(percent, size = 52, isBattery = false) {
  const value = Math.min(100, Math.max(0, Number(percent) || 0));
  const colorKey = isBattery ? getBatteryColor(value) : getUsageColor(value);
  const stroke = USAGE_STROKE[colorKey];
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return `
    <div class="circular-indicator" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="var(--bg-primary)" stroke-width="5"/>
        <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${stroke}" stroke-width="5"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          stroke-linecap="round" class="circular-ring"/>
      </svg>
      <span class="circular-label">${Math.round(value)}%</span>
    </div>`;
}

export function renderLoading(container) {
  container.innerHTML = `
    <div class="loading-overlay">
      <div class="spinner"></div>
      <span>Loading...</span>
    </div>`;
}

export function renderDashboardSkeleton(container) {
  container.innerHTML = `
    <div class="skeleton-page">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-subtitle"></div>
      <div class="skeleton-stats page-grid grid-4">
        ${Array(4).fill('<div class="skeleton skeleton-stat-card"></div>').join('')}
      </div>
      <div class="page-grid grid-2">
        <div class="skeleton skeleton-card-lg"></div>
        <div class="skeleton skeleton-card-lg"></div>
      </div>
      <div class="skeleton skeleton-card-lg" style="margin-top:20px"></div>
    </div>`;
}

export function renderTableSkeleton(rows = 5, cols = 3) {
  const header = Array(cols).fill('<div class="skeleton skeleton-cell"></div>').join('');
  const body = Array(rows)
    .fill(`<div class="skeleton-table-row">${Array(cols).fill('<div class="skeleton skeleton-cell"></div>').join('')}</div>`)
    .join('');

  return `
    <div class="skeleton-table">
      <div class="skeleton-table-header">${header}</div>
      ${body}
    </div>`;
}

export function renderCardSkeleton(count = 3) {
  return `<div class="skeleton-cards">${Array(count).fill('<div class="skeleton skeleton-card"></div>').join('')}</div>`;
}

export function renderError(container, message, onRetry) {
  container.innerHTML = `
    <div class="error-state">
      <div class="error-state-icon">⚠</div>
      <div class="error-state-title">Something went wrong</div>
      <p>${escapeHtml(message)}</p>
      <button class="btn btn-secondary btn-sm retry-btn" style="margin-top:12px">Retry</button>
    </div>`;

  container.querySelector('.retry-btn')?.addEventListener('click', () => {
    if (typeof onRetry === 'function') onRetry();
    else location.reload();
  });
}

export function renderEmpty(message = 'No data available', subtitle = '') {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <div class="empty-state-title">${escapeHtml(message)}</div>
      ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ''}
    </div>`;
}

export function createHealthRing(score, rating) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? '#22C55E' : score >= 70 ? '#3B82F6' : score >= 50 ? '#F59E0B' : '#EF4444';

  return `
    <div class="health-ring">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#1E293B" stroke-width="8"/>
        <circle cx="60" cy="60" r="${radius}" fill="none" stroke="${color}" stroke-width="8"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          stroke-linecap="round" class="health-ring-progress"/>
      </svg>
      <div class="health-ring-value">
        <span class="health-score-num">${score}</span>
        <span class="health-score-label">${rating}</span>
      </div>
    </div>`;
}
