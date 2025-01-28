const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // cookie-parser 추가
const carRoutes = require("./routes/routes");
const errorHandler = require("./middlewares/errorHandler");
const { swaggerSpec, basicAuth } = require("./swagger");

const app = express();

// 허용할 도메인 배열
const whitelist = ["http://localhost:3000", "http://carbu.infoedu.co.kr"];

// CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      // whitelist에 포함된 경우 또는 origin이 없는 경우 (ex. Postman 요청)
      callback(null, true);
    } else {
      callback(new Error("Not Allowed Origin!"));
    }
  },
  credentials: true, // 쿠키를 포함한 요청 허용
};
app.use(cors(corsOptions));

// JSON 요청 파싱
app.use(express.json());

// 쿠키 파싱 미들웨어 추가
app.use(cookieParser());

// Swagger 설정
app.use(
        "/look/api-docs",
        basicAuth,
        require("swagger-ui-express").serve,
        require("swagger-ui-express").setup(swaggerSpec)
);

// API 라우트 설정
app.use("/api", carRoutes);

// 에러 핸들러 미들웨어
app.use(errorHandler);

module.exports = app;
