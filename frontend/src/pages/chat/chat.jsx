import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./chat.css";


// Dans votre composant Chat


const Chat = ({ userId }) => {
  
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socket = useRef(null);
 

  
  useEffect(() => {
    socket.current = io("http://127.0.0.1:3000");
    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`/api/chat/reciprocal/${userId}`);
        setConversations(res.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des conversations :", err);
      }
    };
    fetchConversations();
  }, [userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedConversation) {
        try {
          const res = await axios.get(`/api/chat/messages/${selectedConversation._id}`);
          const fetchedMessages = res.data;
          setMessages(fetchedMessages);
          socket.current.emit("joinConversation", selectedConversation._id);
        } catch (err) {
          console.error("Erreur lors de la récupération des messages :", err);
        }
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  useEffect(() => {
    socket.current.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => socket.current.off("receiveMessage");
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      conversationId: selectedConversation._id,
      senderId: userId,
      content: { type: "text", value: newMessage },
    };

    try {
      const response = await axios.post("/api/chat/messages", messageData);
      setMessages((prevMessages) => [...prevMessages, response.data]);
      socket.current.emit("sendMessage", response.data);
      setNewMessage("");
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err.response?.data || err.message);
    }
  };

  const sortedMessages = messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="chat-container">
      <div className="conversation-list">
        <h3>Conversations</h3>
        {conversations.map((conv) => {
          if (!conv.participants || conv.participants.length < 2) {
            return null;
          }

          const otherParticipant = conv.participants.find(
            (participant) => participant._id !== userId
          );

          return (
            <div
              key={conv._id}
              className={`conversation-item ${selectedConversation?._id === conv._id ? "active" : ""}`}
              onClick={() => setSelectedConversation(conv)}
            >
              <img src={otherParticipant?.profileImg || "https://via.placeholder.com/50"} alt="Profil" />
              <span>{otherParticipant?.username || "Utilisateur inconnu"}</span>
            </div>
          );
        })}
      </div>

      <div className="chat-box">
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <h3>
                {selectedConversation.participants.find((p) => p._id !== userId)?.username}
              </h3>
            </div>

            <div className="chat-messages">
              {sortedMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.sender === userId ? "sent" : "received"}`}
                >
                  {msg.content.value}
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Écrire un message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>Envoyer</button>
            </div>
          </>
        ) : (
          <p>Sélectionnez une conversation pour commencer à discuter</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
