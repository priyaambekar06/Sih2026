import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { listReports, getReport } from "../controllers/reportController";

const router = Router();
router.use(authenticate);
router.get("/", listReports);
router.get("/:id", getReport);

export default router;
