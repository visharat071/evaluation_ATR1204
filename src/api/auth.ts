import { api } from './client';

export const authApi = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
    // Add other auth related endpoints here
};
