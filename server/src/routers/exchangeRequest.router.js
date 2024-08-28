import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import * as exchangeRequestController from "../controllers/exchangeRequest.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("", exchangeRequestController.createRequest);

router.get("/sent", exchangeRequestController.getSentRequests);
router.get("/received", exchangeRequestController.getReceivedRequests);
router.put("/status", exchangeRequestController.updateRequestStatus);
router.post("/fulfill", exchangeRequestController.fulfillRequest);
router.get("/history", exchangeRequestController.getHistory);
export default router;
