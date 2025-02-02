import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaBell, FaSlidersH, FaChevronDown } from "react-icons/fa";
import useFollow from "../../hooks/useFollow";
import LoadingSpinner from "./LoadingSpinner";
import Note from "./Note";
import Story from "./Story";
import NotificationPage from "../../pages/notification/NotificationPage";




const RightPanel = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);




  const navigate = useNavigate();




  const { data: authUser, isLoading: authLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong!");
      return data;
    },
  });




  const { data: suggestedUsers, isLoading: suggestedLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      const res = await fetch("/api/users/suggested");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong!");
      return data;
    },
  });




  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data.notifications.filter((notification) => !notification.read);
    },
  });




  const { follow, isPending } = useFollow();




  if (authLoading || suggestedLoading || notificationsLoading) {
    return <LoadingSpinner />;
  }




  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };




  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };




  const handleProfileClick = () => {
    closeModal();
    navigate(`/profile/${authUser.username}`);
  };




  return (
    <div>
      {/* Bouton pour ouvrir le panneau sur les écrans tablette */}
      <button
        onClick={openModal}
        className="flex items-center gap-4 cursor-pointer fixed top-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50 md:hidden"
      >
        <FaChevronDown size={24} className="text-white" />
      </button>




      {/* Modale pour les tablettes */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-50 z-50 transition-all duration-300 ${
          isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeModal}
      >
        <div
          className="bg-white w-full h-full p-4 overflow-auto max-h-screen md:h-full md:max-h-screen md:w-[768px] md:mx-auto rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-3xl font-bold text-gray-500"
          >
            &times;
          </button>




          <div className="my-4 mx-auto">
            <div className="bg-[#ffffff] p-4 rounded-md mb-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setIsNotificationModalOpen(true)}
                  className="flex items-center gap-4 cursor-pointer md:hidden"
                >
                  <div className="relative">
                    <FaBell size={20} className="text-[#1A3D5E]" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                </button>




                {isNotificationModalOpen && (
                  <NotificationPage
                    onClose={() => setIsNotificationModalOpen(false)}
                    notifications={notifications}
                  />
                )}




                <div
                  onClick={handleProfileClick}
                  className="flex items-center gap-4 cursor-pointer"
                >
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <img
                        src={authUser.profileImg || "/avatar-placeholder.png"}
                        alt="User Avatar"
                        className="max-w-full"
                      />
                    </div>
                  </div>
                </div>




                <div className="flex items-center gap-4 cursor-pointer">
                  <FaSlidersH size={20} className="text-[#1A3D5E]" />
                </div>
              </div>




              <div className="">
                <h1 className="text-2xl font-bold mb-4">Stories</h1>
                <Story />
              </div>




              <div className="bg-[#ffffff] p-4 rounded-md mt-6">
                <h1>Amis en Lignes</h1>
                <Note />
              </div>
            </div>
          </div>
        </div>
      </div>




      {/* Version desktop */}
      <div className="hidden lg:block my-4 mx-auto max-w-xs">
        <div className="flex justify-between items-center bg-[#ffffff] p-4 rounded-md mb-4">
          <button
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => setIsNotificationModalOpen(true)}
          >
            <div className="relative">
              <FaBell size={20} className="text-[#1A3D5E]" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
          </button>




          {isNotificationModalOpen && (
            <NotificationPage
              onClose={() => setIsNotificationModalOpen(false)}
              notifications={notifications}
            />
          )}




          <Link
            to={`/profile/${authUser.username}`}
            className="flex items-center gap-4 cursor-pointer"
          >
            <div className="avatar">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={authUser.profileImg || "/avatar-placeholder.png"}
                  alt="User Avatar"
                  className="max-w-full"
                />
              </div>
            </div>
          </Link>

        
        </div>




        <div className="">
          <h1 className="text-2xl font-bold mb-4">Stories</h1>
          <Story />
        </div>




        <div className="bg-[#ffffff] p-4 rounded-md mt-6">
          <h1>Notes</h1>
          <Note />
        </div>
      </div>
    </div>
  );
};




export default RightPanel;









