import { api } from '../api.js';
import { renderLoading, renderError, escapeHtml, formatDate, debounce, renderEmpty } from '../utils.js';
import { promptModal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { getSettings } from './settings.js';

let currentPath = '';
let selectedFile = null;
let fileContent = '';

export async function renderFilesPage(container) {
  renderLoading(container);

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">File Manager</h1>
      <p class="page-subtitle">Create, read, update, and delete files in the workspace</p>
    </div>

    <div class="file-manager">
      <div class="file-tree-panel">
        <div class="panel-toolbar">
          <button class="btn btn-sm btn-secondary" id="btn-new-file">+ File</button>
          <button class="btn btn-sm btn-secondary" id="btn-new-folder">+ Folder</button>
          <button class="btn btn-sm btn-secondary" id="btn-refresh">↻</button>
        </div>
        <div class="file-tree" id="file-tree"></div>
      </div>

      <div class="file-content-panel">
        <div class="panel-toolbar">
          <input type="text" class="form-input" id="file-search" placeholder="Search files..." style="flex:1;max-width:240px">
          <button class="btn btn-sm btn-primary" id="btn-save" disabled>Save</button>
          <button class="btn btn-sm btn-secondary" id="btn-rename" disabled>Rename</button>
          <button class="btn btn-sm btn-danger" id="btn-delete" disabled>Delete</button>
        </div>
        <div class="breadcrumb" id="breadcrumb"></div>
        <div class="file-list" id="file-list"></div>
        <div class="file-editor hidden" id="file-editor">
          <div class="file-editor-header">
            <span id="editor-filename" class="mono text-accent"></span>
            <span class="text-muted" id="editor-meta"></span>
          </div>
          <textarea id="editor-content" spellcheck="false"></textarea>
        </div>
      </div>
    </div>`;

  bindFileEvents(container);
  await refreshAll(container);
}

async function refreshAll(container) {
  await Promise.all([
    loadTree(container),
    loadDirectory(container, currentPath),
  ]);
}

async function loadTree(container) {
  const treeEl = container.querySelector('#file-tree');
  treeEl.innerHTML = '<div class="skeleton skeleton-card" style="height:120px"></div>';
  try {
    const showHidden = getSettings().showHiddenFiles === true;
    const tree = await api.getFileTree(showHidden);
    treeEl.innerHTML = renderTreeNode(tree);
    bindTreeClicks(container, treeEl);
  } catch (err) {
    treeEl.innerHTML = `<p class="text-danger">${escapeHtml(err.message)}</p>`;
  }
}

function renderTreeNode(node, depth = 0) {
  if (!node) return '';
  const isDir = node.type === 'directory';
  const icon = isDir ? '📁' : getFileIcon(node.name);

  let html = `<div class="tree-node">
    <div class="tree-item" data-path="${escapeHtml(node.path)}" data-type="${node.type}">
      <span class="tree-icon">${icon}</span>
      <span>${escapeHtml(node.name || 'workspace')}</span>
    </div>`;

  if (node.children?.length) {
    html += `<div class="tree-children">${node.children.map((c) => renderTreeNode(c, depth + 1)).join('')}</div>`;
  }

  html += '</div>';
  return html;
}

function getFileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const icons = { js: '📜', html: '🌐', css: '🎨', json: '📋', md: '📝' };
  return icons[ext] || '📄';
}

function bindTreeClicks(container, treeEl) {
  treeEl.querySelectorAll('.tree-item').forEach((item) => {
    item.addEventListener('click', () => {
      const path = item.dataset.path;
      const type = item.dataset.type;

      treeEl.querySelectorAll('.tree-item').forEach((i) => i.classList.remove('selected'));
      item.classList.add('selected');

      if (type === 'directory') {
        currentPath = path;
        loadDirectory(container, path);
      } else {
        openFile(container, path);
      }
    });
  });
}

async function loadDirectory(container, path) {
  currentPath = path;
  const listEl = container.querySelector('#file-list');
  const breadcrumb = container.querySelector('#breadcrumb');

  breadcrumb.innerHTML = renderBreadcrumb(path);

  breadcrumb.querySelectorAll('.breadcrumb-segment').forEach((seg) => {
    seg.addEventListener('click', () => {
      loadDirectory(container, seg.dataset.path);
    });
  });

  try {
    const showHidden = getSettings().showHiddenFiles === true;
    const data = await api.listFiles(path, showHidden);
    listEl.innerHTML = data.items.length
      ? data.items
          .map(
            (item) => `
        <div class="file-row ${selectedFile === item.path ? 'selected' : ''}" data-path="${escapeHtml(item.path)}" data-type="${item.type}">
          <span>${item.type === 'directory' ? '📁' : getFileIcon(item.name)} ${escapeHtml(item.name)}</span>
          <span>${item.type === 'file' ? item.sizeFormatted : '—'}</span>
          <span class="text-muted">${item.modifiedFormatted}</span>
          <span class="badge badge-muted">${item.type}</span>
        </div>`
          )
          .join('')
      : renderEmpty('No files found', 'Create a file or folder to get started');

    listEl.querySelectorAll('.file-row').forEach((row) => {
      row.addEventListener('click', () => {
        const p = row.dataset.path;
        if (row.dataset.type === 'directory') {
          loadDirectory(container, p);
        } else {
          openFile(container, p);
        }
      });

      row.addEventListener('dblclick', () => {
        if (row.dataset.type === 'directory') loadDirectory(container, row.dataset.path);
      });
    });
  } catch (err) {
    listEl.innerHTML = `<p class="text-danger">${escapeHtml(err.message)}</p>`;
  }
}

function renderBreadcrumb(path) {
  const parts = path ? path.split('/') : [];
  let html = `<span class="breadcrumb-segment" data-path="">workspace</span>`;
  let accumulated = '';

  parts.forEach((part) => {
    accumulated = accumulated ? `${accumulated}/${part}` : part;
    html += ` <span class="text-muted">/</span> <span class="breadcrumb-segment" data-path="${escapeHtml(accumulated)}">${escapeHtml(part)}</span>`;
  });

  return html;
}

async function openFile(container, path) {
  selectedFile = path;
  const editor = container.querySelector('#file-editor');
  const listEl = container.querySelector('#file-list');
  const textarea = container.querySelector('#editor-content');

  listEl.classList.add('hidden');
  editor.classList.remove('hidden');

  try {
    const data = await api.readFile(path);
    fileContent = data.content;
    textarea.value = data.content;
    container.querySelector('#editor-filename').textContent = data.name;
    container.querySelector('#editor-meta').textContent = `${data.sizeFormatted} · Modified ${formatDate(data.modified)}`;
    setEditorButtons(container, true);
  } catch (err) {
    toast.error(err.message);
    closeEditor(container);
  }

  textarea.oninput = () => {
    container.querySelector('#btn-save').disabled = textarea.value === fileContent;
  };
}

function closeEditor(container) {
  selectedFile = null;
  container.querySelector('#file-editor').classList.add('hidden');
  container.querySelector('#file-list').classList.remove('hidden');
  setEditorButtons(container, false);
}

function setEditorButtons(container, enabled) {
  container.querySelector('#btn-save').disabled = !enabled;
  container.querySelector('#btn-rename').disabled = !enabled;
  container.querySelector('#btn-delete').disabled = !enabled;
}

function bindFileEvents(container) {
  container.querySelector('#btn-refresh').addEventListener('click', () => refreshAll(container));

  container.querySelector('#btn-new-file').addEventListener('click', () => {
    promptModal({
      title: 'Create New File',
      fields: [
        { id: 'path', label: 'File path (relative to workspace)', placeholder: 'src/app.js' },
        { id: 'content', label: 'Initial content', type: 'textarea', value: '' },
      ],
      onSubmit: async (values, close) => {
        try {
          const fullPath = currentPath ? `${currentPath}/${values.path}` : values.path;
          await api.createFile(fullPath, values.content);
          toast.success('File created');
          close();
          await refreshAll(container);
        } catch (err) {
          toast.error(err.message);
        }
      },
    });
  });

  container.querySelector('#btn-new-folder').addEventListener('click', () => {
    promptModal({
      title: 'Create New Folder',
      fields: [{ id: 'path', label: 'Folder path', placeholder: 'src/components' }],
      onSubmit: async (values, close) => {
        try {
          const fullPath = currentPath ? `${currentPath}/${values.path}` : values.path;
          await api.createFolder(fullPath);
          toast.success('Folder created');
          close();
          await refreshAll(container);
        } catch (err) {
          toast.error(err.message);
        }
      },
    });
  });

  container.querySelector('#btn-save').addEventListener('click', async () => {
    if (!selectedFile) return;
    try {
      const content = container.querySelector('#editor-content').value;
      await api.updateFile(selectedFile, content);
      fileContent = content;
      container.querySelector('#btn-save').disabled = true;
      toast.success('File saved');
    } catch (err) {
      toast.error(err.message);
    }
  });

  container.querySelector('#btn-rename').addEventListener('click', () => {
    if (!selectedFile) return;
    const currentName = selectedFile.split('/').pop();
    promptModal({
      title: 'Rename Item',
      fields: [{ id: 'newName', label: 'New name', value: currentName }],
      onSubmit: async (values, close) => {
        try {
          await api.renameFile(selectedFile, values.newName);
          toast.success('Renamed successfully');
          close();
          closeEditor(container);
          await refreshAll(container);
        } catch (err) {
          toast.error(err.message);
        }
      },
    });
  });

  container.querySelector('#btn-delete').addEventListener('click', async () => {
    if (!selectedFile) return;
    if (!confirm(`Delete "${selectedFile}"?`)) return;
    try {
      await api.deleteFile(selectedFile);
      toast.success('File deleted');
      closeEditor(container);
      await refreshAll(container);
    } catch (err) {
      toast.error(err.message);
    }
  });

  container.querySelector('#file-search').addEventListener(
    'input',
    debounce(async (e) => {
      const q = e.target.value.trim();
      if (!q) {
        loadDirectory(container, currentPath);
        return;
      }
      try {
        const results = await api.searchFiles(q);
        const listEl = container.querySelector('#file-list');
        listEl.innerHTML = results.length
          ? results
              .map(
                (r) => `
          <div class="file-row" data-path="${escapeHtml(r.path)}" data-type="${r.type}">
            <span>${r.type === 'directory' ? '📁' : getFileIcon(r.name)} ${escapeHtml(r.name)}</span>
            <span class="mono text-muted" colspan="3">${escapeHtml(r.path)}</span>
          </div>`
              )
              .join('')
          : '<p class="text-muted" style="padding:16px">No results</p>';

        listEl.querySelectorAll('.file-row').forEach((row) => {
          row.addEventListener('click', () => {
            if (row.dataset.type === 'directory') loadDirectory(container, row.dataset.path);
            else openFile(container, row.dataset.path);
          });
        });
      } catch (err) {
        toast.error(err.message);
      }
    }, 300)
  );
}

export function searchFiles(query) {
  const input = document.getElementById('file-search');
  if (input) {
    input.value = query;
    input.dispatchEvent(new Event('input'));
  }
}
