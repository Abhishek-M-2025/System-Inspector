const app = require('./app');
const config = require('./config/config');
const bootstrap = require('./bootstrap');

async function start() {
  await bootstrap();

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

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
