import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import * as bookController from "../controllers/book.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("", bookController.addBook);

router.get("", bookController.getBooks);

router.put("/:id", bookController.updateBook);

router.delete("/:id", bookController.deleteBook);

router.get("/all-offered", bookController.getAllOfferedBooks);

export default router;
