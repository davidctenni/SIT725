const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017/admin"; 
const client = new MongoClient(uri);
const dbName = "admin"; 
let dishesCollection;
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db(dbName);
        console.log('Selected database:', db.databaseName);
        
        dishesCollection = db.collection('mealcrafter');
        const count = await dishesCollection.countDocuments();
        console.log(`Number of documents in dishes collection: ${count}`);
        
        // Create any necessary indexes
        await dishesCollection.createIndex({ name: 1 });
        
        return {
            dishesCollection
        };
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

function getCollection() {
    return dishesCollection;
}

module.exports = {
    connectToDatabase,
    getCollection
};