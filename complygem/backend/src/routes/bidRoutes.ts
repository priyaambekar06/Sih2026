import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { listBids, getBid, createBid, startVerification, reverifyBid, decideBid } from "../controllers/bidController";

const router = Router();
router.use(authenticate);

router.get("/", listBids);
router.get("/:id", getBid);
router.post("/", authorize("PROCUREMENT_OFFICER", "ADMIN"), createBid);
router.post("/:id/verify", authorize("PROCUREMENT_OFFICER", "ADMIN", "REVIEWER"), startVerification);
router.post("/:id/reverify", authorize("PROCUREMENT_OFFICER", "ADMIN"), reverifyBid);
router.post("/:id/decision", authorize("PROCUREMENT_OFFICER", "ADMIN"), decideBid);

export default router;
