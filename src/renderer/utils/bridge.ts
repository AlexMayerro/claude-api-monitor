import type { ClaudeMonitorApi } from '../../main/preload';

declare global {
  interface Window {
    claudeMonitor: ClaudeMonitorApi;
  }
}

export const api = (): ClaudeMonitorApi => window.claudeMonitor;
