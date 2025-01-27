const express = require('express');
const cors = require('cors'); // CORS 미들웨어 추가
const carRoutes = require('./routes/routes');
const errorHandler = require('./middlewares/errorHandler');
const { swaggerSpec, basicAuth } = require('./swagger');

const app = express();

// CORS 설정 (모든 요청 허용)
app.use(cors());

// JSON 요청 파싱
app.use(express.json());

// Swagger 설정
app.use(
        '/look/api-docs',
        basicAuth,
        require('swagger-ui-express').serve,
        require('swagger-ui-express').setup(swaggerSpec)
);

// API 라우트 설정
app.use('/api', carRoutes);

// 에러 핸들러 미들웨어
app.use(errorHandler);

module.exports = app;
