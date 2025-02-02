// import { ImFilm } from "react-icons/im";
// import { BiSolidMessageRoundedDetail, BiSliderAlt, BiCog, BiLogOut } from "react-icons/bi";
// import { MdHomeFilled } from "react-icons/md";
// import { FaUser, FaPlusCircle } from "react-icons/fa";
// import { Link } from "react-router-dom";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import toast from "react-hot-toast";
// import { useState } from "react";
// import logo from '../svgs/logo.png';
// import Logop from '../svgs/Logop.jpg';
// import Verticals from "../../pages/home/Verticals";

// const Sidebar = () => {
//   const queryClient = useQueryClient();
//   const { mutate: logout } = useMutation({
//     mutationFn: async () => {
//       try {
//         const res = await fetch("/api/auth/logout", { method: "POST" });
//         const data = await res.json();
//         if (!res.ok) {
//           throw new Error(data.error || "Something went wrong");
//         }
//       } catch (error) {
//         throw new Error(error);
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["authUser"] });
//     },
//     onError: () => {
//       toast.error("Logout failed");
//     },
//   });

//   const { data: authUser } = useQuery({ queryKey: ["authUser"] });

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const openModal = () => setIsModalOpen(true);
//   const closeModal = () => setIsModalOpen(false);

//   return (
//     <div>
//       {/* Bouton pour basculer le menu sur les petits écrans */}
//       <button
//         className="md:hidden p-3 bg-[#1A3D5E] text-white rounded-full fixed top-4 left-4 z-50"
//         onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//       >
//         <div className="w-4 h-0.5 bg-white mb-1"></div>
//         <div className="w-4 h-0.5 bg-white mb-1"></div>
//         <div className="w-4 h-0.5 bg-white mb-1"></div>
//       </button>

//       {/* Logo responsive */}
//       <div className="flex items-center justify-center py-6 bg-transparent -mt-12">
//         <img
//           src={logo}
//           alt="Logo de l’application"
//           className="hidden md:block w-[16rem] h-auto object-contain"  // Logo pour les grands écrans
//         />
//         <img
//           src={Logop}
//           alt="Logo de l’application"
//           className="block md:hidden w-[7rem] h-auto object-contain"  // Logo pour les petits écrans
//         />
//       </div>

//       {/* Conteneur principal de la sidebar */}
//       <div
//         className={`fixed md:relative inset-y-0 left-[-20px]  w-[250px] bg-white border-[1px] border-gray-300 rounded-lg h-[80vh] flex flex-col transform transition-all duration-300 z-40 ${
//           isSidebarOpen ? "translate-x-0" : "-translate-x-full"
//         } md:translate-x-0`}
//       >
//         {/* Section Menu */}
//         <div className="flex-1 flex flex-col items-center p-6">
//           {/* Profil utilisateur */}
//           {authUser && (
//             <div className="flex flex-col items-center gap-2">
//               <div className="avatar">
//                 <div className="w-16 h-16 rounded-full overflow-hidden">
//                   <img
//                     src={authUser.profileImg || "/avatar-placeholder.png"}
//                     alt="User Avatar"
//                     className="max-w-full"
//                   />
//                 </div>
//               </div>
//               <p className="text-lg font-bold">{authUser.firstName} {authUser.lastName}</p>
//               <p className="text-sm text-gray-500">@{authUser.username}</p>
//             </div>
//           )}

//           {/* Menu */}
//           <ul className="flex flex-col gap-0 mt-8 w-full">
//             <li>
//               <Link
//                 to="/"
//                 className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
//               >
//                 <MdHomeFilled className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
//                 <span className="text-lg font-medium">Accueil</span>
//               </Link>
//             </li>
//             <li>
//               <button
//                 onClick={() => window.dispatchEvent(new Event("openCreatePostModal"))}
//                 className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
//               >
//                 <FaPlusCircle className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
//                 <span className="text-lg font-medium">Publier</span>
//               </button>
//             </li>
//             <li>
//               <Link
//                 to={`/chatpage`}
//                 className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
//               >
//                 <BiSolidMessageRoundedDetail className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
//                 <span className="text-lg font-medium">Discussions</span>
//               </Link>
//               <Link
//                 to={`/chat`}
//                 className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
//               >
//                 <BiSolidMessageRoundedDetail className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
//                 <span className="text-lg font-medium">ping</span>
//               </Link>
//             </li>
//             <li>
//               <Link
//                 to="/verticals"
//                 className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
//               >
//                 <ImFilm className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
//                 <span className="text-lg font-medium">Verticals</span>
//               </Link>
//             </li>
//             <li>
//               <Link
//                 to="/suggestions"
//                 className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
//               >
//                 <BiSliderAlt className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
//                 <span className="text-lg font-medium">Suggestions</span>
//               </Link>
//             </li>
//           </ul>

