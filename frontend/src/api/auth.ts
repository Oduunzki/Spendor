import client from './client';

export const authApi = {
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }).then(r => r.data),
  register: (email: string, password: string, display_name?: string) =>
    client.post('/auth/register', { email, password, display_name }).then(r => r.data),
  getMe: () => client.get('/auth/me').then(r => r.data),
};
