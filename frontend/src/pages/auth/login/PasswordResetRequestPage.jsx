import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";

const PasswordResetRequestPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordResetRequest = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Veuillez entrer une adresse email.");
      return;
    }

    try {

      const actionCodeSettings = {
        url: "http://localhost:3000/login", // URL de redirection après la réinitialisation
        handleCodeInApp: false, // Firebase gère la réinitialisation dans sa propre page
      };

      // Envoyer l'email de réinitialisation
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setMessage("Un email de réinitialisation a été envoyé. Vérifiez votre boîte mail.");
      setError(""); // Clear any previous errors if successful
    } catch (err) {
      // Gérer les erreurs spécifiques
      if (err.code === "auth/user-not-found") {
        setError("Aucun utilisateur trouvé avec cet e-mail.");
      } else if (err.code === "auth/invalid-email") {
        setError("L'adresse e-mail saisie est invalide.");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
      console.error("Erreur lors de l'envoi de l'e-mail :", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Demande de réinitialisation du mot de passe
        </h2>
  
        {message ? (
          <p className="text-green-600 text-center font-medium mb-4">{message}</p>
        ) : (
          <form onSubmit={handlePasswordResetRequest} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Entrez votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Envoyer le lien
              </button>
            </div>
          </form>
        )}
  
        {error && (
          <p className="text-red-600 text-center font-medium mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
export default PasswordResetRequestPage;
