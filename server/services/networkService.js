const os = require('os');

function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  const localInterfaces = [];
  let primaryIp = null;

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;

    for (const addr of addrs) {
      if (addr.internal) continue;

      const entry = {
        name,
        address: addr.address,
        family: addr.family,
        mac: addr.mac,
        netmask: addr.netmask,
      };

      localInterfaces.push(entry);

      if (!primaryIp && addr.family === 'IPv4') {
        primaryIp = addr.address;
      }
    }
  }

  const hasActiveConnection = localInterfaces.some((i) => i.family === 'IPv4');

  return {
    ipAddress: primaryIp || '127.0.0.1',
    localInterfaces,
    networkStatus: hasActiveConnection ? 'Connected' : 'Disconnected',
    interfaceCount: localInterfaces.length,
  };
}

module.exports = { getNetworkInfo };
