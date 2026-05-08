import { app, BrowserWindow, nativeTheme, screen } from 'electron';
import * as path from 'node:path';
import { registerIpcHandlers } from './ipc-handlers';
import { createTray, refreshMenu } from './tray';
import { settingsStore, windowStore } from './store';

let mainWindow: BrowserWindow | null = null;

const getWindow = () => mainWindow;

const isDev = !!process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  const settings = settingsStore.get();
  const bounds = windowStore.getBounds();

  // Constrain to display work area in case the saved position is off-screen
  if (bounds.x !== undefined && bounds.y !== undefined) {
    const display = screen.getDisplayMatching({
      x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
    });
    const wa = display.workArea;
    if (
      bounds.x < wa.x - 50 || bounds.y < wa.y - 50 ||
      bounds.x > wa.x + wa.width - 100 ||
      bounds.y > wa.y + wa.height - 100
    ) {
      bounds.x = undefined;
      bounds.y = undefined;
    }
  }

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 380,
    minHeight: 520,
    maxWidth: 640,
    maxHeight: 960,
    frame: false,
    transparent: false,
    resizable: true,
    skipTaskbar: false,
    show: !settings.startMinimized,
    backgroundColor: '#0F0F14',
    title: 'Claude Monitor',
    webPreferences: {
      preload: path.join(__dirname, '..', 'main', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.setAlwaysOnTop(settings.alwaysOnTop);
  mainWindow.setOpacity(settings.opacity);

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL!);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist-renderer', 'index.html'));
  }

  const persistBounds = () => {
    if (!mainWindow) return;
    const b = mainWindow.getBounds();
    windowStore.setBounds({ x: b.x, y: b.y, width: b.width, height: b.height });
  };
  mainWindow.on('move', persistBounds);
  mainWindow.on('resize', persistBounds);
  mainWindow.on('show', () => refreshMenu(getWindow));
  mainWindow.on('hide', () => refreshMenu(getWindow));
  mainWindow.on('closed', () => { mainWindow = null; });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    nativeTheme.themeSource = 'dark';
    registerIpcHandlers(getWindow);
    createWindow();
    createTray(getWindow);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
}
