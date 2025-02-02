// import { Link } from "react-router-dom";
// import { useState } from "react";
// import axios from 'axios';
// import { MdOutlineMail, MdPassword, MdDriveFileRenameOutline } from "react-icons/md";
// import { FaUser } from "react-icons/fa";
// import toast from "react-hot-toast";
// import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { auth } from "../../../firebase";


// const SignUpPage = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     username: "",
//     lastName: "",
//     firstName: "",
//     birthDate: "",
//     gender: "",
//     password: "",
//     confirmPassword: "",
//     profileImg: "", // Ajout pour la photo de profil
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const { email, username, lastName, firstName, birthDate, gender, password, confirmPassword, profileImg } =
//       formData;

//     if (!username || !email || !password || !lastName || !firstName || !birthDate || !gender || !confirmPassword) {
//       toast.error("Veuillez remplir tous les champs !");
//       return;
//     }

//     if (password !== confirmPassword) {
//       toast.error("Les mots de passe ne sont pas identiques.");
//       return;
//     }

//     if (password.length < 8) {
//       toast.error("Le mot de passe doit avoir minimum 8 caractères.");
//       return;
//     }

//     if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
//       toast.error("Votre mot de passe doit contenir au moins un chiffre, une lettre majuscule et un symbole.");
//       return;
//     }

//     try {
//       setLoading(true);

//       // Créez l'utilisateur dans Firebase
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Envoi de l'email de vérification
//       await sendEmailVerification(user, {
//         url: "http://localhost:3000/login", // Redirection après vérification
//       });
//       toast.success("Un email de vérification a été envoyé. Veuillez vérifier votre boîte mail.");

//        // Téléchargement de l'image vers Firebase Storage
//        let profileImgURL = null;
//        if (profileImg) {
//          const storage = getStorage();
//          const storageRef = ref(storage, `profilePictures/${user.uid}`);
//          await uploadBytes(storageRef, profileImg); // Téléchargement du fichier
//          profileImgURL = await getDownloadURL(storageRef); // Obtenir l'URL de téléchargement
//        }

//       // Sauvegarder l'utilisateur dans MongoDB
//       const firebaseUID = user.uid;
//       const res = await axios.post("/api/auth/signup", {
//         username,
//         email,
//         lastName,
//         firstName,
//         birthDate,
//         gender,
//         firebaseUID,
//         profileImg: profileImgURL,
//       });
//       console.log("Inscription réussie", res);
 
//   // Étape 5 : Créer l'utilisateur dans CometChat
//   const authKey = "021a1467fd83406097e51a6b07bb56d72a762188"; // Remplacez par votre clé d'authentification CometChat
//   const cometChatUID = firebaseUID; // Utilisez le UID de Firebase comme UID unique pour CometChat
//   const cometChatUser = {
// 	uid: cometChatUID,
// 	name: `${firstName} ${lastName}`,
// 	avatar: profileImgURL || "https://default-avatar.png",
//   };

//   try {
// 	await axios.post("https://api-eu.cometchat.io/v3/users", cometChatUser, {
// 	  headers: {
// 			appId: "27015059589d1852", // Remplacez par votre App ID
// 		  apiKey: "715f3c63f0d62d25122dbff7317a049236ff0f24", // Clé API REST
// 	  },
// 	});
// 	console.log("Utilisateur créé avec succès.");
//   } catch (cometChatError) {
// 	console.error("Erreur lors de la création de l'utilisateur :", cometChatError);
// 	toast.error("Une erreur est survenue .");
//   }

      
//     } catch (err) {
//       console.error("Erreur lors de l'inscription :", err);
//       if (err.response) {
//       // Erreurs provenant du backend
//       const { error } = err.response.data;
//       if (error === "Username is already taken") {
//         toast.error("Nom d'utilisateur déjà pris.");
//       } else if (error === "Email is already taken") {
//         toast.error("Email déjà utilisé.");
//       } else if (error === "Invalid email format") {
//         toast.error("Format de l'email invalide.");
//       } else {
//         toast.error(error || "Une erreur est survenue. Veuillez réessayer.");
//       }
//     } else if (err.code === "auth/email-already-in-use") {
//       // Erreur Firebase
//       toast.error("Cet email est déjà utilisé.");
//     } else if (err.code === "auth/invalid-email") {
//       toast.error("L'email fourni est invalide.");
//     } else {
//       toast.error("Une erreur est survenue. Veuillez réessayer.");
//     }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
  
//   const handleFileChange = (e) => {
//     setFormData({ ...formData, profileImg: e.target.files[0] });
//   };

