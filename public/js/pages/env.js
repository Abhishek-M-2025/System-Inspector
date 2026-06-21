import { api } from '../api.js';
import { renderLoading, renderError, escapeHtml, debounce, renderEmpty } from '../utils.js';
import { getSettings } from './settings.js';

let maskEnabled = true;
let currentFilter = 'all';
let searchQuery = '';

export async function renderEnvPage(container) {
  renderLoading(container);

  maskEnabled = getSettings().maskSensitiveEnv !== false;

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Environment Variables</h1>
      <p class="page-subtitle">Inspect runtime environment with search, filter, and sensitive value masking</p>
    </div>

    <div class="env-toolbar">
      <div class="env-search search-box">
        <span class="search-icon">⌕</span>
        <input type="text" id="env-search" placeholder="Search variables...">
      </div>
      <div class="filter-pills" id="env-filters">
        <button class="filter-pill active" data-filter="all">All</button>
        <button class="filter-pill" data-filter="tracked">Tracked</button>
        <button class="filter-pill" data-filter="sensitive">Sensitive</button>
        <button class="filter-pill" data-filter="other">Other</button>
      </div>
      <div class="setting-row" style="padding:0;border:none;gap:10px">
        <span class="text-secondary" style="font-size:0.82rem">Mask sensitive</span>
        <div class="toggle ${maskEnabled ? 'active' : ''}" id="mask-toggle"><div class="toggle-knob"></div></div>
      </div>
    </div>

    <div id="env-content"></div>`;

  bindEnvEvents(container);
  await loadEnvData(container);
}

async function loadEnvData(container) {
  const content = container.querySelector('#env-content');
  content.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await api.getEnv({
      search: searchQuery,
      filter: currentFilter,
      mask: maskEnabled ? 'true' : 'false',
    });

    content.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">${data.total} Variables</span>
          <span class="text-muted">Tracked: PATH, HOME, TEMP, USERNAME, NODE_ENV, PORT</span>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              ${
                data.variables.length
                  ? data.variables
                      .map(
                        (v) => `
                <tr>
                  <td><span class="env-key">${escapeHtml(v.key)}</span></td>
                  <td><span class="env-value ${v.sensitive && maskEnabled ? 'masked' : ''}" title="${escapeHtml(v.value)}">${escapeHtml(v.value)}</span></td>
                  <td>
                    ${v.tracked ? '<span class="badge badge-info">Tracked</span> ' : ''}
                    ${v.sensitive ? '<span class="badge badge-warning">Sensitive</span>' : '<span class="badge badge-muted">Standard</span>'}
                  </td>
                </tr>`
                      )
                      .join('')
                  : `<tr><td colspan="3">${renderEmptyRow()}</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>`;
  } catch (err) {
    content.innerHTML = `<p class="text-danger">${escapeHtml(err.message)}</p>`;
  }
}

function renderEmptyRow() {
  return '<div class="empty-state" style="padding:24px"><div class="empty-state-title">No variables match your filters</div></div>';
}

function bindEnvEvents(container) {
  container.querySelector('#env-search').addEventListener(
    'input',
    debounce((e) => {
      searchQuery = e.target.value;
      loadEnvData(container);
    }, 300)
  );

  container.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.filter;
      loadEnvData(container);
    });
  });

  const toggle = container.querySelector('#mask-toggle');
  toggle.addEventListener('click', () => {
    maskEnabled = !maskEnabled;
    toggle.classList.toggle('active', maskEnabled);
    loadEnvData(container);
  });
}

export function searchEnv(query) {
  searchQuery = query;
  const input = document.getElementById('env-search');
  if (input) {
    input.value = query;
    input.dispatchEvent(new Event('input'));
  }
}
