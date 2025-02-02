import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
 
export const createComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { postId } = req.params;
        const userId = req.user._id;

        if (!text) {
            return res.status(400).json({ error: "Text field is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const newComment = new Comment({
            text,
            user: userId,
            post: postId,
        });

        await newComment.save();

        post.comments.push(newComment._id);
        await post.save();


        // Créer une notification pour l'auteur du post à chaque commentaire
        if (post.user.toString() !== userId.toString()) {
            const notification = new Notification({
                from: userId,  // L'utilisateur qui a commenté
                to: post.user,  // L'utilisateur qui a posté
                type: "comment",  // Type de notification
            });
            console.log("Notification before save:", notification);
            await notification.save();
        }

        res.status(201).json(newComment);
    } catch (error) {
        console.log("Error in createComment controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate("user", "-password")
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (error) {
        console.log("Error in getCommentsByPost controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user._id;
        const { text } = req.body;

        // Vérifier si le post existe (optionnel si nécessaire)
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Vérifier si le commentaire existe
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Vérifier si l'utilisateur est le propriétaire
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not allowed to update this comment" });
        }

        // Mise à jour du commentaire
        comment.text = text || comment.text;
        await comment.save();

        res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (error) {
        console.error("Error in updateComment controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = req.user._id;

        // Vérifier si le post existe (optionnel si nécessaire)
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Vérifier si le commentaire existe
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Vérifier si l'utilisateur est le propriétaire
        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not allowed to delete this comment" });
        }

        // Supprimer le commentaire
        await comment.deleteOne();

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error in deleteComment controller: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const likeUnlikeComment = async (req, res) => {
    try {
        const userId = req.user._id; // ID de l'utilisateur authentifié
        const { id: commentId } = req.params; // ID du commentaire à liker/unliker

        // Vérifier si le commentaire existe
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Vérifier si l'utilisateur a déjà liké le commentaire
        const userLikedComment = comment.likes.includes(userId);

        if (userLikedComment) {
            // Si déjà liké, supprimer le like
            comment.likes = comment.likes.filter(
                (like) => like.toString() !== userId.toString()
            );
            console.log(`User ${userId} unliked comment ${commentId}`);
        } else {
            // Ajouter un like
            comment.likes.push(userId);
            console.log(`User ${userId} liked comment ${commentId}`);

            // Créer une notification seulement pour le like
            if (comment.user.toString() !== userId.toString()) {
                // Vérifie que l'utilisateur ne se notifie pas lui-même
                const notification = new Notification({
                    from: userId,
                    to: comment.user,
                    type: "like",
                    commentId: comment._id,
                });
                console.log(`Notification about to be created for user ${comment.user}`);
                await notification.save();
            }
        }

        // Sauvegarder les modifications
        await comment.save();

        // Retourner la liste mise à jour des likes
        res.status(200).json({ likes: comment.likes });
    } catch (error) {
        console.error("Error in likeUnlikeComment controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
