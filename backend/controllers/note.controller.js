import Note from "../models/Note.model.js";  // Modèle Mongoose pour les notes
import User from "../models/user.model.js";  // Modèle Mongoose pour les utilisateurs

// Fonction pour créer une nouvelle note
export const createNote = async (req, res) => {
    try {
        // Récupère le contenu de la note et les paramètres de confidentialité depuis la requête
        const { content, privacy } = req.body;  
        
        // Récupère l'ID de l'utilisateur authentifié (extrait du token)
        const userId = req.user._id.toString();

        // Vérifie si l'utilisateur existe dans la base de données
        const user = await User.findById(userId);  
        if (!user) return res.status(404).json({ message: "User not found" });

        // Vérifie si l'utilisateur a déjà une note
        const existingNote = await Note.findOne({ user: userId });
        if (existingNote) {
            return res.status(400).json({ error: "You can only have one note at a time. Please delete your existing note before creating a new one." });
        }

        // Vérifie que le contenu de la note est fourni
        if (!content) {
            return res.status(400).json({ error: "Note content is required" });
        }

        // Crée une nouvelle instance de note avec les informations fournies
        const newNote = new Note({
            user: userId,  // Associe la note à l'utilisateur authentifié
            content,  // Contenu de la note
            privacy: privacy || "amis",  // Définit la confidentialité, par défaut "amis"
        });

        // Sauvegarde la note dans la base de données
        await newNote.save();  
        
        // Retourne la note créée avec un statut HTTP 201 (Créé)
        res.status(201).json(newNote);  
    } catch (error) {
        // En cas d'erreur, log dans la console et retourne une erreur 500 (serveur)
        console.log("Error in createNote controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Fonction pour récupérer toutes les notes
export const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "username profileImg", 
            });

        res.status(200).json(notes);
    } catch (error) {
        console.error("Error in getAllNotes controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Fonction pour supprimer une note
export const deleteNote = async (req, res) => {
    try {
        // Log les IDs de la note et de l'utilisateur
        console.log("Note ID:", req.params.id);
        console.log("User ID:", req.user._id);

        // Recherche la note à supprimer par son ID
        const note = await Note.findById(req.params.id);
        if (!note) {
            // Si la note n'existe pas, renvoie une erreur 404
            return res.status(404).json({ error: "Note not found" });
        }

        // Vérifie si l'utilisateur qui fait la demande est le propriétaire de la note
        if (note.user.toString() !== req.user._id.toString()) {
            // Si l'utilisateur n'est pas autorisé, retourne une erreur 401 (non autorisé)
            return res.status(401).json({ error: "You are not authorized to delete this note" });
        }

        // Supprime la note de la base de données
        await Note.findByIdAndDelete(req.params.id);

        // Retourne une confirmation de suppression avec un statut HTTP 200 (OK)
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        // Log l'erreur et retourne une réponse 500 en cas de problème
        console.log("Error in deleteNote controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
