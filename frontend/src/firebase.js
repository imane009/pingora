import { initializeApp } from "firebase/app";
import {getStorage} from "firebase/storage"
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAFKBDGoFuZ4k239h6QQrxT_SJzYPfFYzU",
  authDomain: "wideoytb-fccb0.firebaseapp.com",
  projectId: "wideoytb-fccb0",
  storageBucket: "wideoytb-fccb0.appspot.com",
  messagingSenderId: "804814765620",
  appId: "1:804814765620:web:e07bcad18ae165cac15461"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const storage = getStorage(app);

// Initialise l'authentification avec l'application Firebase
const auth = getAuth(app);  // Passage de l'application ici
const provider = new GoogleAuthProvider();

// Configuration de la fenêtre de sélection de compte
provider.setCustomParameters({
  prompt: 'select_account',
});

// Exporter les instances pour les utiliser dans d'autres fichiers
export { app, storage };
export { auth, provider, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword };
