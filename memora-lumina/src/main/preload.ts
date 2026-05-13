import { contextBridge, ipcRenderer } from 'electron';
import type { IPCApi } from '../shared/types';

const api: IPCApi = {
  sendMessage: (req) => ipcRenderer.invoke('chat:send', req),
  stopStream: (id) => ipcRenderer.invoke('chat:stop', id),
  getConversations: () => ipcRenderer.invoke('chat:getConversations'),
  getMessages: (id) => ipcRenderer.invoke('chat:getMessages', id),
  createConversation: () => ipcRenderer.invoke('chat:createConversation'),
  renameConversation: (id, title) => ipcRenderer.invoke('chat:renameConversation', id, title),
  togglePinConversation: (id) => ipcRenderer.invoke('chat:togglePinConversation', id),
  deleteConversation: (id) => ipcRenderer.invoke('chat:deleteConversation', id),

  getMemories: (filters) => ipcRenderer.invoke('memory:getAll', filters),
  searchMemories: (query, filters) => ipcRenderer.invoke('memory:search', query, filters),
  deleteMemory: (id) => ipcRenderer.invoke('memory:delete', id),
  getMemoryStats: () => ipcRenderer.invoke('memory:stats'),
  exportMemories: (format) => ipcRenderer.invoke('memory:export', format),
  importMemories: () => ipcRenderer.invoke('memory:import'),
  clearAllMemories: () => ipcRenderer.invoke('memory:clearAll'),
  injectMemoryToContext: (conversationId, memoryId) => ipcRenderer.invoke('memory:injectToContext', conversationId, memoryId),

  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),

  getProfile: () => ipcRenderer.invoke('profile:get'),
  updateProfile: (data) => ipcRenderer.invoke('profile:update', data),

  validateApiKey: (key) => ipcRenderer.invoke('auth:validateApiKey', key),

  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  openExternal: (url) => ipcRenderer.send('window:openExternal', url),

  onStreamChunk: (cb) => {
    const fn = (_: unknown, payload: any) => cb(payload);
    ipcRenderer.on('chat:streamChunk', fn);
    return () => ipcRenderer.removeListener('chat:streamChunk', fn);
  },
  onStreamEnd: (cb) => {
    const fn = (_: unknown, payload: any) => cb(payload);
    ipcRenderer.on('chat:streamEnd', fn);
    return () => ipcRenderer.removeListener('chat:streamEnd', fn);
  },
  onStreamError: (cb) => {
    const fn = (_: unknown, payload: any) => cb(payload);
    ipcRenderer.on('chat:streamError', fn);
    return () => ipcRenderer.removeListener('chat:streamError', fn);
  },
  onMemorySaved: (cb) => {
    const fn = (_: unknown, payload: any) => cb(payload);
    ipcRenderer.on('memory:saved', fn);
    return () => ipcRenderer.removeListener('memory:saved', fn);
  },
  onWindowStateChanged: (cb) => {
    const fn = (_: unknown, payload: any) => cb(payload);
    ipcRenderer.on('window:stateChanged', fn);
    return () => ipcRenderer.removeListener('window:stateChanged', fn);
  },
};

contextBridge.exposeInMainWorld('memora', api);
