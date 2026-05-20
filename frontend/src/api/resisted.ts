import client from './client';
export const resistedApi = {
  create: (data: { description: string; estimated_amount: number; category?: string; reason?: string }) =>
    client.post('/resisted', data).then(r => r.data),
  list: (limit = 20, offset = 0) => client.get(`/resisted?limit=${limit}&offset=${offset}`).then(r => r.data),
};
