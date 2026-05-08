import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { IPC } from '../shared/types';
import type { TrayAction } from '../shared/types';
import { settingsStore } from './store';

let tray: Tray | null = null;

function buildIcon() {
  const candidates = [
    path.join(process.resourcesPath ?? '', 'icon.png'),
    path.join(app.getAppPath(), 'resources', 'icon.png'),
    path.join(__dirname, '..', '..', 'resources', 'icon.png'),
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) {
      const img = nativeImage.createFromPath(p);
      if (!img.isEmpty()) return img.resize({ width: 16, height: 16 });
    }
  }
  // Fallback: empty image — Electron will still create the tray
  return nativeImage.createEmpty();
}

export function createTray(getWindow: () => BrowserWindow | null) {
  if (tray) return tray;
  tray = new Tray(buildIcon());
  tray.setToolTip('Claude Monitor');
  refreshMenu(getWindow);
  tray.on('click', () => toggleWindow(getWindow));
  return tray;
}

function emit(getWindow: () => BrowserWindow | null, action: TrayAction) {
  const win = getWindow();
  if (win) win.webContents.send(IPC.TRAY_ACTION, action);
}

function toggleWindow(getWindow: () => BrowserWindow | null) {
  const win = getWindow();
  if (!win) return;
  if (win.isVisible() && !win.isMinimized()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}

export function refreshMenu(getWindow: () => BrowserWindow | null) {
  if (!tray) return;
  const settings = settingsStore.get();
  const win = getWindow();
  const visible = win ? win.isVisible() && !win.isMinimized() : false;
  const menu = Menu.buildFromTemplate([
    {
      label: visible ? 'Hide' : 'Show',
      click: () => toggleWindow(getWindow),
    },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: settings.alwaysOnTop,
      click: (item) => {
        const w = getWindow();
        if (w) w.setAlwaysOnTop(item.checked);
        settingsStore.set({ alwaysOnTop: item.checked });
      },
    },
    { label: 'Refresh Now', click: () => emit(getWindow, 'refresh') },
    { label: 'Settings', click: () => { const w = getWindow(); w?.show(); w?.focus(); emit(getWindow, 'settings'); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.quit(); } },
  ]);
  tray.setContextMenu(menu);
}
