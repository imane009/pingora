import express from "express";
import { getMe, login, logout, signup, googleAuth, resetPassword, checkUserAvailability} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/google-auth", googleAuth);
router.post("/logout", logout);
router.post('/resetpassword', resetPassword);
router.post('/checkUserAvailability', checkUserAvailability);


export default router;
