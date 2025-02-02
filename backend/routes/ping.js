import express from "express";
import { pingUser } from "../controllers/pingController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/",protectRoute ,pingUser);

export default router;
