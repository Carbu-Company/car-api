const express = require('express');
const carRoutes = require('./routes/carRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use('/api', carRoutes);
app.use(errorHandler);

module.exports = app;
