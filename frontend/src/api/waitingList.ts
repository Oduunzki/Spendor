import client from './client';
export const waitingListApi = {
  create: (data: { description: string; estimated_amount?: number; category?: string; reason_wanted?: string }) =>
    client.post('/waiting-list', data).then(r => r.data),
  list: () => client.get('/waiting-list').then(r => r.data),
  updateOutcome: (id: string, outcome: 'bought' | 'skipped' | 'still_waiting') =>
    client.patch(`/waiting-list/${id}/outcome`, { outcome }).then(r => r.data),
  delete: (id: string) => client.delete(`/waiting-list/${id}`).then(r => r.data),
};
