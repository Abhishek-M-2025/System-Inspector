const app = require('./app');
const config = require('./config/config');
const fs = require('fs/promises');
const path = require('path');

async function bootstrap() {
  await fs.mkdir(config.workspacePath, { recursive: true });
  await fs.mkdir(path.dirname(config.logsPath), { recursive: true });

  try {
    await fs.access(config.logsPath);
  } catch {
    await fs.writeFile(config.logsPath, '[]', 'utf-8');
  }

  app.listen(config.port, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════╗');
    console.log('  ║       SYSTEM INSPECTOR v1.0.0        ║');
    console.log('  ╠══════════════════════════════════════╣');
    console.log(`  ║  Server:  http://localhost:${config.port}       ║`);
    console.log(`  ║  Mode:    ${config.nodeEnv.padEnd(26)}║`);
    console.log('  ╚══════════════════════════════════════╝');
    console.log('');
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
