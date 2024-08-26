import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({limit: "32kb"}));
app.use(express.urlencoded({extended: true, limit: "32kb"}));
app.use(cookieParser());

app.use(errorMiddleware)

export {app};
