import express from "express";
import { sendMessage, getMessages, getReciprocalConversation } from "../controllers/chatController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Envoyer un message
router.post("/messages", protectRoute,sendMessage);

// Récupérer les messages d'une conversation
router.get("/messages/:conversationId", protectRoute,getMessages);

// Récupérer les conversations où le ping est réciproque
router.get("/reciprocal/:id", protectRoute,getReciprocalConversation);

export default router;

