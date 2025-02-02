import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
    likeUnlikeComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/:postId", protectRoute, createComment); // Créer un commentaire
router.get("/:postId", protectRoute, getCommentsByPost); // Récupérer les commentaires d'un post
router.put("/:postId/:commentId", protectRoute, updateComment); // Modifier un commentaire
router.delete("/:postId/:commentId", protectRoute, deleteComment); // Supprimer un commentaire spécifique

router.post("/like/:id", protectRoute, likeUnlikeComment); // Liker un commentaire

export default router;