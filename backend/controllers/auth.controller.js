import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import admin from "../firebaseconfig/firebaseadmin.js";
import axios from "axios";


export const checkUserAvailability = async (req, res) => {
  const { username } = req.body;

  try {
    const usernameExists = await User.findOne({ username });
    

    res.status(200).json({
      usernameTaken: !!usernameExists,
      
    });
  } catch (err) {
    console.error("Erreur lors de la vérification :", err);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}


export const signup = async (req, res) => {
  try {
    const { lastName, firstName, username, email, firebaseUID, profileImg, gender, birthDate } = req.body;

   
    // Vérifier l'existence d'un utilisateur avec le même username ou email dans MongoDB
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(405).json({ error: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(403).json({ error: "Email is already taken" });
    }


    // Ajouter l'utilisateur dans MongoDB
    const newUser = new User({
      lastName,
      firstName,
      username,
      email,
      firebaseUID,
      profileImg, // UID reçu depuis le frontend après création dans Firebase
      birthDate,
      gender,
    });

    await newUser.save();

    res.status(201).json({
      _id: newUser._id,
      lastName: newUser.lastName,
      firstName: newUser.firstName,
      username: newUser.username,
      email: newUser.email,
      firebaseUID: newUser.firebaseUID,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
      gender: newUser.gender,
      birthDate: newUser.birthDate,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const login = async (req, res) => {
  try {
    console.log("Début de la fonction login");

    const { email, firebaseIdToken } = req.body;

    if (!email || !firebaseIdToken) {
      console.log("Champs manquants :", { email, firebaseIdToken });
      return res.status(400).json({ error: "Veuillez fournir un email et un mot de passe." });
    }

    const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
    console.log("Token Firebase décodé :", decodedToken);

    // Vérifiez si l'email est vérifié
    const firebaseUser = await admin.auth().getUserByEmail(email);

    if (!firebaseUser.emailVerified) {
      return res.status(403).json({ error: "Veuillez vérifier votre email avant de vous connecter." });
    }

    // Recherchez l'utilisateur dans votre base de données
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Aucun utilisateur trouvé avec cet email." });
    }

    console.log("Utilisateur trouvé :", user);

    // Générez un jeton d'accès pour l'utilisateur
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      birthDate: user.birthDate,
      gender: user.gender,
    });
  } catch (error) {
    console.error("Erreur capturée dans le backend :", error);

    // Gestion spécifique des erreurs Firebase
    if (error.code === "auth/invalid-credential") {
      return res.status(401).json({ error: "Mot de passe incorrect." });
    }

    if (error.code === "auth/user-not-found") {
      return res.status(404).json({ error: "Aucun utilisateur trouvé avec cet email." });
    }

    // Erreur générique
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
};


export const googleAuth = async (req, res) => {
  try {
    console.log("Données reçues :", req.body);

    const { firebaseIdToken, firstName, lastName, email, profilePicture, firebaseUID, username, } = req.body;

    if (!firebaseIdToken) {
      console.log("Firebase ID Token manquant");
      return res.status(400).json({ error: "Firebase ID Token est requis." });
    }

    // Vérifier le token Firebase
    const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
    console.log("Token Firebase décodé :", decodedToken);

    if (decodedToken.uid !== firebaseUID) {
      console.log("Token Firebase invalide");
      return res.status(403).json({ error: "Token Firebase invalide." });
    }

    // Vérifier si l'utilisateur existe déjà
    console.log("Recherche utilisateur avec l'email :", email);
    let user = await User.findOne({ email });

    if (!user) {
      console.log("Utilisateur introuvable, création d'un nouveau compte...");
      // Créer un nouvel utilisateur
      user = await User.create({
        firstName,
        lastName,
        username,
        email,
        username: `${firstName}_${lastName}`, // Génération unique de nom d'utilisateur
        profileImg: profilePicture,
        firebaseUID,
        fromGoogle: true,
      });
    } else {
      console.log("Utilisateur existant :", user);
    }

    // Générer un JWT et définir le cookie
    console.log("Génération du token...");
    generateTokenAndSetCookie(user._id, res);

    console.log("Utilisateur connecté :", user);
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      profileImg: user.profileImg,
      fromGoogle: true,
    });
  } catch (err) {
    console.error("Erreur dans googleAuth :", err.message);
    res.status(500).json({ error: "Erreur d'authentification avec Google." });
  }
};
 

export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const resetPassword = async (req, res) => {
	const { email } = req.body;
  
	try {
	  if (!email) {
		return res.status(400).json({ message: "Email manquant." });
	  }
  
	  // Vérifiez si l'utilisateur existe dans votre base de données
	  const user = await User.findOne({ email });
  
	  if (!user) {
		return res.status(404).json({ message: "Utilisateur introuvable." });
	  }
  
	  // Envoyer un statut de succès, car Firebase gère le reste
	  res.status(200).json({ message: "Lien de réinitialisation envoyé par Firebase." });
	} catch (error) {
	  console.error("Erreur lors de la demande de réinitialisation :", error);
	  res.status(500).json({ message: "Erreur serveur." });
	}
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur dans getMe:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
