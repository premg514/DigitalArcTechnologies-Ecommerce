const socketIO = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        const allowedOrigins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            process.env.CLIENT_URL,
            process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') // Just in case
        ].filter(Boolean);

        io = socketIO(httpServer, {
            cors: {
                origin: allowedOrigins,
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
