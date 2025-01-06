const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./dbConnection');
const dishRoutes = require('../routes/dishRoutes');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.NODE_ENV === 'test' ? '*' : false,
        methods: ['GET', 'POST']
    }
});

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use('/api/dishes', dishRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔌 New client connected, ID:', socket.id);

    socket.on('dishSelected', (data) => {
        console.log('🍽️ Dish selected event received:', data);
        socket.broadcast.emit('dishUpdate', {
            type: 'selected',
            dish: data.dish,
            userId: data.userId
        });
        console.log('Broadcasted dish update to other clients');
    });

    socket.on('dishRemoved', (data) => {
        console.log('Dish removed event received:', data);
        socket.broadcast.emit('dishUpdate', {
            type: 'removed',
            dish: data.dish,
            userId: data.userId
        });
    });

    socket.on('disconnect', () => {
        console.log('X Client disconnected:', socket.id);
    });
});

// Export for testing
const startServer = async () => {
    try {
        await connectToDatabase();
        console.log('Database connected successfully');
        return new Promise((resolve) => {
            const serverInstance = server.listen(port, () => {
                console.log(`Server running on port ${port}`);
                resolve(serverInstance);
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        throw error;
    }
};

// Only start the server if this file is being run directly
if (require.main === module) {
    startServer().catch(console.error);
}

module.exports = { app, server, io, startServer };