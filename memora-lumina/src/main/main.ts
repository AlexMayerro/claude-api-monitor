import { app, BrowserWindow, nativeImage, screen } from 'electron';
import path from 'path';
import fs from 'fs';
import { initDatabase, closeDatabase } from './database';
import { registerAllHandlers } from './ipc/handlers';
import { getSetting } from './ipc/settings';
import { consolidateMemories } from './memory/layers';

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const isDev = !!VITE_DEV_SERVER_URL;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;

interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
  maximized: boolean;
}

const DEFAULT_WINDOW_STATE: WindowState = { width: 1400, height: 900, maximized: false };

function windowStatePath(): string {
  return path.join(app.getPath('userData'), 'window-state.json');
}

function loadWindowState(): WindowState {
  try {
    const raw = fs.readFileSync(windowStatePath(), 'utf-8');
    const parsed = JSON.parse(raw);
    const displays = screen.getAllDisplays();
    const fits = displays.some((d) => {
      const b = d.bounds;
      return (
        parsed.x !== undefined &&
        parsed.y !== undefined &&
        parsed.x >= b.x - 50 &&
        parsed.y >= b.y - 50 &&
        parsed.x + parsed.width <= b.x + b.width + 50 &&
        parsed.y + parsed.height <= b.y + b.height + 50
      );
    });
    return fits ? { ...DEFAULT_WINDOW_STATE, ...parsed } : { ...DEFAULT_WINDOW_STATE, maximized: !!parsed.maximized };
  } catch {
    return DEFAULT_WINDOW_STATE;
  }
}

function saveWindowState(win: BrowserWindow): void {
  if (win.isDestroyed()) return;
  const bounds = win.getBounds();
  const state: WindowState = { ...bounds, maximized: win.isMaximized() };
  try {
    fs.writeFileSync(windowStatePath(), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function iconPath(): string | undefined {
  const candidates = [
    path.join(process.resourcesPath || '', 'assets', 'icon.png'),
    path.join(__dirname, '../../assets/icon.png'),
    path.join(__dirname, '../../../assets/icon.png'),
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return undefined;
}

function createWindow(): void {
  const state = loadWindowState();
  const icon = iconPath();
  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0F1117',
    show: false,
    icon: icon ? nativeImage.createFromPath(icon) : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: true,
    },
  });

  if (!getSetting('hardware_acceleration')) {
    app.disableHardwareAcceleration();
  }

  if (state.maximized) mainWindow.maximize();

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev && VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist-renderer/index.html'));
  }

  const sendMaximizeState = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send('window:stateChanged', { maximized: mainWindow.isMaximized() });
  };
  mainWindow.on('maximize', sendMaximizeState);
  mainWindow.on('unmaximize', sendMaximizeState);

  mainWindow.on('close', () => {
    if (mainWindow) saveWindowState(mainWindow);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function maybeRunConsolidation(): void {
  const mode = getSetting('auto_consolidation');
  if (mode === 'manual') return;
  try {
    consolidateMemories();
  } catch {
    /* ignore */
  }
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  initDatabase();
  registerAllHandlers(() => mainWindow);
  createWindow();
  maybeRunConsolidation();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  closeDatabase();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  closeDatabase();
});
