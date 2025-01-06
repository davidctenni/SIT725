const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');

describe('Socket Testing', () => {
    let io, serverSocket, clientSocket, httpServer;
    
    beforeAll((done) => {
        // Create HTTP server
        httpServer = createServer();
        // Create Socket.IO server
        io = new Server(httpServer);
        
        // Start server and wait for it to be ready
        httpServer.listen(() => {
            const port = httpServer.address().port;
            
            // Setup server-side socket handler
            io.on('connection', (socket) => {
                serverSocket = socket;
                
                // Add server-side event handlers
                socket.on('dishSelected', (data) => {
                    socket.broadcast.emit('dishUpdate', {
                        type: 'selected',
                        dish: data.dish,
                        userId: data.userId
                    });
                });

                socket.on('dishRemoved', (data) => {
                    socket.broadcast.emit('dishUpdate', {
                        type: 'removed',
                        dish: data.dish,
                        userId: data.userId
                    });
                });
            });
            
            // Create client socket
            clientSocket = Client(`http://localhost:${port}`, {
                transports: ['websocket'],
                forceNew: true
            });
            
            clientSocket.on('connect', done);
        });
    }, 10000); // Increased timeout for setup

    // Cleanup after all tests
    afterAll((done) => {
        if (clientSocket.connected) {
            clientSocket.disconnect();
        }
        if (httpServer.listening) {
            httpServer.close(() => {
                io.close();
                done();
            });
        }
    });

    test('should emit and receive dishUpdate event when dish is selected', (done) => {
        const testDish = {
            name: 'Test Dish',
            cookingTime: '30 mins',
            difficulty: 'Medium'
        };

        // Create a second client to receive the broadcast
        const clientSocket2 = Client(`http://localhost:${httpServer.address().port}`, {
            transports: ['websocket'],
            forceNew: true
        });

        clientSocket2.on('connect', () => {
            // Setup listener for dishUpdate
            clientSocket2.on('dishUpdate', (data) => {
                try {
                    expect(data.type).toBe('selected');
                    expect(data.dish).toEqual(testDish);
                    clientSocket2.disconnect();
                    done();
                } catch (error) {
                    done(error);
                }
            });

            // Emit the selection event from first client
            clientSocket.emit('dishSelected', {
                dish: testDish,
                userId: 'test-user-id'
            });
        });
    }, 10000); // Increased timeout for test

    test('should emit and receive dishUpdate event when dish is removed', (done) => {
        const testDish = {
            name: 'Test Dish',
            cookingTime: '30 mins',
            difficulty: 'Medium'
        };

        // Create a second client to receive the broadcast
        const clientSocket2 = Client(`http://localhost:${httpServer.address().port}`, {
            transports: ['websocket'],
            forceNew: true
        });

        clientSocket2.on('connect', () => {
            // Setup listener for dishUpdate
            clientSocket2.on('dishUpdate', (data) => {
                try {
                    expect(data.type).toBe('removed');
                    expect(data.dish).toEqual(testDish);
                    clientSocket2.disconnect();
                    done();
                } catch (error) {
                    done(error);
                }
            });

            // Emit the removal event from first client
            clientSocket.emit('dishRemoved', {
                dish: testDish,
                userId: 'test-user-id'
            });
        });
    }, 10000); // Increased timeout for test
});