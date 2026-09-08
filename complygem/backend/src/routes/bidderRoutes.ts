import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { listBidders, getBidder } from "../controllers/bidderController";

const router = Router();
router.use(authenticate);
router.get("/", listBidders);
router.get("/:id", getBidder);

export default router;
