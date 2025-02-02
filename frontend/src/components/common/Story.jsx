import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoCloseSharp, IoArrowBack, IoArrowForward } from "react-icons/io5";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaTrashAlt } from "react-icons/fa";

const StoryComponent = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fileType, setFileType] = useState("");
  const [stories, setStories] = useState([]);
  const [friendsStories, setFriendsStories] = useState([]); // Stories des amis
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentFriendStoryIndex, setCurrentFriendStoryIndex] = useState(0); // Index pour les stories des amis
  const [isFriendStoryModalOpen, setIsFriendStoryModalOpen] = useState(false); // Modale pour les stories des amis
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);

  const storage = getStorage();

  // Récupération de l'utilisateur connecté
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to fetch user");
      return data;
    },
  });

  // Récupération des stories de l'utilisateur
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch("/api/stories/user");
        if (!response.ok) throw new Error("Échec lors de la récupération des stories");
        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    // Récupération des stories des amis
    const fetchFriendsStories = async () => {
      try {
        const response = await fetch("/api/stories/friends");
        if (!response.ok) throw new Error("Échec lors de la récupération des stories des amis");
        const data = await response.json();
        setFriendsStories(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchStories();
    fetchFriendsStories();
  }, []);

  const openAddModal = () => setIsAddModalOpen(true);
  const openViewModal = () => setIsViewModalOpen(true);
  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsViewModalOpen(false);
    setFile(null);
    setError("");
    setSuccessMessage("");
    setFileType("");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const type = selectedFile.type.split("/")[0];
      if (type === "image" || type === "video") {
        setFile(selectedFile);
        setFileType(type);
        setError("");
      } else {
        setError("Veuillez sélectionner une image ou une vidéo.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Veuillez télécharger soit une image, soit une vidéo.");
      return;
    }

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const fileRef = ref(storage, `stories/${fileType}s/${fileName}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      const formData = {
        image: fileType === "image" ? fileUrl : null,
        video: fileType === "video" ? fileUrl : null,
      };

      const response = await fetch("/api/stories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Une erreur s'est produite.");
      } else {
        const newStory = await response.json();
        setStories((prevStories) => [newStory, ...prevStories]);
        setSuccessMessage("Story publiée avec succès !");
        closeModals();
      }
    } catch {
      setError("Une erreur s'est produite lors de la création de la story.");
    }
  };

  // Ouvrir la modale pour une story spécifique d'un ami
  const openFriendStoryModal = (index) => {
    setCurrentFriendStoryIndex(index);
    setIsFriendStoryModalOpen(true);
  };

  // Fermer la modale des stories des amis
  const closeFriendStoryModal = () => {
    setIsFriendStoryModalOpen(false);
    setCurrentFriendStoryIndex(0);
  };

  const handleDeleteStory = async (storyId) => {
    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Une erreur s'est produite lors de la suppression.");
      } else {
        // Mise à jour de l'état des stories après suppression
        setStories((prevStories) =>
          prevStories.filter((story) => story._id !== storyId)
        );
        setSuccessMessage("Story supprimée avec succès !");
        closeModals();  // Fermer la modal après suppression
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la suppression.");
    }
  };

  return (
    <div className="flex flex-wrap gap-4 ">
      {/* Bouton pour ajouter une story */}

      <div className="flex items-center space-x-2 relative">
        {/* Bouton de navigation gauche (affiché uniquement si on peut défiler à gauche) */}
        {currentScrollIndex > 0 && (
          <button
            onClick={() => {
              setCurrentScrollIndex((prev) => prev - 1);
              const container = document.getElementById("stories-container");
              container.scrollBy({ left: -190, behavior: "smooth" }); // Défilement de deux stories
            }}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#1A3D5E] text-2xl p-2 bg-white/70 rounded-full shadow-md hover:bg-white transition-all"
            style={{ zIndex: 10 }} // S'assurer qu'il est au-dessus de l'image
          >
            <IoArrowBack />
          </button>
        )}

        {/* Conteneur horizontal pour les stories */}
        <div
          id="stories-container"
          className="flex overflow-x-hidden space-x-3 flex-1 scroll-smooth" // Masquer la barre de défilement
          style={{ width: "380px" }} // Largeur pour afficher deux stories (224px par story)
        >
          {/* Premier rectangle : photo de profil ou story de l'utilisateur */}
          <div
            className="w-28 h-48 rounded-lg flex flex-col items-center justify-end relative overflow-hidden bg-gray-300 text-center flex-shrink-0 cursor-pointer"
            onClick={stories.length > 0 ? openViewModal : openAddModal} // Ouvrir la story ou la modal d'ajout
          >
            {/* Si l'utilisateur a une story, l'afficher comme celle des amis */}
            {stories.length > 0 ? (
              <>
                {stories[0].image ? (
                  <img
                    src={stories[0].image}
                    alt="Story"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={stories[0].video}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Afficher le nom et la photo de profil à l'intérieur de la story */}
                <div className="absolute top-2 left-2 flex items-center space-x-2">
                  <img
                    src={authUser.profileImg || "/avatar-placeholder.png"}
                    alt="Photo de profil"
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span className="text-white text-sm font-semibold">
                    {authUser.username}
                  </span>
                </div>
              </>
            ) : (
              // Si aucune story, afficher uniquement la photo de profil
              <img
                src={authUser.profileImg || "/avatar-placeholder.png"}
                alt="Photo de profil"
                className="absolute top-0 left-0 w-full h-full object-cover z-0"
              />
            )}

            {/* Bouton "+" pour ajouter une story (toujours visible) */}
            <div
              className="absolute bottom-11 text-white text-lg bg-[#1A3D5E] rounded-full w-7 h-7 flex items-center justify-center shadow-lg cursor-pointer z-20"
              onClick={(event) => {
                event.stopPropagation(); // Empêche la propagation de l'événement vers la classe parente
                openAddModal(); // Toujours ouvrir la modal d'ajout
              }}
            >
              +
            </div>
            <p
              className="absolute bottom-0 left-0 w-full bg-opacity-90 bg-white text-[#1A3D5E] text-center py-1 z-10"
              onClick={(event) => {
                event.stopPropagation(); // Empêche la propagation de l'événement vers la classe parente
                openAddModal(); // Toujours ouvrir la modal d'ajout
              }}
            >
              Ajouter une story
            </p>

          </div>

          {/* Afficher les stories des amis */}
          {friendsStories
            .filter((story, index, self) =>
              index === self.findIndex((s) => s.user.username === story.user.username)
            )
            .map((story, index) => (
              <div
                key={index}
                className="w-28 h-48 relative rounded-lg overflow-hidden bg-gray-300 cursor-pointer flex-shrink-0"
                onClick={() => openFriendStoryModal(index)}
              >
                {story.image ? (
                  <img
                    src={story.image}
                    alt={`Story de ${story.user.username}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={story.video}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Afficher le nom et la photo de profil à l'intérieur de la story */}
                <div className="absolute top-2 left-2 flex items-center space-x-2">
                  <img
                    src={story.user.profileImg || "/avatar-placeholder.png"}
                    alt={`Photo de profil de ${story.user.username}`}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span className="text-white text-sm font-semibold">
                    {story.user.username}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Bouton de navigation droite (affiché uniquement si on peut défiler à droite) */}
        {currentScrollIndex < Math.ceil(friendsStories.length / 2) - 1 && (
          <button
            onClick={() => {
              setCurrentScrollIndex((prev) => prev + 1);
              const container = document.getElementById("stories-container");
              container.scrollBy({ left: 190, behavior: "smooth" }); // Défilement de deux stories
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#1A3D5E] text-2xl p-2 bg-white/70 rounded-full shadow-md hover:bg-white transition-all"
            style={{ zIndex: 10 }} // S'assurer qu'il est au-dessus de l'image
          >
            <IoArrowForward />
          </button>
        )}
      </div>






      {/* Modale pour afficher toutes les stories des amis */}
      {isFriendStoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[800px] h-[600px] shadow-md text-center relative">
            <button
              onClick={closeFriendStoryModal}
              className="absolute top-2 right-2 text-[#1A3D5E] text-2xl"
            >
              <IoCloseSharp className="w-6 h-6" />
            </button>

            {/* Afficher la story sélectionnée dans la modal */}
            {friendsStories.length > 0 && (
              <>
                {friendsStories[currentFriendStoryIndex].image ? (
                  <img
                    src={friendsStories[currentFriendStoryIndex].image}
                    alt="Story d'ami"
                    className="w-full h-full object-contain mb-4"
                  />
                ) : (
                  <video
                    src={friendsStories[currentFriendStoryIndex].video}
                    controls
                    className="w-full h-full object-contain mb-4"
                  />
                )}

                {/* Affichage de l'image de profil et du nom sous la story dans la modal */}
                <div className="flex flex-col items-center mt-2">
                  <img
                    src={
                      friendsStories[currentFriendStoryIndex].user
                        .profileImg || "/avatar-placeholder.png"
                    } // Image de profil de l'ami
                    alt={`Photo de profil de ${friendsStories[currentFriendStoryIndex].user.username}`}
                    className="w-10 h-10 rounded-full mb-1"
                  />
                  <span className="text-sm text-[#1A3D5E]">
                    {
                      friendsStories[currentFriendStoryIndex].user
                        .username
                    }
                  </span>
                </div>

                {/* Navigation entre les stories */}
                <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center w-full">
                  <button
                    onClick={() =>
                      setCurrentFriendStoryIndex(
                        (prevIndex) =>
                          (prevIndex - 1 + friendsStories.length) %
                          friendsStories.length
                      )
                    }
                    className="text-[#1A3D5E] text-3xl absolute left-4"
                  >
                    <IoArrowBack />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentFriendStoryIndex(
                        (prevIndex) => (prevIndex + 1) % friendsStories.length
                      )
                    }
                    className="text-[#1A3D5E] text-3xl absolute right-4"
                  >
                    <IoArrowForward />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {/* Modale pour ajouter une story */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-[600px] shadow-xl text-center relative">
            {/* Bouton de fermeture */}
            <button
              onClick={closeModals}
              className="absolute top-4 right-4 text-[#1A3D5E] text-2xl hover:opacity-80 transition-opacity"
            >
              <IoCloseSharp className="w-8 h-8" />
            </button>

            {/* Titre de la modale */}
            <h3 className="text-xl text-[#1A3D5E] font-bold mb-6">Publier votre story</h3>

            {/* Zone de dépôt de fichier */}
            <div className=" w-full h-[500px] border-2  border-[#1A3D5E] flex justify-center items-center rounded-lg bg-gray-50 relative mb-6 transform scale-90">
              {file ? (
                fileType === "image" ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Prévisualisation"
                    className="max-w-[100%] max-h-[100%] object-contain object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    controls
                    className="max-w-[100%] max-h-[100%] object-contain object-cover rounded-lg"
                  />
                )
              ) : (
                <p className="text-[#1A3D5E] text-lg">Glissez-déposez ou cliquez pour ajouter une story</p>
              )}
              {/* Input pour sélectionner un fichier */}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer "
              />
            </div>

            {/* Bouton de publication */}
            <button
              onClick={handleUpload}
              className="bg-[#1A3D5E] text-white py-3 px-8 rounded-full hover:bg-[#153048] transition-colors font-medium"
            >
              Publier la Story
            </button>
          </div>
        </div>
      )}



      {/* Modale pour voir les stories existantes */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[800px] h-[600px] shadow-md text-center relative">
            <button
              onClick={closeModals}
              className="absolute top-2 right-2 text-[#1A3D5E] text-2xl"
            >
              <IoCloseSharp className="w-6 h-6" />
            </button>

            {stories.length > 0 && (
              <>
                {stories[currentStoryIndex].image ? (
                  <img
                    src={stories[currentStoryIndex].image}
                    alt="Story"
                    className="w-full h-full object-contain mb-4"
                  />
                ) : (
                  <video
                    src={stories[currentStoryIndex].video}
                    controls
                    className="w-full h-full object-contain mb-4"
                  />
                )}
                {/* Bouton de suppression de la story */}
                <div className="absolute top-2 right-10">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    &#x2022; &#x2022; &#x2022;
                  </button>

                  {showMenu && (
                    <ul className="absolute right-0 mt-2 bg-white border rounded shadow-md text-sm">
                      <button
                        className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-[#1A3D5E]-500"
                        onClick={() => handleDeleteStory(stories[currentStoryIndex]._id)}
                      >
                        <FaTrashAlt className="mr-2 w-4 h-4 text-[#1A3D5E]" />
                        Supprimer
                      </button>
                    </ul>
                  )}
                </div>
                <div className="absolute top-60 left-0 right-0 flex justify-between w-full px-4">
                  <button
                    onClick={() =>
                      setCurrentStoryIndex(
                        (prevIndex) => (prevIndex - 1 + stories.length) % stories.length
                      )
                    }
                    className="text-[#1A3D5E] text-3xl"
                  >
                    <IoArrowBack />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentStoryIndex((prevIndex) => (prevIndex + 1) % stories.length)
                    }
                    className="text-[#1A3D5E] text-3xl"
                  >
                    <IoArrowForward />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryComponent;