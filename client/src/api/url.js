import api from './axios';

export const urlAPI = {
  shorten:      (data)         => api.post('/api/url/shorten', data),
  getAll:       (params = {})  => api.get('/api/url/all', { params }),
  getAnalytics: (id)           => api.get(`/api/url/analytics/${id}`),
  deleteUrl:    (id)           => api.delete(`/api/url/${id}`),
};
