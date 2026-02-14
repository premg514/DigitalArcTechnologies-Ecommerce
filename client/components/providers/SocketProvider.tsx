'use client';

import { useEffect, createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export default function SocketProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Initialize socket connection
        // Use environment variable or fallback to default
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        console.log('Connecting to socket at:', socketUrl);

        const socket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        });

        socket.on('connect', () => {
            console.log('Connected to socket server:', socket.id);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        // Listen for invalidate_query events
        socket.on('invalidate_query', (queryKey: string[]) => {
            console.log('Invalidating query:', queryKey);
            // Debug only: Show toast on update
            toast.success(`Update received for: ${queryKey[0]}`);
            queryClient.invalidateQueries({ queryKey });
        });

        return () => {
            socket.disconnect();
        };
    }, [queryClient]);

    return (
        <SocketContext.Provider value={null}>
            {children}
        </SocketContext.Provider>
    );
}
