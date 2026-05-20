import client from './client';
export const receiptsApi = {
  scan: (formData: FormData) =>
    client.post('/receipts/scan', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }).then(r => r.data),
  confirm: (data: unknown) => client.post('/receipts', data).then(r => r.data),
  list: (limit = 20, offset = 0) => client.get(`/receipts?limit=${limit}&offset=${offset}`).then(r => r.data),
};
