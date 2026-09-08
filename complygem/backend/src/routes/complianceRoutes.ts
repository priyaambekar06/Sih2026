import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getComplianceReport } from "../controllers/complianceController";

const router = Router();
router.use(authenticate);
router.get("/:bidId", getComplianceReport);

export default router;
