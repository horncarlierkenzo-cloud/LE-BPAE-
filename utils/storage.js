const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const INFRACTIONS_FILE = path.join(DATA_DIR, 'infractions.json');

function ensureFile(filePath, defaultValue) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
}

function readJson(filePath, defaultValue) {
  ensureFile(filePath, defaultValue);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getGuildConfig(guildId) {
  const all = readJson(CONFIG_FILE, {});
  return all[guildId] || { bpaeActive: false };
}

function setGuildConfig(guildId, updates) {
  const all = readJson(CONFIG_FILE, {});
  all[guildId] = { ...(all[guildId] || {}), ...updates };
  writeJson(CONFIG_FILE, all);
  return all[guildId];
}

function getMemberFile(userId) {
  const all = readJson(INFRACTIONS_FILE, {});
  return all[userId] || { warnings: [], bans: [], kicks: [] };
}

function addInfraction(userId, type, entry) {
  const all = readJson(INFRACTIONS_FILE, {});
  if (!all[userId]) all[userId] = { warnings: [], bans: [], kicks: [] };
  if (!all[userId][type]) all[userId][type] = [];
  all[userId][type].push({ ...entry, date: new Date().toISOString() });
  writeJson(INFRACTIONS_FILE, all);
}

module.exports = {
  getGuildConfig,
  setGuildConfig,
  getMemberFile,
  addInfraction,
};
