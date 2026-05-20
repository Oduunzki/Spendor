import client from './client';
export const profileApi = {
  get: () => client.get('/profile').then(r => r.data),
  update: (data: { display_name: string }) => client.patch('/profile', data).then(r => r.data),
  getInsights: () => client.get('/profile/insights').then(r => r.data),
};
