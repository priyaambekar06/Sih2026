import { Router } from "express";
import { login, me, forgotPassword } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/me", authenticate, me);

export default router;
