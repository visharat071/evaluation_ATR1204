import { api } from './client';

export const auctionApi = {
    getAuctions: () => api.get('/auctions'),
    getAuction: (id: string) => api.get(`/auctions/${id}`),
    createAuction: (data: any) => api.post('/auctions', data),
    placeBid: (id: string, amount: number) => api.post(`/auctions/${id}/bid`, { amount }),
};
