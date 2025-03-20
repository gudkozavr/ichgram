import resetPasswordController from "../controllers/resetPasswordController";
import { Router } from "express";
const router: Router = Router();

router.post(
  "/request-password-reset",
  resetPasswordController.requestPasswordReset
);
router.post("/reset-password", resetPasswordController.resetPassword);
export default router;
