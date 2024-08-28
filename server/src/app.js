import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";
import authRouter from "./routers/auth.router.js";
import userRouter from "./routers/user.router.js";
import bookRouter from "./routers/book.router.js";
import exchangeRequestRouter from "./routers/exchangeRequest.router.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL.split(","),
    methods: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: true, limit: "32kb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/book", bookRouter);
app.use("/api/exchange", exchangeRequestRouter);

app.use(errorMiddleware);

export { app };
