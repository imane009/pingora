import express from "express";
import { 
    createStory, 
    deleteStory, 
    getUserStories, 
    getAllStories, 
    addViewer, 
    likeStory, 
    getFriendsStories
    
} from "../controllers/story.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create", protectRoute, createStory);

router.delete("/:id", protectRoute, deleteStory);

router.get("/user", protectRoute, getUserStories);

router.get("/all", protectRoute, getAllStories);

router.patch("/:id/view", protectRoute, addViewer);

router.patch("/:storyId/like", protectRoute, likeStory);

router.get("/friends", protectRoute, getFriendsStories);


export default router;
