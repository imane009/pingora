import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";




const sendMessage = async (req, res) => {
    try {
        
        const { senderId, conversationId, content } = req.body;

        if (!mongoose.isValidObjectId(conversationId) || !mongoose.isValidObjectId(senderId)) {
            return res.status(400).json({ message: "ID conversation ou utilisateur invalide" });
        }

        
        const newMessage = new Message({    //creer message 
            conversationId,
            sender: senderId,
            content
        });

        await newMessage.save();
        console.log("Message sauvegardé :", newMessage);

        // m
        // ettre à jour la date du dernier message dans la conversation
        await Conversation.findByIdAndUpdate(conversationId, { last_message_at: new Date() });

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Récupérer les messages d'une conversation
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({ message: "ID conversation invalide" });
        }

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getReciprocalConversation = async (req, res) => {
    try {
        const userId =req.user._id;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ message: "ID utilisateur invalide" });
        }

        const conversations = await Conversation.find({
            participants: userId,
            type: "private",
        })
        .populate("participants", "username profileImg"); // Populate les deux participants

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export {sendMessage , getMessages , getReciprocalConversation}