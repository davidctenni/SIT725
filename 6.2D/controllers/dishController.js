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
                message: 'Error fetching dishes' 
            });
        }
    }

    async addDish(req, res) {
        try {
            // Validate required fields
            if (!req.body.name) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Name is required'
                });
            }
            
            // Attempt to add the dish
            const result = await dishService.addDish(req.body);
            
            // Return success response
            res.status(201).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            console.error('Error in addDish:', error);
            res.status(500).json({
                status: 'error',
                message: 'Error adding dish'
            });
        }
    }
}

module.exports = new DishController();