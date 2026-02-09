import { api } from './client';

export const userApi = {
    getProfile: () => api.get('/users/me'),
};
