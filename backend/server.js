import http from "http";
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectMongoDB from "./db/connectMongoDB.js";
import commentRoutes from "./routes/comment.route.js";
import noteRoutes from "./routes/note.route.js";
import storyRoutes from "./routes/story.route.js";
import suggestionsRoute from "./routes/suggestions.js";
import pingRoute from "./routes/ping.js";
import chatRoute from "./routes/chat.js";

import User from './models/user.model.js'
import searchRoute from "./routes/search.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: ["http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Configuration CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
}));




// Configuration des routes API
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/stories", storyRoutes);
app.use('/api/suggestions', suggestionsRoute);
app.use('/api/ping', pingRoute);
app.use('/api/chat', chatRoute);
app.use('/api/search', searchRoute); 

// Connexion à la base de données
connectMongoDB();

// cnx n socket
io.on("connection", (socket) => {
  console.log("Un utilisateur est connecté :", socket.id);

  
  socket.on("joinConversation", (conversationId) => {
    if (!conversationId) {
      console.error("ID de conversation manquant");
      return;
    }
    socket.join(conversationId);
    console.log(`Utilisateur ${socket.id} a rejoint la conversation : ${conversationId}`);
  });
  

  // envoyer msg avec socket
  socket.on("sendMessage", async ({ conversationId, senderId, content }) => {
    try {
      console.log("Données reçues sur le serveur :", { conversationId, senderId, content });
      if (!content || !content.value) {
        console.error("Contenu du message invalide");
        return;
      }
      const userExists = await User.findById(senderId);
      if (!userExists) {
         console.error("Utilisateur introuvable :", senderId);
        return;
      }
      const newMessage = new Message({
        conversationId,
        sender: senderId,
        content,
      });
      await newMessage.save();

      // Mettre à jour la date du dernier message dans la conversation
      await Conversation.findByIdAndUpdate(conversationId, { last_message_at: new Date() });

      // Emission du nouveau message aux utilisateurs dans la conversation
      io.to(conversationId).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
    }
  });

  // Déconnexion
  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté :", socket.id);
  });
});


// Routes API pour récupérer les conversations et les messages
app.get("/api/chat/reciprocal/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "username profileImg")
      .sort({ last_message_at: -1 });
    res.json(conversations);
  } catch (err) {
    console.error("Erreur lors de la récupération des conversations:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des conversations" });
  }
});

app.get("/api/chat/messages/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Message.find({ conversationId })
      .populate("sender", "username profileImg")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Erreur lors de la récupération des messages:", err);
    res.status(500).json({ message: "Erreur lors de la récupération des messages" });
  }
});


// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
