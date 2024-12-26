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
test('GET /api/dishes returns 500 on database error', async () => {
    const mockCollection = {
        find: jest.fn().mockImplementation(() => {
            throw new Error('Database error');
        })
    };
    getCollection.mockReturnValue(mockCollection);

    const response = await request(app)
        .get('/api/dishes')
        .expect(500);

    expect(response.body.status).toBe('error');
});

test('POST /api/dishes creates new dish', async () => {
    const newDish = {
        name: 'New Test Dish',
        cookingTime: '25 mins',
        difficulty: 'Easy',
        image: 'http://example.com/image.jpg'
    };

    const mockCollection = {
        insertOne: jest.fn().mockResolvedValue({
            acknowledged: true,
            insertedId: '123'
        })
    };
    getCollection.mockReturnValue(mockCollection);

    const response = await request(app)
        .post('/api/dishes')
        .send(newDish)
        .expect(201);

    expect(response.body.status).toBe('success');
});

test('POST /api/dishes validates required fields', async () => {
    const invalidDish = {
        cookingTime: '25 mins' // Missing required name
    };

    const response = await request(app)
        .post('/api/dishes')
        .send(invalidDish)
        .expect(400);

    expect(response.body.status).toBe('error');
});