import Story from "../models/story.model.js";
import User from "../models/user.model.js";


/**
 * Crée une nouvelle story.
 */
export const createStory = async (req, res) => {
    const { image, video } = req.body;
    const userId = req.user.id;  // L'ID de l'utilisateur authentifié

    try {
        // Vérifier que l'utilisateur envoie soit une image, soit une vidéo, mais pas les deux
        if ((image && video) || (!image && !video)) {
            return res.status(400).json({
                message: "Veuillez fournir soit une image, soit une vidéo, mais pas les deux.",
            });
        }

        // Créer une nouvelle story avec l'image ou la vidéo
        const newStory = new Story({
            user: userId,
            image: image ? image : null,  // Si une image est présente, on l'ajoute
            video: video ? video : null,  // Si une vidéo est présente, on l'ajoute
        });

        // Sauvegarder la story dans la base de données
        await newStory.save();

        // Répondre avec la nouvelle story créée
        res.status(201).json(newStory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Supprime une story spécifiée par son ID.
 */
export const deleteStory = async (req, res) => {
    const { id } = req.params;

    try {
        const story = await Story.findById(id);

        if (!story) {
            return res.status(404).json({ message: "Story introuvable." });
        }

        // Vérifie si l'utilisateur est propriétaire de la story
        if (story.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé à supprimer cette story." });
        }

        // Supprime la story
        await Story.deleteOne({ _id: id });

        res.status(200).json({ message: "Story supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Récupère toutes les stories créées par l'utilisateur connecté.
 */
export const getUserStories = async (req, res) => {
    try {
        const stories = await Story.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Récupère toutes les stories disponibles, avec informations sur l'utilisateur (nom d'utilisateur et avatar).
 */
export const getAllStories = async (req, res) => {
    try {
        const stories = await Story.find()
            .populate("user", "username avatar")
            .sort({ createdAt: -1 });
        res.status(200).json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Ajoute un utilisateur à la liste des viewers d'une story.
 */
export const addViewer = async (req, res) => {
    const { id } = req.params;

    try {
        const story = await Story.findById(id);

        if (!story) {
            return res.status(404).json({ message: "Story introuvable." });
        }

        // Ajouter l'utilisateur aux viewers s'il n'y est pas déjà
        if (!story.viewers.some((viewer) => viewer.userId.toString() === req.user.id)) {
            story.viewers.push({ userId: req.user.id });
            await story.save();
        }

        res.status(200).json({ message: "Viewer ajouté avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Liker une story.
 */
export const likeStory = async (req, res) => {
    const { storyId } = req.params;

    try {
        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: "Story introuvable." });
        }

        // Vérifie si l'utilisateur a déjà liké cette story
        const isLiked = story.likes.some((like) => like.userId.toString() === req.user.id);

        if (isLiked) {
            return res.status(400).json({ message: "Vous avez déjà liké cette story." });
        }

        // Ajouter le like
        story.likes.push({ userId: req.user.id });
        await story.save();

        res.status(200).json({ message: "Story likée avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getFriendsStories = async (req, res) => {
    try {
      const userId = req.user._id;
  
      // Récupérer les IDs des amis (les utilisateurs suivis par l'utilisateur actuel)
      const user = await User.findById(userId).select("following");
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const friendsIds = user.following;
  
      // Récupérer les stories de ces amis
      const stories = await Story.find({ user: { $in: friendsIds } })
        .populate("user", "username profileImg")
        .sort({ createdAt: -1 }); // Trier par date décroissante
  
      res.status(200).json(stories);
    } catch (error) { 
      console.error("Error in getFriendsStories:", error.message);
      res.status(500).json({ error: error.message });
    }
    };