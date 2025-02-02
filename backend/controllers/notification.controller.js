import Notification from "../models/notification.model.js";

// Récupérer les notifications d'un utilisateur
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { filter } = req.query;

    // Construire la requête de filtrage en fonction du paramètre "filter"
    let query = { to: userId };

    if (filter === "unread") {
      query.read = false; // Filtrer les notifications non lues
    } else if (filter === "read") {
      query.read = true; // Filtrer les notifications lues
    }

    // Récupérer les notifications et les trier par date (du plus récent au plus ancien)
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // Tri descendant (du plus récent au plus ancien)
      .populate({
        path: "from",
        select: "username profileImg",
      });

    // Récupérer le nombre de notifications non lues, mais seulement si le filtre est "unread"
    const unreadCount = filter === "unread"
      ? notifications.length
      : await Notification.countDocuments({ to: userId, read: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    console.log("Error in getNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Supprimer toutes les notifications d'un utilisateur
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Supprimer une notification spécifique par son ID
export const deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la notification existe
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Vérifier si la notification appartient à l'utilisateur authentifié
    if (notification.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this notification" });
    }

    // Supprimer la notification
    await Notification.findByIdAndDelete(id);

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error deleting notification:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Mettre à jour une notification spécifique pour marquer comme lue ou non lue
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// Fonction pour récupérer les notifications lues
export const getReadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ read: true }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des notifications lues." });
  }
};

export const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ read: false }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des notifications non lues." });
  }
};

// Marquer toutes les notifications comme lues
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    // Mettre à jour toutes les notifications pour cet utilisateur
    await Notification.updateMany(
      { to: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Toutes les notifications ont été marquées comme lues." });
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
};

