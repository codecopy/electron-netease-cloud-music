import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const pkgJSON = require('../../package.json');
export const appName = process.env.NODE_ENV === 'development' ? 'Electron' : pkgJSON.name;
const configName = 'settings.json';
const configDir = path.join(app.getPath('appData'), appName);
const configPath = path.join(configDir, configName);
export const appVer = pkgJSON.version;

export const defaultSettings = {
    bitRate: 'l',
    windowBorder: true,
    autoPlay: false,
    themePrimaryColor: '#7e57c2',
    themeSecondaryColor: '#ff4081',
    themeVariety: 'light'
};

function writeFile(target) {
    fs.writeFileSync(configPath, JSON.stringify(target, null, 4), 'utf8');
}

export function getCurrent() {
    let settings = defaultSettings;
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
        writeFile(defaultSettings);
    } else if (!fs.existsSync(configPath)) {
        writeFile(defaultSettings);
    } else {
        try {
            settings = {
                ...defaultSettings,
                ...JSON.parse(fs.readFileSync(configPath).toString())
            };
            Reflect.ownKeys(settings).forEach(k => {
                if (!Reflect.has(defaultSettings, k)) {
                    delete settings[k];
                }
            });
            writeFile(settings);
        } catch (err) {
            writeFile(defaultSettings);
        }
    }
    return settings;
}

export function set(target) {
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir);
        writeFile(target);
    } else {
        writeFile(target);
    }
    return target;
}
