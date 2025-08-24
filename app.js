const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // cookie-parser 추가
const morgan = require("morgan"); // 로그 추가
const carRoutes = require("./routes/routes");
const errorHandler = require("./middlewares/errorHandler");
const { swaggerSpec, basicAuth } = require("./swagger");

const app = express();

// morgan을 사용하여 HTTP 요청 로깅
app.use(morgan("combined"));

// 허용할 도메인 배열
const whitelist = [
  "http://115.68.193.63:3000",
  "http://localhost:3001",
  "http://carbu.infoedu.co.kr",
  "http://localhost:3000",
  "http://carbu-fo.infoedu.co.kr",
  "http://115.68.193.125:3000",  // 현재 접근하려는 도메인 추가
  "http://carbu-api.infoedu.co.kr"  // API 서버 자체 도메인도 추가
];

// CORS 설정
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      // 허용된 도메인이거나 origin이 없는 경우 (ex. Postman 요청)
      console.log(`✅ CORS 허용됨: ${origin}`);
      callback(null, true);
    } else {
      console.error(`❌ CORS 에러: 허용되지 않은 Origin - ${origin}`);
      callback(new Error("Not Allowed Origin"));
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

// 서버 실행 로그
console.log("🚀 서버가 준비되었습니다!");

// 에러 핸들러 미들웨어
app.use(errorHandler);

module.exports = app;