//   return (
//     <div className="max-w-screen-xl mx-auto flex h-screen px-10">
//       {/* Colonne pour le formulaire uniquement */}
//       <div className="flex-1 flex flex-col justify-center items-center">
//         {/* Cercle pour la photo de profil */}
//         <div className="mb-6">
//           <label
//             htmlFor="profileImg"
//             className="block w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer"
//           >
//             {formData.profileImg ? (
//               <img
//                 src={URL.createObjectURL(formData.profileImg)}
//                 alt="Profile Preview"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <span className="text-gray-400">+</span>
//             )}
//           </label>
//           <input
//             id="profileImg"
//             type="file"
//             accept="image/*"
//             className="hidden"
//             onChange={handleFileChange}
//           />
//         </div>

//         {/* Formulaire */}
//         <form
//           className="lg:w-2/3 mx-auto md:mx-10 grid grid-cols-2 gap-4"
//           onSubmit={handleSubmit}
//         >
//           <h1 className="col-span-2 text-4xl font-extrabold text-white mb-4">Join today.</h1>
         
//           {/* Champs du formulaire */}
//           <label className="input input-bordered rounded flex items-center gap-2">
//             <MdDriveFileRenameOutline />
//             <input
//               type="text"
//               className="grow"
//               placeholder="Nom"
//               name="lastName"
//               onChange={handleInputChange}
//               value={formData.lastName}
//             />
//           </label>
//           <label className="input input-bordered rounded flex items-center gap-2">
//             <MdDriveFileRenameOutline />
//             <input
//               type="text"
//               className="grow"
//               placeholder="Prénom"
//               name="firstName"
//               onChange={handleInputChange}
//               value={formData.firstName}
//             />
//           </label>
//           <label className="input input-bordered rounded flex items-center gap-2">
//             <MdOutlineMail />
//             <input
//               type="email"
//               className="grow"
//               placeholder="Email"
//               name="email"
//               onChange={handleInputChange}
//               value={formData.email}
//             />
//           </label>
//           <label className="input input-bordered rounded flex items-center gap-2">
//             <FaUser />
//             <input
//               type="text"
//               className="grow"
//               placeholder="Nom d'utilisateur"
//               name="username"
//               onChange={handleInputChange}
//               value={formData.username}
//             />
//           </label>
//           <label className="input input-bordered rounded flex items-center gap-2">
//             <MdPassword />
//             <input
//               type="password"
//               className="grow"
//               placeholder="Mot de passe"
//               name="password"
//               onChange={handleInputChange}
//               value={formData.password}
//             />
//           </label>
//           <label className="input input-bordered rounded flex items-center gap-2">
//             <MdPassword />
//             <input
//               type="password"
//               className="grow"
//               placeholder="Confirmation du mot de passe"
//               name="confirmPassword"
//               onChange={handleInputChange}
//               value={formData.confirmPassword}
//             />
//           </label>
//           <label className="input input-bordered rounded flex items-center gap-2">
//             <input
//               type="date"
//               className="grow"
//               placeholder="Date de naissance"
//               name="birthDate"
//               onChange={handleInputChange}
//               value={formData.birthDate}
//             />
//           </label>
//           <label className="input input-bordered rounded flex items-center gap-2">
//             <select
//               className="grow"
//               name="gender"
//               onChange={handleInputChange}
//               value={formData.gender}
//             >
//               <option value="">Genre</option>
//               <option value="male">Homme</option>
//               <option value="female">Femme</option>
//             </select>
//           </label>

//           <button className="col-span-2 btn rounded-full btn-primary text-white" disabled={loading}>
//             {loading ? "Loading..." : "Sign up"}
//           </button>
//         </form>
//         <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
//           <p className="text-white text-lg">Already have an account?</p>
//           <Link to="/login">
//             <button className="btn rounded-full btn-primary text-white btn-outline w-full">
//               Sign in
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUpPage;

import { Link } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';
import { MdOutlineMail, MdPassword, MdDriveFileRenameOutline } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth } from "../../../firebase";




