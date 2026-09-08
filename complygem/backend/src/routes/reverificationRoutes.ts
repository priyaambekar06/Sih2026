import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { listReverificationQueue, triggerReverification, scheduleReverification } from "../controllers/reverificationController";

const router = Router();
router.use(authenticate);
router.get("/", listReverificationQueue);
router.post("/:bidderId/verify-now", authorize("PROCUREMENT_OFFICER", "ADMIN"), triggerReverification);
router.post("/:bidderId/schedule", authorize("PROCUREMENT_OFFICER", "ADMIN"), scheduleReverification);

export default router;
