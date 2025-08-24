import fs from 'fs';
import path from 'path';

export interface Settings {
  dailyLimit: number;
}

const DATA_DIR = path.resolve(process.env.DATA_DIR || '/gestor/system');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const defaultSettings: Settings = { dailyLimit: 100 };

export function loadSettings(): Settings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), {
        mode: 0o600,
      });
      return defaultSettings;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}
