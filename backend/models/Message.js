import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true 
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {  //(texte, image, ou vidéo)
        type: Map,
        of: mongoose.Schema.Types.Mixed, 
        required: true,
        validate: {
            validator: function(value) {
                return value.has("type") && ["text", "image", "video","audio"].includes(value.get("type"));
            },
            message: "Le type de contenu doit être 'text', 'image', 'video' ou 'audio'. "
        }
    },
    deletedAt: {  // Champ pour marquer la suppression du message
        type: Date,
        default: null  
    },
    readBy: [{  // Utilisateurs qui ont lu le message
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true });  

const Message = mongoose.model("Message", messageSchema);

export default Message;