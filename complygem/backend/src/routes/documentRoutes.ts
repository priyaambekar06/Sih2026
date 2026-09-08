import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { upload } from "../config/upload";
import {
  listAllDocuments,
  listDocumentsForBid,
  getDocument,
  uploadDocument,
  correctField,
  reviewAction,
} from "../controllers/documentController";

const router = Router();
router.use(authenticate);

router.get("/", listAllDocuments);
router.get("/bid/:bidId", listDocumentsForBid);
router.get("/:id", getDocument);
router.post("/upload", authorize("PROCUREMENT_OFFICER", "ADMIN"), upload.single("file"), uploadDocument);
router.patch("/:id/correct-field", authorize("REVIEWER", "PROCUREMENT_OFFICER", "ADMIN"), correctField);
router.post("/:id/review-action", authorize("REVIEWER", "PROCUREMENT_OFFICER", "ADMIN"), reviewAction);

export default router;
