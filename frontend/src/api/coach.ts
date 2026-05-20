import client from './client';
export const coachApi = {
  generate: (message_type: string) => client.post('/coach/generate', { message_type }).then(r => r.data),
  list: () => client.get('/coach').then(r => r.data),
  markRead: (id: string) => client.patch(`/coach/${id}/read`).then(r => r.data),
};
