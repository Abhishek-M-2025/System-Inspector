import { api } from '../api.js';
import { renderLoading, renderError, escapeHtml, downloadJSON, downloadText } from '../utils.js';
import { toast } from '../components/toast.js';
import { getSettings } from './settings.js';

let currentReport = null;

export async function renderReportsPage(container) {
  renderLoading(container);

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Reports</h1>
      <p class="page-subtitle">Generate and export system, analytics, and environment reports</p>
    </div>

    <div class="report-cards">
      ${reportCard('system', '⬡', 'System Report', 'Hardware, processes, disk, network, and health metrics')}
      ${reportCard('analytics', '📊', 'Analytics Report', 'Project file statistics and code distribution')}
      ${reportCard('environment', '⌘', 'Environment Report', 'Runtime environment variables and configuration')}
    </div>

    <div class="card" id="report-output">
      <div class="card-header">
        <span class="card-title">Report Preview</span>
        <div class="btn-group">
          <button class="btn btn-sm btn-secondary" id="btn-export" disabled>Export JSON</button>
          <button class="btn btn-sm btn-secondary" id="btn-copy" disabled>Copy</button>
        </div>
      </div>
      <div class="report-preview" id="report-preview">
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <div class="empty-state-title">Select a report type above</div>
          <p>Generated reports will appear here</p>
        </div>
      </div>
    </div>`;

  bindReportEvents(container);
}

function reportCard(type, icon, title, desc) {
  return `
    <div class="card report-card" data-type="${type}">
      <div class="report-card-icon">${icon}</div>
      <div class="report-card-title">${title}</div>
      <div class="report-card-desc">${desc}</div>
    </div>`;
}

function bindReportEvents(container) {
  container.querySelectorAll('.report-card').forEach((card) => {
    card.addEventListener('click', () => generateReport(container, card.dataset.type));
  });

  container.querySelector('#btn-export').addEventListener('click', () => {
    if (!currentReport) return;
    const format = getSettings().exportFormat || 'json';
    const base = `system-inspector-${currentReport.type}-${Date.now()}`;

    if (format === 'txt') {
      downloadText(JSON.stringify(currentReport, null, 2), `${base}.txt`);
    } else {
      downloadJSON(currentReport, `${base}.json`);
    }
    toast.success(`Report exported as ${format.toUpperCase()}`);
  });

  container.querySelector('#btn-copy').addEventListener('click', async () => {
    if (!currentReport) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(currentReport, null, 2));
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  });
}

async function generateReport(container, type) {
  const preview = container.querySelector('#report-preview');
  preview.innerHTML = '<div class="spinner"></div>';

  container.querySelector('#btn-export').disabled = true;
  container.querySelector('#btn-copy').disabled = true;

  try {
    currentReport = await api.generateReport(type);
    preview.innerHTML = `<pre>${escapeHtml(JSON.stringify(currentReport, null, 2))}</pre>`;
    container.querySelector('#btn-export').disabled = false;
    container.querySelector('#btn-copy').disabled = false;
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated`);
  } catch (err) {
    preview.innerHTML = `<p class="text-danger">${escapeHtml(err.message)}</p>`;
    toast.error(err.message);
  }
}

export async function renderReportsPageWithError(container, err) {
  renderError(container, err.message);
}
