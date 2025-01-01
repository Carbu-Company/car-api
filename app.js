const express = require('express');
const carRoutes = require('./routes/routes');
const errorHandler = require('./middlewares/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // 위에서 만든 Swagger 설정 파일


const app = express();


app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', carRoutes);
app.use(errorHandler);

module.exports = app;
