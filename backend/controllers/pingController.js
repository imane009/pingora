import User from "../models/user.model.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";

const pingUser = async (req, res) => {
    try {
        
        const userId=req.user.id;
        
        const { targetUserId } = req.body;
        console.log("userid",userId);
        console.log("targetuser", targetUserId)


        if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(targetUserId)) {
            return res.status(400).json({ message: "IDs utilisateur invalides" });
        }

        // Vérifier si l'utilisateur cible existe
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "Utilisateur cible non trouvé" });
        }

        // Ajouter le ping à l'utilisateur cible si ce n'est pas déjà fait
        if (!targetUser.pings.includes(userId)) {
            targetUser.pings.unshift(userId); // Ajouter en haut de la liste
            await targetUser.save();
            console.log("Ping ajouté à l'utilisateur cible"); // Log pour vérifier si le ping a été ajouté
        }
        

        // Vérifier si le ping est réciproque
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "Utilisateur courant non trouvé" });
        }

        if (currentUser.pings.includes(targetUserId)) {
            // Vérifier si une conversation existe déjà
            let conversation = await Conversation.findOne({
                participants: { $all: [userId, targetUserId] },
                type: "private",
            });

            if (!conversation) {
                console.log("Aucune conversation existante, création de la conversation...");
                // Créer une nouvelle conversation si elle n'existe pas
                conversation = new Conversation({
                    participants: [userId, targetUserId],
                    type: "private",
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                });
                await conversation.save();
                
            } else {
                console.log("Conversation existante :", conversation);
                return res.status(200).json({ message: "Conversation existante.", conversation });
            }
            currentUser.pings = currentUser.pings.filter((id) => id.toString() !== targetUserId);
            targetUser.pings = targetUser.pings.filter((id) => id.toString() !== userId);

            // Sauvegarder les modifications
            await currentUser.save();
            await targetUser.save();
            

            // Mettre à jour les suggestions
            const updatedSuggestions = await User.find({
                _id: { $ne: userId },
                _id: { $nin: [targetUserId, ...currentUser.pings, ...currentUser.followers] },
            }).select("username profileImg");

            return res.status(201).json({
                message: "Conversation créée !",
                conversation,
                suggestions: updatedSuggestions,
            });
            
        } else {
            // Le ping n'est pas réciproque
            return res.status(200).json({ message: "Ping envoyé avec succès, mais pas encore réciproque" });
        }
    } catch (error) {
        console.error("Erreur lors de l'exécution du pingUser : ", error.message); // Log pour afficher l'erreur exacte
        res.status(500).json({ message: "Erreur serveur : " + error.message });
    }
};

export { pingUser };
