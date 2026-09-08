import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { listTenders, getTender, createTender, updateTender, deleteTender } from "../controllers/tenderController";

const router = Router();
router.use(authenticate);

router.get("/", listTenders);
router.get("/:id", getTender);
router.post("/", authorize("PROCUREMENT_OFFICER", "ADMIN"), createTender);
router.put("/:id", authorize("PROCUREMENT_OFFICER", "ADMIN"), updateTender);
router.delete("/:id", authorize("ADMIN"), deleteTender);

export default router;