const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    lastName: "",
    firstName: "",
    birthDate: "",
    gender: "",
    password: "",
    confirmPassword: "",
    profileImg: "", // Ajout pour la photo de profil
  });
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();


    const { email, username, lastName, firstName, birthDate, gender, password, confirmPassword, profileImg } =
      formData;


    if (!username || !email || !password || !lastName || !firstName || !birthDate || !gender || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs !");
      return;
    }


    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne sont pas identiques.");
      return;
    }


    if (password.length < 8) {
      toast.error("Le mot de passe doit avoir minimum 8 caractères.");
      return;
    }


    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
      toast.error("Votre mot de passe doit contenir au moins un chiffre, une lettre majuscule et un symbole.");
      return;
    }


    try {
      setLoading(true);


      // Créez l'utilisateur dans Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;


      // Envoi de l'email de vérification
      await sendEmailVerification(user, {
        url: "http://localhost:3000/login", // Redirection après vérification
      });
      toast.success("Un email de vérification a été envoyé. Veuillez vérifier votre boîte mail.");


       // Téléchargement de l'image vers Firebase Storage
       let profileImgURL = null;
       if (profileImg) {
         const storage = getStorage();
         const storageRef = ref(storage, `profilePictures/${user.uid}`);
         await uploadBytes(storageRef, profileImg); // Téléchargement du fichier
         profileImgURL = await getDownloadURL(storageRef); // Obtenir l'URL de téléchargement
       }


      // Sauvegarder l'utilisateur dans MongoDB
      const firebaseUID = user.uid;
      const res = await axios.post("/api/auth/signup", {
        username,
        email,
        lastName,
        firstName,
        birthDate,
        gender,
        firebaseUID,
        profileImg: profileImgURL,
      });
      console.log("Inscription réussie", res);
 
  // Étape 5 : Créer l'utilisateur dans CometChat
  const authKey = "021a1467fd83406097e51a6b07bb56d72a762188"; // Remplacez par votre clé d'authentification CometChat
  const cometChatUID = firebaseUID; // Utilisez le UID de Firebase comme UID unique pour CometChat
  const cometChatUser = {
  uid: cometChatUID,
  name: `${firstName} ${lastName}`,
  avatar: profileImgURL || "https://default-avatar.png",
  };


  try {
  await axios.post("https://api-eu.cometchat.io/v3/users", cometChatUser, {
    headers: {
      appId: "27015059589d1852", // Remplacez par votre App ID
      apiKey: "715f3c63f0d62d25122dbff7317a049236ff0f24", // Clé API REST
    },
  });
  console.log("Utilisateur créé avec succès.");
  } catch (cometChatError) {
  console.error("Erreur lors de la création de l'utilisateur :", cometChatError);
  toast.error("Une erreur est survenue .");
  }


     
    } catch (err) {
      console.error("Erreur lors de l'inscription :", err);
      if (err.response) {
      // Erreurs provenant du backend
      const { error } = err.response.data;
      if (error === "Username is already taken") {
        toast.error("Nom d'utilisateur déjà pris.");
      } else if (error === "Email is already taken") {
        toast.error("Email déjà utilisé.");
      } else if (error === "Invalid email format") {
        toast.error("Format de l'email invalide.");
      } else {
        toast.error(error || "Une erreur est survenue. Veuillez réessayer.");
      }
    } else if (err.code === "auth/email-already-in-use") {
      // Erreur Firebase
      toast.error("Cet email est déjà utilisé.");
    } else if (err.code === "auth/invalid-email") {
      toast.error("L'email fourni est invalide.");
    } else {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    }
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleFileChange = (e) => {
    setFormData({ ...formData, profileImg: e.target.files[0] });
  };


  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      {/* Colonne pour le formulaire uniquement */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {/* Cercle pour la photo de profil */}
        <div className="mb-6">
          <label
            htmlFor="profileImg"
            className="block w-24 h-24 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer"
          >
            {formData.profileImg ? (
              <img
                src={URL.createObjectURL(formData.profileImg)}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400">+</span>
            )}
          </label>
          <input
            id="profileImg"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>


        {/* Formulaire */}
        <form
          className="lg:w-2/3 mx-auto md:mx-10 grid grid-cols-2 gap-4"
          onSubmit={handleSubmit}
        >
          <h1 className="col-span-2 text-4xl font-extrabold text-white mb-4">Join today.</h1>
         
          {/* Champs du formulaire */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdDriveFileRenameOutline />
            <input
              type="text"
              className="grow"
              placeholder="Nom"
              name="lastName"
              onChange={handleInputChange}
              value={formData.lastName}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdDriveFileRenameOutline />
            <input
              type="text"
              className="grow"
              placeholder="Prénom"
              name="firstName"
              onChange={handleInputChange}
              value={formData.firstName}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <FaUser />
            <input
              type="text"
              className="grow"
              placeholder="Nom d'utilisateur"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Mot de passe"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Confirmation du mot de passe"
              name="confirmPassword"
              onChange={handleInputChange}
              value={formData.confirmPassword}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <input
              type="date"
              className="grow"
              placeholder="Date de naissance"
              name="birthDate"
              onChange={handleInputChange}
              value={formData.birthDate}
            />
          </label>
          <label className="input input-bordered rounded flex items-center gap-2">
            <select
              className="grow"
              name="gender"
              onChange={handleInputChange}
              value={formData.gender}
            >
              <option value="">Genre</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
            </select>
          </label>


          <button className="col-span-2 btn rounded-full btn-primary text-white" disabled={loading}>
            {loading ? "Loading..." : "Sign up"}
          </button>
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};


export default SignUpPage;





