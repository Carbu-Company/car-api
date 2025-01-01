const express = require('express');
const carRoutes = require('./routes/routes');
const errorHandler = require('./middlewares/errorHandler');
const { swaggerSpec, basicAuth } = require('./swagger');

const app = express();

app.use(express.json());
app.use('/look/api-docs', basicAuth, require('swagger-ui-express').serve, require('swagger-ui-express').setup(swaggerSpec));

app.use('/api', carRoutes);
app.use(errorHandler);

module.exports = app;
