const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./dbConnection');
const dishRoutes = require('../routes/dishRoutes');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Mount routes
app.use('/api/dishes', dishRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

connectToDatabase()
    .then(() => {
        console.log('Database connected successfully');
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(console.error);