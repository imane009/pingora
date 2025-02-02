import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    privacy: {  // Paramètres de confidentialité
        type: String,
        enum: ["moi uniquement", "amis proches", "amis"], // Limite les options possibles
        default: "amis", // Définit "amis" comme option par défaut
        required: true 
    },
    comments: [{  
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"  
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24  // Expire après 24 heures
    }
}, { timestamps: true });

//pour garantir qu'un utilisateur n'a qu'une seule note
noteSchema.index({ user: 1 }, { unique: true });
const Note = mongoose.model("Note", noteSchema);

export default Note;