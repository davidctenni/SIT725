const request = require('supertest');
const express = require('express');
const dishRoutes = require('../../routes/dishRoutes');
const { getCollection } = require('../../server/dbConnection');

// Mock  database connection
jest.mock('../../server/dbConnection');

const app = express();
app.use(express.json());
app.use('/api/dishes', dishRoutes);

describe('Dish API Integration Tests', () => {
    beforeEach(() => {
        // Create  mock collection before each test
        const mockCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([
                { name: 'Test Dish 1' },
                { name: 'Test Dish 2' }
            ])
        };
        
        //  getCollection return our mock
        getCollection.mockReturnValue(mockCollection);
    });

    test('GET /api/dishes returns dishes', async () => {
        const response = await request(app)
            .get('/api/dishes')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.dishes)).toBeTruthy();
        expect(response.body.dishes.length).toBe(2);
    });
});