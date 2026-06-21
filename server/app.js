const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config');

const systemRoutes = require('./routes/systemRoutes');
const envRoutes = require('./routes/envRoutes');
const fileRoutes = require('./routes/fileRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const healthRoutes = require('./routes/healthRoutes');
const reportRoutes = require('./routes/reportRoutes');
const logsRoutes = require('./routes/logsRoutes');
const bootstrap = require('./bootstrap');

const app = express();

let bootstrapPromise = null;

function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrap();
  }
  return bootstrapPromise;
}

app.use(async (req, res, next) => {
  try {
    await ensureBootstrap();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(config.rootDir, 'public')));

app.use('/api/system', systemRoutes);
app.use('/api/env', envRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logs', logsRoutes);

app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'System Inspector API is running',
      version: '1.0.0',
      environment: config.nodeEnv,
      workspacePath: config.workspacePath,
    },
  });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  res.sendFile(path.join(config.rootDir, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  if (config.nodeEnv === 'development') {
    console.error(`[Error] ${req.method} ${req.path}:`, message);
  }

  res.status(status).json({
    success: false,
    error: message,
  });
});

module.exports = app;
