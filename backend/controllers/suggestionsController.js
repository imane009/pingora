import User from "../models/user.model.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";

const getsuggestions = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(400).json({ message: "Utilisateur non authentifié" });
        }

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }

        // Récupérer l'utilisateur courant avec ses followers et pings
        const user = await User.findById(userId).populate(["followers", "pings"]);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        const followerIds = user.followers.map((follower) => follower._id.toString());
        const pingIds = user.pings.map((ping) => ping._id.toString());

        // Récupérer les conversations actives
        const activeConversations = await Conversation.find({
            participants: userId,
            type: "private",
        }).select("participants");

        const activeParticipantIds = activeConversations
            .map((conv) => conv.participants.find((p) => p.toString() !== userId.toString()))
            .filter(Boolean); // Exclure les utilisateurs ayant une discussion active

        console.log("Active Participants:", activeParticipantIds);

        // Récupérer les "followers des followers" (c'est-à-dire les followers des amis de l'utilisateur)
        const followersOfFollowers = await User.aggregate([
            { $match: { _id: { $in: user.followers } } }, // Trouver les followers directs
            { $unwind: "$followers" }, // Extraire leurs followers
            { $group: { _id: "$followers" } }, // Grouper par ID unique
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "followersOfFollowers",
                },
            },
            { $unwind: "$followersOfFollowers" }, // Décompresser les résultats
            {
                $match: {
                    "followersOfFollowers._id": {
                        $nin: [...followerIds, userId, ...pingIds, ...activeParticipantIds],
                    }, // Exclure le user courant, ses followers, pings et discussions actives
                },
            },
            {
                $project: {
                    _id: "$followersOfFollowers._id",
                    username: "$followersOfFollowers.username",
                    profileImg: "$followersOfFollowers.profileImg",
                },
            },
        ]);

        console.log("Followers des followers :", followersOfFollowers);

        // Ajouter les pings triés par ordre
        const pings = await User.aggregate([
            { $match: { _id: { $in: user.pings } } },
            { $addFields: { order: { $indexOfArray: [user.pings, "$_id"] } } },
            { $sort: { order: 1 } },
            { $project: { _id: 1, username: 1, profileImg: 1 } },
        ]);

        console.log("Pings :", pings);

        // Réponse finale
        res.status(200).json({
            pings,
            suggestions: followersOfFollowers,
        });
    } catch (err) {
        console.error("Erreur dans getsuggestions :", err.message);
        res.status(500).json({ message: err.message });
    }
};

export { getsuggestions };
