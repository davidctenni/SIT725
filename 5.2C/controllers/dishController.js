const dishService = require('../services/dishService');

class DishController {
    async getDishes(req, res) {
        try {
            const dishes = await dishService.getAllDishes();
            res.json({ 
                status: 'success',
                dishes: dishes,
                count: dishes.length 
            });
        } catch (error) {
            console.error('Error in getDishes:', error);
            res.status(500).json({ 
                status: 'error',
                error: 'Internal server error', 
                details: error.message 
            });
        }
    }
}

module.exports = new DishController();