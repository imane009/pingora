import admin from "firebase-admin"; // Importez Firebase Admin SDK

// Chargez le fichier JSON contenant la clé de service Firebase
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

// Vérifiez et initialisez Firebase Admin SDK si nécessaire
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
export default admin;
