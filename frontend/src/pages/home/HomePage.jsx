// import { useState } from "react";
// import { FaSearch, FaArrowLeft } from "react-icons/fa";
// import { useQuery } from "@tanstack/react-query";
// import { Link } from "react-router-dom";
// import Posts from "../../components/common/Posts";
// import CreatePost from "./CreatePost";
// import Suggestions from "../../pages/suggestions/suggestions";
// import Post from "../../components/common/Post";

// const fetchSearchResults = async (searchTerm) => {
//   const res = await fetch(`/api/search?q=${searchTerm}`);
//   const data = await res.json();
//   return data;
// };

// const HomePage = () => {
//   const [feedType, setFeedType] = useState("forYou");
//   const [searchTerm, setSearchTerm] = useState(""); // État de recherche
//   const [searchResults, setSearchResults] = useState({ users: [], posts: [] }); // Résultats de recherche
//   const [view, setView] = useState("posts"); // État pour choisir entre "posts" ou "users"
//   const { data: authUser, isLoading: isAuthLoading } = useQuery({
//     queryKey: ["authUser"],
//     queryFn: async () => {
//       const res = await fetch("/api/auth/me");
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Unable to fetch user");
//       return data;
//     },
//   });

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleSearchClick = async () => {
//     if (searchTerm) {
//       const data = await fetchSearchResults(searchTerm);
//       setSearchResults(data);
//     } else {
//       setSearchResults({ users: [], posts: [] });
//     }
//   };

//   const handleBackToFeed = () => {
//     setSearchTerm(""); // Réinitialiser le terme de recherche
//     setSearchResults({ users: [], posts: [] }); // Réinitialiser les résultats de recherche
//     setView("posts"); // Réinitialiser la vue à "posts"
//   };

//   return (
//     <div className="flex-[8_8_0] mr-auto min-h-screen bg-white p-4 space-y-6">
//       {/* Barre de Recherche et Flèche */}
//       <div className="space-y-4 ">
//         <div className="flex justify-center">
//           {/* Flèche pour revenir au fil d'actualité */}
//           {searchTerm && (
//             <FaArrowLeft
//               className="text-[#1A3D5E] text-lg cursor-pointer mr-4"
//               onClick={handleBackToFeed}
//               title="Revenir au Fil d'Actualité"
//             />
//           )}

//           {/* Barre de Recherche */}
//           <div className="relative w-2/3 max-w-lg">
//             <input
//               type="text"
//               placeholder="Rechercher..."
//               className="w-full p-2 pl-4 h-10 rounded bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 text-sm"
//               value={searchTerm}
//               onChange={handleSearchChange}
//             />
//             {/* Icône cliquable */}
//             <FaSearch
//               className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
//               onClick={handleSearchClick} // Déclencher la recherche au clic
//             />
//           </div>
//         </div>

//         {/* Contrôles de recherche : boutons pour afficher les posts ou utilisateurs */}
//         {searchTerm && (
//           <div className="flex space-x-4 mb-4">
//             <button
//               onClick={() => setView("posts")}
//               className={`py-2 px-4 rounded-full text-white font-medium transition-all ${
//                 view === "posts"
//                   ? "bg-[#1A3D5E] hover:bg-opacity-90"
//                   : "bg-gray-300 hover:bg-gray-400"
//               }`}
//             >
//               Posts
//             </button>
//             <button
//               onClick={() => setView("users")}
//               className={`py-2 px-4 rounded-full text-white font-medium transition-all ${
//                 view === "users"
//                   ? "bg-[#1A3D5E] hover:bg-opacity-90"
//                   : "bg-gray-300 hover:bg-gray-400"
//               }`}
//             >
//               Users
//             </button>
//           </div>
//         )}
//       </div>

//       {/* NE PAS AFFICHER LA BARRE DE PUBLICATION LORS DE LA RECHERCHE */}
//       {!searchTerm && (
//         <div className="">
//           <CreatePost />
//         </div>
//       )}

//       {/* Suggestions */}
//       {!searchTerm && (
//         <div>
//           <span className="font-bold">Suggestions</span>
//           <Suggestions />
//         </div>
//       )}

//       {/* FIL D'ACTUALITÉ */}
//       {!searchTerm && (
//         <div>
//           <Posts feedType={feedType} />
//         </div>
//       )}

//       {/* Résultats de recherche pour les utilisateurs */}
//       {searchTerm && view === "users" && (
//         <div className="search-results">
//           <h3>Users</h3>
//           {searchResults.users.length === 0 ? (
//             <p>No results found</p>
//           ) : (
//             <div className="flex flex-col space-y-4">
//               {searchResults.users.map((user) => (
//                 <div
//                   key={user._id}
//                   className="flex items-center justify-between bg-gray-100 p-4 rounded shadow"
//                 >
//                   <Link
//                     to={`/profile/${user.username}`}
//                     className="flex items-center space-x-4"
//                   >
//                     <img
//                       src={user.profileImg || "https://via.placeholder.com/50"}
//                       alt={user.username}
//                       className="w-12 h-12 rounded-full"
//                     />
//                     <p className="font-medium text-gray-800">{user.username}</p>
//                   </Link>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Résultats de recherche pour les posts */}
//       {searchTerm && view === "posts" && (
//         <div className="search-results">
//           <h3>Posts</h3>
//           {searchResults.posts.length === 0 ? (
//             <p>No results found</p>
//           ) : (
//             <div>
//               {searchResults.posts.map((post) => (
//                 <Post key={post._id} post={post} />
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomePage;




import { useState } from "react";
import { FaSearch, FaArrowLeft } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import Suggestions from "../../pages/suggestions/suggestions";
import Post from "../../components/common/Post";


const fetchSearchResults = async (searchTerm) => {
  const res = await fetch(`/api/search?q=${searchTerm}`);
  const data = await res.json();
  return data;
};


const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const [searchTerm, setSearchTerm] = useState(""); // État de recherche
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] }); // Résultats de recherche
  const [view, setView] = useState("posts"); // État pour choisir entre "posts" ou "users"
  const { data: authUser, isLoading: isAuthLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to fetch user");
      return data;
    },
  });


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };


  const handleSearchClick = async () => {
    if (searchTerm) {
      const data = await fetchSearchResults(searchTerm);
      setSearchResults(data);
    } else {
      setSearchResults({ users: [], posts: [] });
    }
  };


  const handleBackToFeed = () => {
    setSearchTerm(""); // Réinitialiser le terme de recherche
    setSearchResults({ users: [], posts: [] }); // Réinitialiser les résultats de recherche
    setView("posts"); // Réinitialiser la vue à "posts"
  };


  return (
    <div className="flex-[8_8_0] mr-auto min-h-screen bg-white p-4 space-y-6">
      {/* Barre de Recherche et Flèche */}
      <div className="space-y-4 ">
        <div className="flex justify-center">
          {/* Flèche pour revenir au fil d'actualité */}
          {searchTerm && (
            <FaArrowLeft
              className="text-[#1A3D5E] text-lg cursor-pointer mr-4"
              onClick={handleBackToFeed}
              title="Revenir au Fil d'Actualité"
            />
          )}


          {/* Barre de Recherche */}
          <div className="relative w-2/3 max-w-lg">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full p-2 pl-4 h-10 rounded bg-gray-200 text-gray-900 focus:outline-none focus:ring-2 text-sm"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {/* Icône cliquable */}
            <FaSearch
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
              onClick={handleSearchClick} // Déclencher la recherche au clic
            />
          </div>
        </div>


        {/* Contrôles de recherche : boutons pour afficher les posts ou utilisateurs */}
        {searchTerm && (
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setView("posts")}
              className={`py-2 px-4 rounded-full text-white font-medium transition-all ${
                view === "posts"
                  ? "bg-[#1A3D5E] hover:bg-opacity-90"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setView("users")}
              className={`py-2 px-4 rounded-full text-white font-medium transition-all ${
                view === "users"
                  ? "bg-[#1A3D5E] hover:bg-opacity-90"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              Users
            </button>
          </div>
        )}
      </div>


      {/* NE PAS AFFICHER LA BARRE DE PUBLICATION LORS DE LA RECHERCHE */}
      {!searchTerm && (
        <div className="">
          <CreatePost />
        </div>
      )}


      {/* Suggestions */}
      {!searchTerm && (
        <div>
          <span className="font-bold">Suggestions</span>
          <Suggestions />
        </div>
      )}


      {/* FIL D'ACTUALITÉ */}
      {!searchTerm && (
        <div>
          <Posts feedType={feedType} />
        </div>
      )}


      {/* Résultats de recherche pour les utilisateurs */}
      {searchTerm && view === "users" && (
        <div className="search-results">
          <h3>Users</h3>
          {searchResults.users.length === 0 ? (
            <p>No results found</p>
          ) : (
            <div className="flex flex-col space-y-4">
              {searchResults.users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between bg-gray-100 p-4 rounded shadow"
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center space-x-4"
                  >
                    <img
                      src={user.profileImg || "https://via.placeholder.com/50"}
                      alt={user.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <p className="font-medium text-gray-800">{user.username}</p>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Résultats de recherche pour les posts */}
      {searchTerm && view === "posts" && (
        <div className="search-results">
          <h3>Posts</h3>
          {searchResults.posts.length === 0 ? (
            <p>No results found</p>
          ) : (
            <div>
              {searchResults.posts.map((post) => (
                <Post key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


export default HomePage;



