import { api } from '../api.js';
import { renderCardSkeleton, renderError, escapeHtml, formatDate } from '../utils.js';

let selectedFilePath = null;

export async function renderAnalyticsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Code Analytics</h1>
      <p class="page-subtitle">Project statistics and per-file code analysis</p>
    </div>
    ${renderCardSkeleton(2)}
    <div style="margin-top:20px">${renderCardSkeleton(1)}</div>`;

  try {
    const [overview, tree] = await Promise.all([
      api.getAnalytics(),
      api.getFileTree(),
    ]);

    const project = overview.project;

    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-title">Code Analytics</h1>
        <p class="page-subtitle">Project statistics and per-file code analysis</p>
      </div>

      <div class="analytics-layout">
        <div>
          <div class="card">
            <div class="card-header"><span class="card-title">Project Overview</span></div>
            <div class="metric-grid">
              ${metric('Total Files', project.totalFiles)}
              ${metric('Folders', project.totalFolders)}
              ${metric('Total Size', project.totalSizeFormatted)}
              ${metric('JavaScript', project.javascriptFiles)}
              ${metric('HTML', project.htmlFiles)}
              ${metric('CSS', project.cssFiles)}
            </div>

            <div style="margin-top:20px">
              <div class="card-sub" style="margin-bottom:8px">File Distribution</div>
              ${renderFileBar(project)}
              <div class="legend" style="margin-top:12px">
                <span class="legend-item"><span class="legend-dot" style="background:#F7DF1E"></span> JS (${project.javascriptFiles})</span>
                <span class="legend-item"><span class="legend-dot" style="background:#E34F26"></span> HTML (${project.htmlFiles})</span>
                <span class="legend-item"><span class="legend-dot" style="background:#1572B6"></span> CSS (${project.cssFiles})</span>
                <span class="legend-item"><span class="legend-dot" style="background:#64748B"></span> Other (${project.otherFiles})</span>
              </div>
            </div>
          </div>

          <div class="card" style="margin-top:16px">
            <div class="card-header"><span class="card-title">Select a File to Analyze</span></div>
            <div class="file-tree" id="analytics-tree" style="max-height:300px">${renderSelectableTree(tree)}</div>
          </div>
        </div>

        <div class="card" id="file-analytics-panel">
          <div class="card-header"><span class="card-title">File Analysis</span></div>
          <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <div class="empty-state-title">No file selected</div>
            <p>Click a file in the tree to view analytics</p>
          </div>
        </div>
      </div>`;

    bindAnalyticsTree(container);
  } catch (err) {
    renderError(container, err.message);
  }
}

function metric(label, value) {
  return `
    <div class="metric-box">
      <div class="metric-num">${value}</div>
      <div class="metric-label">${label}</div>
    </div>`;
}

function renderFileBar(project) {
  const total = project.totalFiles || 1;
  const jsPct = (project.javascriptFiles / total) * 100;
  const htmlPct = (project.htmlFiles / total) * 100;
  const cssPct = (project.cssFiles / total) * 100;
  const otherPct = (project.otherFiles / total) * 100;

  return `
    <div class="file-type-bar">
      <div class="file-type-segment js" style="width:${jsPct}%"></div>
      <div class="file-type-segment html" style="width:${htmlPct}%"></div>
      <div class="file-type-segment css" style="width:${cssPct}%"></div>
      <div class="file-type-segment other" style="width:${otherPct}%"></div>
    </div>`;
}

function renderSelectableTree(node, depth = 0) {
  if (!node) return '';
  const isFile = node.type === 'file';

  let html = '';
  if (isFile) {
    html += `<div class="tree-item analytics-file" data-path="${escapeHtml(node.path)}" style="padding-left:${depth * 12 + 8}px">
      <span class="tree-icon">📄</span><span>${escapeHtml(node.name)}</span>
    </div>`;
  } else if (node.name) {
    html += `<div class="tree-item" style="padding-left:${depth * 12 + 8}px;cursor:default">
      <span class="tree-icon">📁</span><span>${escapeHtml(node.name)}</span>
    </div>`;
  }

  if (node.children) {
    html += node.children.map((c) => renderSelectableTree(c, depth + 1)).join('');
  }

  return html;
}

function bindAnalyticsTree(container) {
  container.querySelectorAll('.analytics-file').forEach((item) => {
    item.addEventListener('click', async () => {
      container.querySelectorAll('.analytics-file').forEach((i) => i.classList.remove('selected'));
      item.classList.add('selected');
      selectedFilePath = item.dataset.path;
      await loadFileAnalytics(container, selectedFilePath);
    });
  });
}

async function loadFileAnalytics(container, path) {
  const panel = container.querySelector('#file-analytics-panel');
  panel.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await api.getFileAnalytics(path);

    panel.innerHTML = `
      <div class="card-header">
        <span class="card-title">${escapeHtml(data.name)}</span>
        <span class="badge badge-info">${escapeHtml(data.extension || 'file')}</span>
      </div>
      <div class="metric-grid" style="margin-bottom:16px">
        ${metric('Total Lines', data.totalLines)}
        ${metric('Code Lines', data.codeLines)}
        ${metric('Blank Lines', data.blankLines)}
        ${metric('Comments', data.commentLines)}
        ${metric('Functions', data.functionsCount)}
        ${metric('Classes', data.classesCount)}
      </div>
      <div class="info-grid">
        ${info('File Size', data.sizeFormatted)}
        ${info('Last Modified', formatDate(data.lastModified))}
        ${info('Type', data.fileType)}
        ${info('Path', data.path, true)}
      </div>`;
  } catch (err) {
    panel.innerHTML = `<p class="text-danger">${escapeHtml(err.message)}</p>`;
  }
}

function info(label, value, mono = false) {
  return `
    <div class="info-item">
      <div class="info-label">${label}</div>
      <div class="info-value ${mono ? 'mono' : ''}">${escapeHtml(String(value))}</div>
    </div>`;
}
