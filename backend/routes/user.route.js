import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followUnfollowUser, getSuggestedUsers, getUserProfile, updateUser, getFollowers , getFollowing, removeFollower, } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.get("/:id/followers", protectRoute,  getFollowers);
router.get("/:id/following", protectRoute, getFollowing);
router.post("/:userId/remove-follower", removeFollower);
router.post("/update", protectRoute, updateUser);

export default router;
