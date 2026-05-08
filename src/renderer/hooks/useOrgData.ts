import { useApp } from '../store/appStore';
import { callApi } from './useAnthropicApi';
import type {
  OrgInfo,
  OrgUsersResponse,
  WorkspacesResponse,
  ApiKeysResponse,
} from '../utils/api-types';

export async function fetchOrgInfo(): Promise<void> {
  const store = useApp.getState();
  store.setAdminStatus('connecting');
  const resp = await callApi<OrgInfo>({
    method: 'GET',
    path: '/v1/organizations/me',
    useAdmin: true,
  });
  if (!resp.ok || !resp.data) {
    store.setAdminStatus('error', resp.error);
    return;
  }
  useApp.setState({ org: resp.data });
  store.setAdminStatus('connected');
}

export async function fetchOrgUsers(): Promise<void> {
  const resp = await callApi<OrgUsersResponse>({
    method: 'GET',
    path: '/v1/organizations/users',
    query: { limit: 100 },
    useAdmin: true,
  });
  if (resp.ok && resp.data) {
    useApp.setState({ orgUsers: resp.data.data ?? [] });
  }
}

export async function fetchWorkspaces(): Promise<void> {
  const resp = await callApi<WorkspacesResponse>({
    method: 'GET',
    path: '/v1/organizations/workspaces',
    query: { limit: 100 },
    useAdmin: true,
  });
  if (resp.ok && resp.data) {
    useApp.setState({ workspaces: resp.data.data ?? [] });
  }
}

export async function fetchApiKeys(): Promise<void> {
  const resp = await callApi<ApiKeysResponse>({
    method: 'GET',
    path: '/v1/organizations/api_keys',
    query: { limit: 100, status: 'active' },
    useAdmin: true,
  });
  if (resp.ok && resp.data) {
    useApp.setState({ apiKeys: resp.data.data ?? [] });
  }
}
