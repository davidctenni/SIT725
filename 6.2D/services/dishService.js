const { getCollection } = require('../server/dbConnection');

class DishService {
    async getAllDishes() {
        const collection = getCollection();
        return await collection.find({}).toArray();
    }

    async addDish(dish) {
        const collection = getCollection();
        return await collection.insertOne(dish);
    }
}

module.exports = new DishService();