import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        img: [{
            type: String,
        }],
        videos: [{
            type: String,
        }],
        
        mediaType: {
            type: String,
            enum: ['image', 'video', null],
            default: null
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment", // Référence au modèle Comment
            }, 
        ],
        audience: {
            type: String,
            enum: ['public', 'private', 'friends'], // Types d'audience possibles
            default: 'public', // Audience par défaut
        },
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
