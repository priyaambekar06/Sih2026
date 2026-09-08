import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import {
  listUsers, createUser, updateUser, deleteUser,
  getRuleTemplate, updateRuleTemplate, getIntegrations,
} from "../controllers/adminController";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/users", listUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/rules", getRuleTemplate);
router.put("/rules", updateRuleTemplate);

router.get("/integrations", getIntegrations);

export default router;
