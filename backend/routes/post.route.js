import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
    createPost,
    deletePost,
    getAllPosts,
    getFollowingPosts,
    getLikedPosts,
    getUserPosts,
    likeUnlikePost,
    updatePost, 
    getPostById, // Ajout de la fonction getPostById
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost); 
router.post("/like/:id", protectRoute, likeUnlikePost);
router.delete("/:id", protectRoute, deletePost);

// Route pour mettre à jour un post
router.put("/:postId", protectRoute, updatePost);
// Route pour récupérer un post par ID et ses commentaires
router.get("/:postId", protectRoute, getPostById); // Utilisation de la bonne fonction ici

export default router;
