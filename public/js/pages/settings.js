import { api } from '../api.js';
import { renderLoading, renderError, escapeHtml } from '../utils.js';
import { toast } from '../components/toast.js';

const SETTINGS_KEY = 'system-inspector-settings';

const defaultSettings = {
  theme: 'dark',
  autoRefresh: false,
  refreshInterval: 10,
  showHiddenFiles: false,
  maskSensitiveEnv: true,
  hideSystemSensitive: true,
  activityLogsEnabled: true,
  exportFormat: 'json',
  showNotifications: true,
};

export function getSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('settings-changed', { detail: settings }));
}

export async function renderSettingsPage(container) {
  renderLoading(container);

  let settings = getSettings();
  let apiStatus = { message: 'Offline', version: '1.0.0', environment: 'unknown', workspacePath: '—' };

  try {
    apiStatus = await api.getStatus();
  } catch {
    /* use fallback */
  }

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-subtitle">Configure appearance, dashboard behavior, privacy, and exports</p>
    </div>

    <div class="settings-sections">
      ${settingsSection('Appearance', appearanceSection(settings))}
      ${settingsSection('Dashboard Settings', dashboardSection(settings))}
      ${settingsSection('File Manager Settings', fileManagerSection(settings, apiStatus.workspacePath))}
      ${settingsSection('Privacy Settings', privacySection(settings))}
      ${settingsSection('Activity Logs Settings', activitySection(settings))}
      ${settingsSection('Export Settings', exportSection(settings))}
      ${settingsSection('About Application', aboutSection())}
    </div>

    <div class="card settings-actions">
      <div class="card-header"><span class="card-title">Maintenance</span></div>
      <div class="btn-group">
        <button class="btn btn-secondary btn-sm" id="btn-reset-settings">Reset All Settings</button>
        <button class="btn btn-secondary btn-sm" id="btn-clear-cache">Clear Local Cache</button>
      </div>
      <p class="text-muted" style="margin-top:12px;font-size:0.78rem">
        API: ${escapeHtml(apiStatus.message || 'Running')} · v${escapeHtml(apiStatus.version || '1.0.0')} · ${escapeHtml(apiStatus.environment || 'development')}
      </p>
    </div>`;

  bindSettingsEvents(container, settings);
}

export const renderSettings = renderSettingsPage;

function settingsSection(title, content) {
  return `
    <div class="card settings-section-card">
      <div class="card-header"><span class="card-title">${title}</span></div>
      ${content}
    </div>`;
}

function appearanceSection(settings) {
  return `
    <div class="setting-row">
      <div class="setting-info">
        <h4>Dark Mode</h4>
        <p>Professional dark theme (default)</p>
      </div>
      <div class="theme-toggle-group">
        <button class="theme-btn ${settings.theme === 'dark' ? 'active' : ''}" data-theme="dark" id="theme-dark">Dark</button>
        <button class="theme-btn ${settings.theme === 'light' ? 'active' : ''}" data-theme="light" id="theme-light">Light</button>
      </div>
    </div>`;
}

function dashboardSection(settings) {
  return `
    <div class="setting-row">
      <div class="setting-info">
        <h4>Auto Refresh</h4>
        <p>Automatically reload dashboard data</p>
      </div>
      <div class="toggle ${settings.autoRefresh ? 'active' : ''}" id="toggle-auto-refresh">
        <div class="toggle-knob"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <h4>Refresh Interval</h4>
        <p>Seconds between auto-refresh cycles</p>
      </div>
      <select class="form-select" id="refresh-interval" style="width:100px">
        ${[5, 10, 30].map((s) => `<option value="${s}" ${settings.refreshInterval === s ? 'selected' : ''}>${s}s</option>`).join('')}
      </select>
    </div>`;
}

function fileManagerSection(settings, workspacePath) {
  return `
    <div class="setting-row">
      <div class="setting-info">
        <h4>Show Hidden Files</h4>
        <p>Display dot-prefixed files and folders</p>
      </div>
      <div class="toggle ${settings.showHiddenFiles ? 'active' : ''}" id="toggle-hidden-files">
        <div class="toggle-knob"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <h4>Workspace Path</h4>
        <p>Sandboxed directory for file operations</p>
      </div>
      <code class="workspace-path mono">${escapeHtml(workspacePath || '—')}</code>
    </div>`;
}

function privacySection(settings) {
  return `
    <div class="setting-row">
      <div class="setting-info">
        <h4>Mask Sensitive Environment Variables</h4>
        <p>Hide values matching password, token, secret patterns</p>
      </div>
      <div class="toggle ${settings.maskSensitiveEnv ? 'active' : ''}" id="toggle-mask-env">
        <div class="toggle-knob"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <h4>Hide System Sensitive Values</h4>
        <p>Redact tracked system paths and credentials</p>
      </div>
      <div class="toggle ${settings.hideSystemSensitive ? 'active' : ''}" id="toggle-hide-sensitive">
        <div class="toggle-knob"></div>
      </div>
    </div>`;
}

function activitySection(settings) {
  return `
    <div class="setting-row">
      <div class="setting-info">
        <h4>Enable Activity Logs</h4>
        <p>Track and display file and report activity</p>
      </div>
      <div class="toggle ${settings.activityLogsEnabled ? 'active' : ''}" id="toggle-activity-logs">
        <div class="toggle-knob"></div>
      </div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <h4>Clear All Logs</h4>
        <p>Permanently remove all stored activity entries</p>
      </div>
      <button class="btn btn-danger btn-sm" id="btn-clear-logs">Clear All Logs</button>
    </div>`;
}

function exportSection(settings) {
  return `
    <div class="setting-row">
      <div class="setting-info">
        <h4>Default Export Format</h4>
        <p>Preferred format for report downloads</p>
      </div>
      <select class="form-select" id="export-format" style="width:100px">
        <option value="json" ${settings.exportFormat === 'json' ? 'selected' : ''}>JSON</option>
        <option value="txt" ${settings.exportFormat === 'txt' ? 'selected' : ''}>TXT</option>
      </select>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <h4>Toast Notifications</h4>
        <p>Show action feedback notifications</p>
      </div>
      <div class="toggle ${settings.showNotifications ? 'active' : ''}" id="toggle-notifications">
        <div class="toggle-knob"></div>
      </div>
    </div>`;
}

function aboutSection() {
  return `
    <div class="info-grid about-grid">
      ${info('Application Name', 'System Inspector')}
      ${info('Version', '1.0.0')}
      ${info('Developer', 'Abhishek Mehra')}
      ${info('Tech Stack', 'HTML, CSS, JavaScript, Node.js, Express.js')}
    </div>`;
}

function info(label, value) {
  return `
    <div class="info-item">
      <div class="info-label">${label}</div>
      <div class="info-value">${escapeHtml(String(value))}</div>
    </div>`;
}

function bindSettingsEvents(container, settings) {
  const bindToggle = (id, key) => {
    const el = container.querySelector(id);
    el?.addEventListener('click', () => {
      settings[key] = !settings[key];
      el.classList.toggle('active', settings[key]);
      saveSettings(settings);
      applySettings(settings);
      toast.success('Settings saved');
    });
  };

  bindToggle('#toggle-auto-refresh', 'autoRefresh');
  bindToggle('#toggle-hidden-files', 'showHiddenFiles');
  bindToggle('#toggle-mask-env', 'maskSensitiveEnv');
  bindToggle('#toggle-hide-sensitive', 'hideSystemSensitive');
  bindToggle('#toggle-activity-logs', 'activityLogsEnabled');
  bindToggle('#toggle-notifications', 'showNotifications');

  container.querySelector('#theme-dark')?.addEventListener('click', () => setTheme(container, settings, 'dark'));
  container.querySelector('#theme-light')?.addEventListener('click', () => setTheme(container, settings, 'light'));

  container.querySelector('#refresh-interval')?.addEventListener('change', (e) => {
    settings.refreshInterval = parseInt(e.target.value, 10);
    saveSettings(settings);
    applySettings(settings);
    toast.success('Refresh interval updated');
  });

  container.querySelector('#export-format')?.addEventListener('change', (e) => {
    settings.exportFormat = e.target.value;
    saveSettings(settings);
    toast.success('Export format updated');
  });

  container.querySelector('#btn-clear-logs')?.addEventListener('click', async () => {
    if (!confirm('Clear all activity logs? This cannot be undone.')) return;
    try {
      await api.clearLogs();
      toast.success('Activity logs cleared');
    } catch (err) {
      toast.error(err.message);
    }
  });

  container.querySelector('#btn-reset-settings')?.addEventListener('click', () => {
    localStorage.removeItem(SETTINGS_KEY);
    applySettings(defaultSettings);
    toast.success('Settings reset to defaults');
    renderSettingsPage(container);
  });

  container.querySelector('#btn-clear-cache')?.addEventListener('click', () => {
    const preserved = localStorage.getItem(SETTINGS_KEY);
    localStorage.clear();
    if (preserved) localStorage.setItem(SETTINGS_KEY, preserved);
    toast.success('Local cache cleared');
  });
}

function setTheme(container, settings, theme) {
  settings.theme = theme;
  saveSettings(settings);
  applySettings(settings);
  container.querySelectorAll('.theme-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
  toast.success(`${theme === 'dark' ? 'Dark' : 'Light'} mode enabled`);
}

export function applySettings(settings) {
  const s = settings || getSettings();
  document.documentElement.setAttribute('data-theme', s.theme === 'light' ? 'light' : 'dark');
}

export function getRefreshInterval() {
  const s = getSettings();
  return s.autoRefresh ? s.refreshInterval * 1000 : null;
}

export function isActivityLogsEnabled() {
  return getSettings().activityLogsEnabled !== false;
}

export function shouldShowNotifications() {
  return getSettings().showNotifications !== false;
}
