import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { listAuditLogs } from "../controllers/auditController";

const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/", listAuditLogs);

export default router;
