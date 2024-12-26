const dishController = require('../controllers/dishController');
const dishService = require('../services/dishService');

jest.mock('../services/dishService');

describe('DishController', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
    });

    test('getDishes returns dishes successfully', async () => {
        const mockDishes = [
            { id: 1, name: 'Pasta' },
            { id: 2, name: 'Pizza' }
        ];
        
        dishService.getAllDishes.mockResolvedValue(mockDishes);

        await dishController.getDishes(mockRequest, mockResponse);

        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'success',
            dishes: mockDishes,
            count: mockDishes.length
        });
    });

    test('getDishes handles errors properly', async () => {
        dishService.getAllDishes.mockRejectedValue(new Error('Database error'));
        
        await dishController.getDishes(mockRequest, mockResponse);
        
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Error fetching dishes'
        });
    });

    test('getDishes handles empty dish list', async () => {
        dishService.getAllDishes.mockResolvedValue([]);
        
        await dishController.getDishes(mockRequest, mockResponse);
        
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'success',
            dishes: [],
            count: 0
        });
    });
});