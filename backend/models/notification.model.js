import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		from: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		to: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["follow", "like", "comment"],
		},
		postId: {  // Champ pour l'ID de la publication
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
        commentId: {  // Champ pour l'ID du commentaire
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        },
		status: {
			type: String,
			enum: ["pending", "accepted", "rejected"],
			default: "pending",
		},
		read: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true } // Inclut automatiquement createdAt et updatedAt
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;