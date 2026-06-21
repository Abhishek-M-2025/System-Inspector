let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function shouldShow() {
  try {
    const settings = JSON.parse(localStorage.getItem('system-inspector-settings') || '{}');
    return settings.showNotifications !== false;
  } catch {
    return true;
  }
}

export function showToast(message, type = 'info', duration = 3500) {
  if (!shouldShow()) return;

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${message}</span>`;

  ensureContainer().appendChild(el);

  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s ease';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

export const toast = {
  success: (msg) => showToast(msg, 'success'),
  error: (msg) => showToast(msg, 'error'),
  info: (msg) => showToast(msg, 'info'),
};
