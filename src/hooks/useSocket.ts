import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import EncryptedStorage from 'react-native-encrypted-storage';
import { API_CONFIG } from '../api/config';

interface SocketState {
    connected: boolean;
    viewerCount: number;
}

export const useSocket = (auctionId?: string) => {
    const socketRef = useRef<Socket | null>(null);
    const [socketState, setSocketState] = useState<SocketState>({
        connected: false,
        viewerCount: 0,
    });
    const [auctionData, setAuctionData] = useState<any>(null);

    const connect = useCallback(async () => {
        try {
            const token = await EncryptedStorage.getItem('auth_token');

            if (!token) {
                console.warn('[SOCKET] No token found, cannot connect');
                return;
            }

            // The user provided the URL: https://krystal-solutional-cherish.ngrok-free.dev
            // The API Base URL is the same.
            const socket = io(API_CONFIG.BASE_URL, {
                auth: {
                    token: token,
                },
                transports: ['websocket'], // Often needed for ngrok
            });

            socketRef.current = socket;

            socket.on('connect', () => {
                console.log('[SOCKET] Connected to WebSocket server');
                setSocketState(prev => ({ ...prev, connected: true }));

                if (auctionId) {
                    console.log(`[SOCKET] Joining auction room: ${auctionId}`);
                    socket.emit('joinAuction', auctionId);
                }
            });

            socket.on('connect_error', (error) => {
                console.error('[SOCKET] Connection failed:', error.message);
                setSocketState(prev => ({ ...prev, connected: false }));
            });

            socket.on('disconnect', (reason) => {
                console.log('[SOCKET] Disconnected:', reason);
                setSocketState(prev => ({ ...prev, connected: false }));
            });

            // Generic Logger for all events
            socket.onAny((eventName, ...args) => {
                console.log(`[SOCKET HIT] Event: ${eventName}`, args);
            });

            // WebSocket Events
            socket.on('VIEWER_COUNT', (data) => {
                console.log('[SOCKET] VIEWER_COUNT received:', data);
                if (data.auctionId === auctionId) {
                    setSocketState(prev => ({ ...prev, viewerCount: data.count }));
                }
            });

            socket.on('AUCTION_STATE', (data) => {
                console.log('[SOCKET] AUCTION_STATE received:', data);
                setAuctionData(data);
            });

            socket.on('NEW_BID', (data) => {
                console.log('[SOCKET] NEW_BID received:', data);
                // We'll handle this in the component to update the history
                setAuctionData((prev: any) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        currentPrice: data.amount,
                        lastBid: data,
                        // If we have a bids array in the state, we might need to prepend there too
                    };
                });
            });

            socket.on('AUCTION_ENDING_SOON', (data) => {
                console.log('[SOCKET] AUCTION_ENDING_SOON received:', data);
            });

            socket.on('AUCTION_SOLD', (data) => {
                console.log('[SOCKET] AUCTION_SOLD received:', data);
            });

            socket.on('AUCTION_EXPIRED', (data) => {
                console.log('[SOCKET] AUCTION_EXPIRED received:', data);
            });

        } catch (error) {
            console.error('[SOCKET] Error during connection setup:', error);
        }
    }, [auctionId]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            if (auctionId) {
                console.log(`[SOCKET] Leaving auction room: ${auctionId}`);
                socketRef.current.emit('leaveAuction', auctionId);
            }
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, [auctionId]);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        connected: socketState.connected,
        viewerCount: socketState.viewerCount,
        auctionData,
        socket: socketRef.current,
    };
};
