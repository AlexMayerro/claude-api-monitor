import { api } from '../utils/bridge';
import type { AnthropicRequest, AnthropicResponse } from '../../shared/types';

export async function callApi<T>(req: AnthropicRequest): Promise<AnthropicResponse<T>> {
  return api().request<T>(req);
}