//           {/* Profil utilisateur et Déconnexion */}
//           {authUser && (
//             <Link
//               to={`/profile/${authUser.username}`}
//               className="flex gap-4 mt-12 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
//             >
//               <div className="avatar hidden md:inline-flex">
//                 <div className="w-8 rounded-full">
//                   <img src={authUser?.profileImg || "/avatar-placeholder.png"} alt="Avatar" />
//                 </div>
//               </div>
//               <div className="flex justify-between flex-1">
//                 <div className="hidden md:block">
//                   <p className="text-white font-bold text-sm w-20 truncate">
//                     {authUser?.firstName} {authUser?.lastName}
//                   </p>
//                   <p className="text-slate-500 text-sm">@{authUser?.username}</p>
//                 </div>
//                 <BiLogOut
//                   className="w-5 h-5 cursor-pointer"
//                   onClick={() => logout()}
//                 />
//               </div>
//             </Link>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;



import { ImFilm } from "react-icons/im";
import { BiSolidMessageRoundedDetail, BiSliderAlt, BiCog, BiLogOut } from "react-icons/bi";
import { MdHomeFilled } from "react-icons/md";
import { FaUser, FaPlusCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";
import logo from '../svgs/logo.png';
import Logop from '../svgs/Logop.jpg';
import Verticals from "../../pages/home/Verticals";
import { CometChat } from "@cometchat-pro/chat";


const Sidebar = () => {
  const queryClient = useQueryClient();
  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Logout failed");
    },
  });


  const { data: authUser } = useQuery({ queryKey: ["authUser"] });


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  return (
    <div>
      {/* Bouton pour basculer le menu sur les petits écrans */}
      <button
        className="md:hidden p-3 bg-[#1A3D5E] text-white rounded-full fixed top-4 left-4 z-50"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <div className="w-4 h-0.5 bg-white mb-1"></div>
        <div className="w-4 h-0.5 bg-white mb-1"></div>
        <div className="w-4 h-0.5 bg-white mb-1"></div>
      </button>


      {/* Logo responsive */}
      <div className="flex items-center justify-center py-6 bg-transparent -mt-12">
        <img
          src={logo}
          alt="Logo de l’application"
          className="hidden md:block w-[16rem] h-auto object-contain"  // Logo pour les grands écrans
        />
        <img
          src={Logop}
          alt="Logo de l’application"
          className="block md:hidden w-[7rem] h-auto object-contain"  // Logo pour les petits écrans
        />
      </div>


      {/* Conteneur principal de la sidebar */}
      <div
        className={`fixed md:relative inset-y-0 left-[-20px]  w-[250px] bg-white border-[1px] border-gray-300 rounded-lg h-[80vh] flex flex-col transform transition-all duration-300 z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Section Menu */}
        <div className="flex-1 flex flex-col items-center p-6">
          {/* Profil utilisateur */}
          {authUser && (
            <div className="flex flex-col items-center gap-2">
              <div className="avatar">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src={authUser.profileImg || "/avatar-placeholder.png"}
                    alt="User Avatar"
                    className="max-w-full"
                  />
                </div>
              </div>
              <p className="text-lg font-bold">{authUser.firstName} {authUser.lastName}</p>
              <p className="text-sm text-gray-500">@{authUser.username}</p>
            </div>
          )}


          {/* Menu */}
          <ul className="flex flex-col gap-0 mt-8 w-full">
            <li>
              <Link
                to="/"
                className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
              >
                <MdHomeFilled className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
                <span className="text-lg font-medium">Accueil</span>
              </Link>
            </li>
            <li>
              <button
                onClick={() => window.dispatchEvent(new Event("openCreatePostModal"))}
                className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
              >
                <FaPlusCircle className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
                <span className="text-lg font-medium">Publier</span>
              </button>
            </li>
            <li>
              <Link
                to={`/chatpage`}
                className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
              >
                <BiSolidMessageRoundedDetail className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
                <span className="text-lg font-medium">Discussions</span>
              </Link>
              <Link
                to={`/chat`}
                className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
              >
                <BiSolidMessageRoundedDetail className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
                <span className="text-lg font-medium">Ping</span>
              </Link>
            </li>
            <li>
              <Link
                to="/verticals"
                className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
              >
                <ImFilm className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
                <span className="text-lg font-medium">Verticals</span>
              </Link>
            </li>
            <li>
              <Link
                to="/suggestions"
                className="flex gap-4 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
              >
                <BiSliderAlt className="w-8 h-8 text-[#1A3D5E] group-hover:text-white" />
                <span className="text-lg font-medium">Suggestions</span>
              </Link>
            </li>
          </ul>


          {/* Profil utilisateur et Déconnexion */}
          {authUser && (
            <Link
              to={`/profile/${authUser.username}`}
              className="flex gap-4 mt-12 items-center p-3 group hover:bg-[#1A3D5E] hover:text-white transition-all rounded-full duration-300 cursor-pointer"
            >
              <div className="avatar hidden md:inline-flex">
                <div className="w-8 rounded-full">
                  <img src={authUser?.profileImg || "/avatar-placeholder.png"} alt="Avatar" />
                </div>
              </div>
              <div className="flex justify-between flex-1">
                <div className="hidden md:block">
                  <p className="text-white font-bold text-sm w-20 truncate">
                    {authUser?.firstName} {authUser?.lastName}
                  </p>
                  <p className="text-slate-500 text-sm">@{authUser?.username}</p>
                </div>
                <BiLogOut
                className="w-5 h-5 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  CometChat.logout()
                  .then(() => {
          
                  logout();
                  })
                  .catch((error) => {
                  
                  logout();
                });
                }}
              />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};


export default Sidebar;



