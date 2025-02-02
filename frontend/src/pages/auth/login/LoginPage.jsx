import { useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineMail, MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signInWithEmailAndPassword } from "firebase/auth"; // Importer la méthode Firebase
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth , provider } from "../../../firebase"; // Assurez-vous que Firebase est configuré
import googleIcon from "../../../components/svgs/googleicon.png"; // Chemin vers l'icône Google
import toast from "react-hot-toast";
import { appID,authKey } from "../../../config/cometchatConfig";
import axios from "axios";
import { CometChat } from "@cometchat-pro/chat";




















 const LoginPage = () => {
   const [formData, setFormData] = useState({
     email: "", // Utilisation de l'email au lieu de "username"
     password: "",
   });
 
   const queryClient = useQueryClient();
   const authKey = "021a1467fd83406097e51a6b07bb56d72a762188"; // Remplacez par votre authKey CometChat
 




   
    // Fonction pour gérer la connexion à CometChat
    const createUserInCometChat = async (user) => {
        const newUser = new CometChat.User(user.uid);
        newUser.setName(user.displayName); // Nom complet de l'utilisateur
        newUser.setAvatar(user.photoURL); // URL de la photo de profil
     
        try {
          await CometChat.createUser(newUser, authKey);
          console.log("Utilisateur créé :", newUser);
        } catch (error) {
          console.error("Erreur lors de la création de l'utilisateur dans CometChat :", error);
          throw error;
        }
      };
     
      const loginToCometChat = async (uid) => {
        try {
          await CometChat.login(uid, authKey);
          console.log("Connexion réussie à CometChat.");
         
        } catch (error) {
          console.error("Erreur lors de la connexion à CometChat :", error);
     
          if (error.code === "ERR_UID_NOT_FOUND") {
            console.log("Utilisateur non trouvé dans CometChat. Création en cours...");
            throw new Error("ERR_UID_NOT_FOUND"); // Propagez l'erreur pour gérer la création
          } else {
            throw error;
          }
        }
      };




   const {
     mutate: loginMutation,
     isPending,
     isError,
     error,
   } = useMutation({
     mutationFn: async ({ email, firebaseIdToken }) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, firebaseIdToken }),
          });
       
          const data = await res.json();
       
          if (!res.ok) {
            console.log("Erreur reçue du backend :", data);
            const { error } = data;
       
              // Mapping des erreurs backend
              if (error === "Mot de passe incorrect.") {
                toast.error("Mot de passe incorrect.");
              } else if (error === "Veuillez fournir un email et un mot de passe.") {
                toast.error("Veuillez fournir un email et un mot de passe.");
              } else if (error === "Veuillez vérifier votre email avant de vous connecter.") {
                toast.error("Veuillez vérifier votre email avant de vous connecter.");
              } else if (error === "Aucun utilisateur trouvé avec cet email.") {
                toast.error("Aucun utilisateur trouvé avec cet email.");
              } else {
                toast.error("Une erreur est survenue. Veuillez réessayer.");
              }
            return;
          }
       
         
        },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["authUser"] });
     },
   });
 








   const handleSubmit = async (e) => {
     e.preventDefault();
 
     try {
       // Étape 1 : Authentification avec Firebase
       const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
       const user = userCredential.user;
 
       // Étape 2 : Obtenir le Firebase ID Token
       const firebaseIdToken = await user.getIdToken();
         // Étape 3 : Tentez de connecter l'utilisateur à CometChat
          try {
            await loginToCometChat(user.uid);
          } catch (error) {
            if (error.message === "ERR_UID_NOT_FOUND") {
              // Si l'utilisateur n'existe pas, créez-le dans CometChat
              console.log("Création de l'utilisateur CometChat...");
              await createUserInCometChat(user);
     
              // Essayez à nouveau de connecter l'utilisateur
              await loginToCometChat(user.uid);
              console.log("Connexion réussie à CometChat.", user.uid);
            } else {
              throw error; // Propager les autres erreurs
            }
          }




       // Étape 3 : Envoyer les données au backend
       loginMutation({ email: formData.email, firebaseIdToken });
     } catch (err) {
       console.error("Erreur lors de la connexion :", err);
       alert(err.message); // Utilisez une bibliothèque comme react-hot-toast pour afficher l'erreur
     }
   };
 
   //google








 
    // Mutation pour gérer la connexion
    const { mutate: googleLoginMutation } = useMutation({
        mutationFn: async ({ firebaseIdToken, userInfo }) => {
          try {
            const res = await axios.post("/api/auth/google-auth", {
              firebaseIdToken,
              firstName: userInfo.displayName.split(" ")[0], // Séparer prénom
              lastName: userInfo.displayName.split(" ").slice(1).join(" "), // Séparer nom
              email: userInfo.email,
              profilePicture: userInfo.photoURL,
              firebaseUID: userInfo.uid,
              username: userInfo.email.split("@")[0], // Nom d'utilisateur basé sur l'email
            });
     
            console.log("Réponse du backend :", res.data);
     
            if (res.status !== 200) {
              throw new Error(res.data.error || "Erreur d'authentification.");
            }
     
            return res.data;
          } catch (error) {
            console.error("Erreur lors de l'appel API Google Auth :", error.response?.data || error.message);
            throw error; // Rejeter pour que `onError` gère cette erreur
          }
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["authUser"] });
          toast.success("Connexion via Google réussie !");
        },
        onError: (error) => {
          console.error("Erreur capturée dans onError :", error.response?.data || error.message);
          toast.error(error.response?.data?.error || "Erreur de connexion avec Google.");
        },
      });
     
    const [isPopupOpen, setIsPopupOpen] = useState(false);








    const handleGoogleLogin = async () => {
      if (isPopupOpen) return; // Empêcher d'ouvrir plusieurs popups
        setIsPopupOpen(true);
        try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          const firebaseIdToken = await user.getIdToken();
     
          console.log("Firebase ID Token :", firebaseIdToken);
          console.log("Informations utilisateur :", user);
       
          try {
            // Tentez de connecter l'utilisateur à CometChat
            await loginToCometChat(user.uid);
          } catch (error) {
            if (error.message === "ERR_UID_NOT_FOUND") {
              // Si l'utilisateur n'existe pas, créez-le dans CometChat
              console.log("Création de l'utilisateur CometChat...");
              await createUserInCometChat(user);
     
              // Essayez à nouveau de connecter l'utilisateur
              await loginToCometChat(user.uid);
              console.log("Connexion réussie à CometChat.", user.uid);
            } else {
              throw error; // Propager l'erreur si ce n'est pas un problème d'utilisateur manquant
            }
          }
     
          googleLoginMutation({ firebaseIdToken, userInfo: user });
        } catch (error) {
          console.error("Erreur lors de la connexion avec Google :", error);
          toast.error("Erreur lors de la connexion avec Google.");
        }
      };
     








    //fin google
















   const handleInputChange = (e) => {
     setFormData({ ...formData, [e.target.name]: e.target.value });
   };
 
   return (
     <div className="max-w-screen-xl mx-auto flex h-screen items-center justify-center">
       {/* Carte blanche */}
       <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
         {/* Titre principal */}
         <h1 className="text-3xl font-bold text-black text-center">
           Se connecter à Pingora
         </h1>
 
         {/* Sous-titre */}
         <p className="text-gray-700 text-center mt-2">
           et profitez d'une expérience unique
         </p>
 
         {/* Bouton Se connecter avec Google */}
         <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 mt-6 w-full py-2 bg-gray-100 border border-gray-300 rounded-full shadow text-black hover:bg-gray-200">
           <img
             src={googleIcon}
             alt="Google Icon"
             className="w-6 h-6"
           />
           Se connecter avec Google
         </button>
 
         {/* Texte avec des lignes */}
         <div className="flex items-center gap-4 mt-6">
           <hr className="flex-1 border-gray-300" />
           <span className="text-black-500 font-semibold">Ou s'inscrire avec</span>
           <hr className="flex-1 border-gray-300" />
         </div>
 
         {/* Formulaire */}
         <form
           className="flex flex-col gap-6 mt-6"
           onSubmit={handleSubmit}
         >
           {/* Champ Email */}
           <div className="relative">
             <input
               type="email"
               className="w-full border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-0 py-2"
               placeholder="Email"
               name="email"
               onChange={handleInputChange}
               value={formData.email}
             />
             <MdOutlineMail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
           </div>
 
           {/* Champ Mot de passe */}
           <div className="relative">
             <input
               type="password"
               className="w-full border-0 border-b border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-0 py-2"
               placeholder="Mot de passe"
               name="password"
               onChange={handleInputChange}
               value={formData.password}
             />
             <MdPassword className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
           </div>
 
           {/* Bouton Se connecter */}
           <button className="w-full py-3 bg-[#001E36] text-white font-semibold rounded-full hover:bg-blue-600">
             {isPending ? "Chargement..." : "Se connecter"}
           </button>
 
           {/* Mot de passe oublié */}
           <Link
             to="/password-reset-request"
             className="text-center text-[#001E36] hover:underline text-sm"
           >
             Mot de passe oublié ?
           </Link>
         </form>
         {/* Lien vers S'enregistrer */}
         <div className="text-center mt-6">
          <p className="text-gray-500">Vous n'avez pas de compte ?</p>
          <Link
            to="/signup"
            className="text-blue-500 font-semibold hover:underline"
          >
            S'inscrire
          </Link>
        </div>
       </div>
     </div>
   );
 };
 
 export default LoginPage;
 



















