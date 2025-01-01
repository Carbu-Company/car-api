const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger 설정
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

// Basic Authentication 미들웨어
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.set('WWW-Authenticate', 'Basic realm="Swagger UI"');
    return res.status(401).send('Authentication required.');
  }

  const [username, password] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  if (username === 'admin' && password === 'qwe123') {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Swagger UI"');
  return res.status(401).send('Invalid credentials.');
};

module.exports = { swaggerSpec, basicAuth };
