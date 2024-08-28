import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.use(verifyJWT);

router.get("", userController.getUser);

router.put("/book/:id", userController.toggleDesiredBook);
export default router;
