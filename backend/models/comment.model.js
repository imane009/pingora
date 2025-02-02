import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Référence au modèle User
            },
        ],
    },
    { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
