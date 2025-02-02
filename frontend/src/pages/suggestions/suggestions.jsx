import React, { useState, useEffect } from "react";
import { useQuery} from "@tanstack/react-query";
import axios from "axios";
import "./suggestions.css";
import { MdNavigateNext } from "react-icons/md";

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const Suggestions = () => {
    
    const [pings, setPings] = useState([]); // Liste des pings
    const [suggestions, setSuggestions] = useState([]); // Liste des suggestions
    const [showModal, setShowModal] = useState(false); // État pour le modal
    const { data: authUser, isLoading: isAuthLoading } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Unable to fetch user");
            return data;
        },
    });

    // Charger les pings et suggestions depuis le backend
    const fetchSuggestions = async () => {
        try {
            const res = await axios.get(`/api/suggestions`);
            const { pings, suggestions } = res.data; // Extraire les pings et suggestions
    
            // Garder les pings tels quels et mélanger uniquement les suggestions
            setPings(pings);
            console.log("pings" , pings)
            setSuggestions(shuffleArray(suggestions)); // Mélanger uniquement les suggestions
        } catch (err) {
            console.error("Erreur lors du chargement des suggestions :", err);
        }
    };

    useEffect(() => {
        fetchSuggestions(); // Charger les données au montage du composant
    }, []);

    // Fonction pour gérer le ping
    const handlePing = async (targetUserId) => {
        if (isAuthLoading || !authUser) {
            alert("Chargement des informations utilisateur. Veuillez réessayer.");
            return;
        }
        
        

        try {
            
             // ID de l'utilisateur courant
            await axios.post("/api/ping", {
                userId: authUser._id,
                targetUserId,
            });
            alert("Ping envoyé avec succès !");
            fetchSuggestions(); // Rafraîchir les suggestions après un ping
        } catch (err) {
            console.error("Erreur lors de l'envoi du ping :", err);
        }
    };

    // Combiner les pings et les suggestions
    const combinedList = [...pings, ...suggestions];

    // Séparer les éléments à afficher directement et ceux à mettre dans le modal
    const firstThree = combinedList.slice(0, 3);
    const rest = combinedList.slice(3);

    return (
        <div>
            {/* Conteneur des suggestions */}
            <div className="suggestions">
                {firstThree.map((person) => (
                    <div className="personne" key={person._id}>
                        <img src={person.profileImg || "https://via.placeholder.com/50"} alt={`${person.username}`} />

                        <p>{person.username}</p>
                        <button onClick={() => handlePing(person._id)}>Pinguer</button>
                    </div>
                ))}

                {/* Bouton pour afficher plus dans un modal */}
                {rest.length > 0 && (
                    <button className="open-modal" onClick={() => setShowModal(true)}>
                        <MdNavigateNext size={24} />
                    </button>
                )}
            </div>

            {/* Modal pour le reste des suggestions */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="close-modal"
                            onClick={() => setShowModal(false)}
                        >
                            &times;
                        </button>
                        {rest.map((person) => (
                            <div className="modal-personne" key={person._id}>
                                <img src={person.profileImg || "https://via.placeholder.com/50"} alt={`${person.username}`} />
                                <p>{person.username}</p>
                                <button onClick={() => handlePing(person._id)}>Pinguer</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suggestions;
