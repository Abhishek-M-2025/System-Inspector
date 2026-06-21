const config = require('../config/config');

const TRACKED_KEYS = ['PATH', 'HOME', 'TEMP', 'USERNAME', 'NODE_ENV', 'PORT'];

function isSensitiveKey(key) {
  return config.sensitiveEnvPatterns.some((pattern) => pattern.test(key));
}

function maskValue(key, value) {
  if (!value) return value;
  if (isSensitiveKey(key)) {
    const visible = Math.min(3, value.length);
    return value.slice(0, visible) + '•'.repeat(Math.min(12, value.length - visible));
  }
  return value;
}

function getEnvironmentVariables(options = {}) {
  const { mask = true, search = '', filter = 'all' } = options;
  const env = process.env;
  const result = [];

  const keys = new Set([...TRACKED_KEYS, ...Object.keys(env)]);

  for (const key of keys) {
    const rawValue = env[key];
    if (rawValue === undefined) continue;

    const sensitive = isSensitiveKey(key);
    const value = mask && sensitive ? maskValue(key, rawValue) : rawValue;

    const entry = {
      key,
      value,
      rawValue: mask && sensitive ? undefined : rawValue,
      sensitive,
      tracked: TRACKED_KEYS.includes(key),
    };

    if (search && !key.toLowerCase().includes(search.toLowerCase()) &&
        !value.toLowerCase().includes(search.toLowerCase())) {
      continue;
    }

    if (filter === 'tracked' && !entry.tracked) continue;
    if (filter === 'sensitive' && !entry.sensitive) continue;
    if (filter === 'other' && (entry.tracked || entry.sensitive)) continue;

    result.push(entry);
  }

  result.sort((a, b) => {
    if (a.tracked !== b.tracked) return a.tracked ? -1 : 1;
    return a.key.localeCompare(b.key);
  });

  return {
    variables: result,
    trackedKeys: TRACKED_KEYS,
    total: result.length,
  };
}

module.exports = { getEnvironmentVariables, TRACKED_KEYS };
