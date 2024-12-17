const dishService = require('../services/dishService');
const { getCollection } = require('../server/dbConnection');

// Mock the database connection
jest.mock('../server/dbConnection');

describe('DishService', () => {
    let mockCollection;
    
    beforeEach(() => {
        // Create a mock collection before each test
        mockCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([
                { name: 'Test Dish 1' },
                { name: 'Test Dish 2' }
            ])
        };
        
        // Make getCollection return our mock
        getCollection.mockReturnValue(mockCollection);
    });

    test('getAllDishes returns all dishes', async () => {
        const dishes = await dishService.getAllDishes();
        
        expect(Array.isArray(dishes)).toBeTruthy();
        expect(dishes.length).toBe(2);
        expect(mockCollection.find).toHaveBeenCalled();
    });

    test('addDish adds a new dish', async () => {
        const newDish = { name: 'New Dish', description: 'Test dish' };
        mockCollection.insertOne = jest.fn().mockResolvedValue({ 
            acknowledged: true,
            insertedId: '123'
        });

        const result = await dishService.addDish(newDish);
        
        expect(result.acknowledged).toBeTruthy();
        expect(mockCollection.insertOne).toHaveBeenCalledWith(newDish);
    });
});