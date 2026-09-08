import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { getReviewQueue, getReviewItem } from "../controllers/reviewController";

const router = Router();
router.use(authenticate, authorize("REVIEWER", "PROCUREMENT_OFFICER", "ADMIN"));
router.get("/", getReviewQueue);
router.get("/:id", getReviewItem);

export default router;
