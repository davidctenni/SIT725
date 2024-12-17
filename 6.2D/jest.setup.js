jest.mock('./server/dbConnection', () => ({
    getCollection: jest.fn(),
    connectToDatabase: jest.fn().mockResolvedValue(true)
}));