const API_BASE = '/api';

async function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    const preview = text.trim().slice(0, 80);
    throw new Error(
      preview.startsWith('The page') || preview.startsWith('<!DOCTYPE') || preview.startsWith('<html')
        ? 'API route not found. Redeploy with serverless API configuration.'
        : preview || `Request failed: ${response.status}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Server returned invalid JSON.');
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data.data;
}

async function requestStatus() {
  const response = await fetch(`${API_BASE}/status`);
  const data = await parseJsonResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return (
    data.data || {
      message: data.message,
      version: data.version,
      environment: data.environment,
      workspacePath: data.workspacePath,
    }
  );
}

export const api = {
  getStatus: () => requestStatus(),

  getDashboard: () => request('/reports/dashboard'),

  getSystemInfo: () => request('/system'),

  getEnv: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/env?${query}`);
  },

  getHealth: () => request('/health'),

  getLogs: (limit = 50) => request(`/logs?limit=${limit}`),

  clearLogs: () => request('/logs', { method: 'DELETE' }),

  listFiles: (path = '', showHidden = false) =>
    request(`/files?path=${encodeURIComponent(path)}&showHidden=${showHidden}`),

  getFileTree: (showHidden = false) =>
    request(`/files/tree?showHidden=${showHidden}`),

  searchFiles: (q) => request(`/files/search?q=${encodeURIComponent(q)}`),

  readFile: (path) => request(`/files/read/${encodeURIComponent(path)}`),

  createFile: (path, content = '') =>
    request('/files/file', { method: 'POST', body: { path, content } }),

  updateFile: (path, content) =>
    request(`/files/file/${encodeURIComponent(path)}`, { method: 'PUT', body: { content } }),

  deleteFile: (path) =>
    request(`/files/file/${encodeURIComponent(path)}`, { method: 'DELETE' }),

  renameFile: (path, newName) =>
    request(`/files/rename/${encodeURIComponent(path)}`, { method: 'PATCH', body: { newName } }),

  createFolder: (path) =>
    request('/files/folder', { method: 'POST', body: { path } }),

  deleteFolder: (path) =>
    request(`/files/folder/${encodeURIComponent(path)}`, { method: 'DELETE' }),

  getAnalytics: () => request('/analytics'),

  getProjectAnalytics: () => request('/analytics/project'),

  getFileAnalytics: (path) =>
    request(`/analytics/file/${encodeURIComponent(path)}`),

  generateReport: (type) => request(`/reports/${type}`),
};
