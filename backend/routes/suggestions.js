import express from "express"; 
import { getsuggestions } from "../controllers/suggestionsController.js";
import { protectRoute } from "../middleware/protectRoute.js";
const router = express.Router();


//avoir les suggetions 
router.get("/",protectRoute,getsuggestions) ; 
export default router;