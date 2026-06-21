const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◫' },
  { id: 'system', label: 'System Info', icon: '⬡' },
  { id: 'env', label: 'Environment', icon: '⌘' },
  { id: 'files', label: 'File Manager', icon: '📁' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'reports', label: 'Reports', icon: '📋' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export function renderSidebar(activePage, onNavigate) {
  const nav = NAV_ITEMS.map(
    (item) => `
    <div class="nav-item ${item.id === activePage ? 'active' : ''}" data-page="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </div>`
  ).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-label">Navigation</div>
        ${nav}
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-version">System Inspector v1.0.0</div>
      </div>
    </aside>`;
}

export function bindSidebar(onNavigate) {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      onNavigate(page);
    });
  });
}

export function setActiveNav(page) {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.page === page);
  });
}

export function toggleSidebar(open) {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar) return;

  const shouldOpen = open !== undefined ? open : !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', shouldOpen);
  backdrop?.classList.toggle('visible', shouldOpen);
}
