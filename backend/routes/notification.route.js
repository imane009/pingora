import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { deleteNotifications, getNotifications, deleteNotificationById,getReadNotifications,getUnreadNotifications, markAsRead, markAllAsRead} from "../controllers/notification.controller.js";

const router = express.Router();

// Route pour récupérer toutes les notifications d'un utilisateur
router.get("/", protectRoute, getNotifications);

// Route pour récupérer uniquement les notifications lues (read = true)
router.get("/read", protectRoute, getReadNotifications);

// Route pour récupérer uniquement les notifications non lues (read = false)
router.get("/unread", protectRoute, getUnreadNotifications);


// Route pour supprimer toutes les notifications d'un utilisateur
router.delete("/", protectRoute, deleteNotifications);

// Route pour supprimer une notification spécifique par son ID
router.delete("/:id", protectRoute, deleteNotificationById);

// Route pour marquer une notification comme lue
router.patch("/:id/read", protectRoute, markAsRead);

router.patch("/allread", protectRoute, markAllAsRead);


export default router;