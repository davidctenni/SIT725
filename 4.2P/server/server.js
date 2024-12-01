const express = require('express');
const path = require('path');
const { connectToDatabase, getCollection } = require('./dbConnection');

const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Serve index.html at the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database connection
connectToDatabase()
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch(console.error);

// API Routes
app.get('/api/dishes', async (req, res) => {
    try {
        const collection = getCollection();
        if (!collection) {
            console.error('No collection found');
            return res.status(500).json({ error: 'Collection not initialized' });
        }
        
        console.log('Collection name:', collection.collectionName);
        const dishes = await collection.find({}).toArray();
        //old logging
        // console.log('Found dishes:', dishes.length);
        // console.log('Sending dishes data:', JSON.stringify(dishes, null, 2));
        
        // Send the response with the dishes wrapped in an object
        res.json({ 
            status: 'success',
            dishes: dishes,
            count: dishes.length 
        });
    } catch (error) {
        console.error('Detailed error in /api/dishes:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});