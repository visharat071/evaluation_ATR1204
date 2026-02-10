import { api } from './client';

export const auctionApi = {
    getAuctions: (page = 1, limit = 10) => api.get(`/auctions?page=${page}&limit=${limit}`),
    getAuction: (id: string) => api.get(`/auctions/${id}`),
    createAuction: (data: any) => api.post('/auctions', data),
    placeBid: (id: string, amount: number) => api.post(`/auctions/${id}/bid`, { amount }),
};
