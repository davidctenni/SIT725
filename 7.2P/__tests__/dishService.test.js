const dishService = require('../services/dishService');
const { getCollection } = require('../server/dbConnection');

jest.mock('../server/dbConnection');

describe('DishService', () => {
    let mockCollection;
    
    beforeEach(() => {
        mockCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([
                { name: 'Test Dish 1' },
                { name: 'Test Dish 2' }
            ]),
            insertOne: jest.fn().mockResolvedValue({ 
                acknowledged: true,
                insertedId: '123'
            })
        };
        
        getCollection.mockReturnValue(mockCollection);
    });

    test('getAllDishes returns all dishes', async () => {
        const dishes = await dishService.getAllDishes();
        
        expect(Array.isArray(dishes)).toBeTruthy();
        expect(dishes.length).toBe(2);
        expect(mockCollection.find).toHaveBeenCalled();
    });

    test('getAllDishes handles database errors', async () => {
        mockCollection.find.mockImplementation(() => {
            throw new Error('Database connection failed');
        });
        
        await expect(dishService.getAllDishes()).rejects.toThrow('Database connection failed');
    });

    test('addDish adds a new dish', async () => {
        const newDish = { name: 'New Dish', description: 'Test dish' };
        
        const result = await dishService.addDish(newDish);
        
        expect(result.acknowledged).toBeTruthy();
        expect(mockCollection.insertOne).toHaveBeenCalledWith(newDish);
    });

    test('addDish validates required fields', async () => {
        mockCollection.insertOne.mockRejectedValue(new Error('Validation failed'));
        const invalidDish = { description: 'Test dish' }; // Missing required name
        
        await expect(dishService.addDish(invalidDish)).rejects.toThrow();
    });
});