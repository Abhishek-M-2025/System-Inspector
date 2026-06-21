import { renderSidebar, bindSidebar, setActiveNav, toggleSidebar } from './components/sidebar.js';
import { initNavbar } from './components/navbar.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderSystemPage } from './pages/system.js';
import { renderEnvPage, searchEnv } from './pages/env.js';
import { renderFilesPage, searchFiles } from './pages/files.js';
import { renderAnalyticsPage } from './pages/analytics.js';
import { renderReportsPage } from './pages/reports.js';
import {
  renderSettingsPage,
  renderSettings,
  applySettings,
  getSettings,
  getRefreshInterval,
} from './pages/settings.js';
import { toast } from './components/toast.js';

const PAGE_RENDERERS = {
  dashboard: renderDashboard,
  system: renderSystemPage,
  env: renderEnvPage,
  files: renderFilesPage,
  analytics: renderAnalyticsPage,
  reports: renderReportsPage,
  settings: renderSettingsPage,
};

// Alias for compatibility
PAGE_RENDERERS.settings = renderSettings;

let currentPage = 'dashboard';
let refreshTimer = null;
let mainContainer = null;

function init() {
  applySettings(getSettings());

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-shell">
      <nav class="navbar">
        <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle navigation">☰</button>
        <div class="navbar-brand">
          <div class="brand-logo">SI</div>
          <span class="brand-name">System Inspector</span>
        </div>
        <div class="navbar-center">
          <div class="search-box">
            <span class="search-icon">⌕</span>
            <input type="text" id="global-search" placeholder="Search files, env vars...">
          </div>
        </div>
        <div class="navbar-right">
          <span class="status-dot" id="api-status-dot" title="Checking API..."></span>
          <span class="status-label" id="api-status-label">Connecting</span>
          <div class="live-clock" id="live-clock">--:--:--</div>
        </div>
      </nav>
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <div class="app-body">
        ${renderSidebar(currentPage)}
        <main class="main-content" id="main-content"></main>
      </div>
    </div>`;

  mainContainer = document.getElementById('main-content');

  initNavbar(handleGlobalSearch);
  bindSidebar(navigateTo);
  bindMobileNav();
  navigateTo(currentPage);
  setupAutoRefresh();

  window.addEventListener('settings-changed', setupAutoRefresh);
}

function bindMobileNav() {
  const toggle = document.getElementById('sidebar-toggle');
  const backdrop = document.getElementById('sidebar-backdrop');

  toggle?.addEventListener('click', () => toggleSidebar());
  backdrop?.addEventListener('click', () => toggleSidebar(false));
}

function navigateTo(page) {
  if (!PAGE_RENDERERS[page]) page = 'dashboard';

  currentPage = page;
  setActiveNav(page);
  history.replaceState({ page }, '', `#${page}`);
  toggleSidebar(false);

  const renderer = PAGE_RENDERERS[page];
  renderer(mainContainer);
  setupAutoRefresh();
}

function handleGlobalSearch(query) {
  if (!query.trim()) return;

  if (currentPage === 'env') {
    searchEnv(query);
    return;
  }

  if (currentPage === 'files') {
    searchFiles(query);
    return;
  }

  navigateTo('files');
  setTimeout(() => searchFiles(query), 300);
}

function setupAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }

  const interval = getRefreshInterval();
  if (interval && currentPage === 'dashboard') {
    refreshTimer = setInterval(() => {
      renderDashboard(mainContainer);
    }, interval);
  }
}

window.addEventListener('hashchange', () => {
  const page = location.hash.slice(1) || 'dashboard';
  navigateTo(page);
});

window.addEventListener('DOMContentLoaded', () => {
  const hashPage = location.hash.slice(1);
  if (hashPage && PAGE_RENDERERS[hashPage]) {
    currentPage = hashPage;
  }

  init();
  toast.info('System Inspector ready');
});

export { navigateTo, setupAutoRefresh, renderSettings };
