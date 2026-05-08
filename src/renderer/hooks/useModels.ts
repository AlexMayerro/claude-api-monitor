import { useApp } from '../store/appStore';
import { callApi } from './useAnthropicApi';
import type { ModelsResponse } from '../utils/api-types';

export async function fetchModels(): Promise<void> {
  const store = useApp.getState();
  store.setApiStatus('connecting');
  const resp = await callApi<ModelsResponse>({
    method: 'GET',
    path: '/v1/models',
    query: { limit: 1000 },
  });
  if (!resp.ok || !resp.data) {
    store.setApiStatus('error', resp.error || 'Failed to load models');
    return;
  }
  const models = (resp.data.data ?? []).filter(
    (m) => !/deprecated/i.test(m.display_name ?? ''),
  );
  useApp.setState({ models, modelsLoaded: true });
  store.setApiStatus('connected');
}
