import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./routes";
import { redis } from "../store/redisClient";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", router);

(async () => {
  await redis.connect();
  app.listen(PORT, () => {
    console.log(`OTP handler server running on http://localhost:${PORT}`);
  });
})();
