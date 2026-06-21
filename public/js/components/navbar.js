import { debounce } from '../utils.js';
import { api } from '../api.js';

let clockInterval = null;
let statusInterval = null;

export function initNavbar(onSearch) {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);

  checkApiStatus();
  statusInterval = setInterval(checkApiStatus, 30000);

  const searchInput = document.getElementById('global-search');
  if (searchInput && onSearch) {
    searchInput.addEventListener('input', debounce((e) => onSearch(e.target.value), 400));
  }
}

function updateClock() {
  const el = document.getElementById('live-clock');
  if (!el) return;

  const now = new Date();
  el.textContent = now.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

async function checkApiStatus() {
  const dot = document.getElementById('api-status-dot');
  const label = document.getElementById('api-status-label');
  if (!dot) return;

  try {
    await api.getStatus();
    dot.className = 'status-dot online';
    dot.title = 'API Online';
    if (label) label.textContent = 'Online';
  } catch {
    dot.className = 'status-dot offline';
    dot.title = 'API Offline';
    if (label) label.textContent = 'Offline';
  }
}

export function destroyNavbar() {
  if (clockInterval) clearInterval(clockInterval);
  if (statusInterval) clearInterval(statusInterval);
}
