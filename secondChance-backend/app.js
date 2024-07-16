/*jshint esversion: 8 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pinoLogger = require('./logger');
const path = require('path');
const connectToDatabase = require('./models/db');
const { loadData } = require('./util/import-mongo/index');

const app = express();
const port = 3060;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB; we just do this one time
connectToDatabase()
    .then(() => {
        pinoLogger.info('Connected to DB');
    })
    .catch((e) => {
        pinoLogger.error('Failed to connect to DB', e);
    });

// Route files
const secondChanceRoutes = require('./routes/secondChanceItemsRoutes');
const searchRoutes = require('./routes/searchRoutes');
const pinoHttp = require('pino-http');
const logger = require('./logger');

// Logger middleware
app.use(pinoHttp({ logger }));
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/api/secondchance/items', secondChanceRoutes);
app.use('/api/secondchance/search', searchRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    pinoLogger.error(err);
    res.status(500).send('Internal Server Error');
});

// Root route
app.get('/', (req, res) => {
    res.send('Inside the server');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
