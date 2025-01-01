const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Carbu API',
      version: '1.0.0',
      description: '똑순이 API',
    },
  },
  apis: ['./swagger-docs/*.js'], // 주석 파일 경로
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
