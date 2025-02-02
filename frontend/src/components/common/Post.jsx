import { FaRegComment, FaRegHeart, FaRegTrashAlt, FaRegEdit, FaEllipsisV, FaComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegBookmark, FaTrash, FaEdit, FaTimes, FaEllipsisH, FaTrashAlt, FaArrowRight, FaHeart } from "react-icons/fa";
import { FaSmile } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../../utils/date";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/";
import EmojiPicker from "emoji-picker-react";

const Post = ({ post }) => {
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuCommentOpen, setIsMenuCommentOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCommentsDisabled, setIsCommentsDisabled] = useState(false); // État pour afficher/masquer les commentaires

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  // Ajouter un émoji au texte du commentaire
  const handleEmojiClick = (emojiObject) => {
    setComment((prevComment) => prevComment + emojiObject.emoji);
    setShowEmojiPicker(false); // Masquer le sélecteur après avoir sélectionné un émoji
  };

  // Fermer le sélecteur d'émojis en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);




  const [editedText, setEditedText] = useState(post.text);
  const [selectedImage, setSelectedImage] = useState(null); // Image sélectionnée
  const [isUploadingImage, setIsUploadingImage] = useState(false); // État de l'upload

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  console.log("authUser dans Post.jsx :", authUser);

  const postOwner = post.user;


  const isLiked = post.likes?.includes(authUser._id); // Check if likes array exists
  const isMyPost = authUser._id === post.user._id;
  const formattedDate = formatPostDate(post.createdAt);

  // Fonction pour gérer l'upload de l'image
  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);
    try {
      const imageRef = ref(storage, `posts/${Date.now()}_${selectedImage.name}`);
      const snapshot = await uploadBytes(imageRef, selectedImage);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Met à jour l'API avec l'image téléchargée
      return downloadURL;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Échec de l'upload de l'image");
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const { mutate: editPost, isPending: isEditing } = useMutation({
    mutationFn: async (newText) => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: newText }), // Envoyer le texte modifié
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onMutate: async (newText) => {
      // Mise à jour optimiste
      await queryClient.cancelQueries(["posts"]); // Annuler les requêtes en cours pour éviter des conflits
      const previousPosts = queryClient.getQueryData(["posts"]); // Récupérer l'état précédent

      queryClient.setQueryData(["posts"], (oldPosts) =>
        oldPosts.map((p) =>
          p._id === post._id ? { ...p, text: newText } : p
        )
      );
      return { previousPosts }; // Retourner l'état précédent pour pouvoir l'utiliser en cas d'erreur
    },
    onError: (error, newText, context) => {
      // Restaurer l'état précédent en cas d'erreur
      queryClient.setQueryData(["posts"], context.previousPosts);
      toast.error(error.message || "Failed to update the post");
    },
    onSuccess: () => {
      toast.success("Post updated successfully");
      document.getElementById("edit_modal" + post._id).close(); // Fermer la modale
    },
  });

  const handleEditPost = () => {
    if (isEditing) return;
    editPost(editedText); // Passer le texte modifié
  };


  // Mutation for liking a post
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedLikes) => {
      queryClient.setQueryData(["posts"], (oldData) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation for liking a comment
  const { mutate: likeComment, isPending: isCommentLiking } = useMutation({
    mutationFn: async (commentId) => {
      const res = await fetch(`/api/comments/like/${commentId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to like/unlike the comment");
      }
      return data; // Renvoie les données de réponse
    },
    onSuccess: (updatedCommentLikes) => {
      queryClient.setQueryData(["posts"], (oldData) =>
        oldData.map((p) => {
          if (p._id === post._id) {
            return {
              ...p,
              comments: p.comments.map((comment) =>
                comment._id === updatedCommentLikes._id
                  ? { ...comment, likes: updatedCommentLikes.likes }
                  : comment
              ),
            };
          }
          return p;
        })
      );
    },

    onError: (error) => {
      toast.error(error.message);
    },

  });


  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/${post._id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onMutate: () => {
      // Mise à jour optimiste : suppression immédiate du post dans le cache
      queryClient.setQueryData(["posts"], (oldPosts) =>
        oldPosts.filter((postItem) => postItem._id !== post._id)  // Supprimer le post localement
      );
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete the post");
    },
  });

  const handleDeletePost = () => {
    if (isDeleting) return;
    deletePost();
  };

  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/comments/${post._id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: comment }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        // Assurez-vous que les informations de l'utilisateur qui a posté le commentaire sont présentes dans `data`
        return {
          ...data,
          user: authUser, // Ajoute les informations de l'utilisateur connecté, s'il s'agit de l'auteur du commentaire
        };
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (data) => {
      // Ajout immédiat du commentaire dans le local state avec les informations de l'utilisateur
      queryClient.setQueryData(["posts"], (oldPosts) => {
        return oldPosts.map((postItem) => {
          if (postItem._id === post._id) {
            return {
              ...postItem,
              comments: [
                ...postItem.comments,
                {
                  ...data,
                  user: authUser, // Assurez-vous que le nom de l'utilisateur est inclus dans chaque commentaire
                },
              ], // Ajouter le commentaire avec l'utilisateur à la liste
            };
          }
          return postItem;
        });
      });

      toast.success("Comment posted successfully");
      setComment(""); // Réinitialise le champ commentaire
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePostComment = (e) => {
    e.preventDefault(); // Empêche le rafraîchissement de la page
    if (isCommenting || !comment.trim()) return; // Si on est déjà en train de commenter, ou si le commentaire est vide, ne rien faire
    commentPost(); // Envoi du commentaire via la mutation
  };

  // Mutation pour supprimer un commentaire
  const { mutate: deleteComment, isPending: isDeletingComment } = useMutation({
    mutationFn: async (commentId) => {
      try {
        const res = await fetch(`/api/comments/${post._id}/${commentId}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (data, commentId) => {
      // Mise à jour immédiate du cache pour retirer le commentaire supprimé
      queryClient.setQueryData(["posts"], (oldPosts) => {
        return oldPosts.map((postItem) => {
          if (postItem._id === post._id) {
            return {
              ...postItem,
              comments: postItem.comments.filter((comment) => comment._id !== commentId),
            };
          }
          return postItem;
        });
      });

      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete the comment");
    },
  });

  const handleDeleteComment = (commentId) => {
    if (isDeletingComment) return; // Empêche la suppression si une requête est déjà en cours
    deleteComment(commentId);
  };


  // Mutation pour modifier un commentaire
  const { mutate: editComment, isPending: isEditingComment } = useMutation({
    mutationFn: async ({ commentId, newText }) => {  // Changer commentId et newText ici
      try {
        const res = await fetch(`/api/comments/${post._id}/${commentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: newText }),  // Utiliser newText ici
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: (updatedComment) => {
      toast.success("Comment updated successfully");
      queryClient.setQueryData(["posts"], (oldData) =>
        oldData.map((p) =>
          p._id === post._id
            ? {
              ...p,
              comments: p.comments.map((comment) =>
                comment._id === updatedComment._id ? updatedComment : comment
              ),
            }
            : p
        )
      );
    },
    onError: (error) => {
      toast.error(error.message);
      // Optionnel : annuler la mise à jour optimiste si l'appel API échoue
    },
  });


  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
  };


  const handleLikeComment = (commentId) => {
    if (isCommentLiking) return;

    const updatedComments = post.comments.map((comment) => {
      if (comment._id === commentId) {
        const updatedLikes = comment.likes.includes(authUser._id)
          ? comment.likes.filter((id) => id !== authUser._id)
          : [...comment.likes, authUser._id];
        return { ...comment, likes: updatedLikes };
      }
      return comment;
    });

    // Mise à jour locale des likes des commentaires
    queryClient.setQueryData(["posts"], (oldData) =>
      oldData.map((p) => (p._id === post._id ? { ...p, comments: updatedComments } : p))
    );

    likeComment(commentId); // Appel de la mutation pour persister le like du commentaire
  };


  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditedText(currentText);
  };

  const submitEditComment = (commentId) => {
    if (!editedText.trim() || isEditingComment) return; // Empêcher les soumissions invalides ou multiples
    // Mise à jour optimiste immédiate du commentaire localement
    const updatedComments = post.comments.map((comment) =>
      comment._id === commentId ? { ...comment, text: editedText } : comment
    );
    // Mise à jour locale des commentaires
    queryClient.setQueryData(["posts"], (oldData) =>
      oldData.map((p) => (p._id === post._id ? { ...p, comments: updatedComments } : p))
    );

    // Appeler l'API pour sauvegarder les modifications côté serveur
    editComment({ commentId, newText: editedText });

    setEditingCommentId(null);
    setEditedText("");
  };

  const handleNext = () => {
    if (Array.isArray(post.img)) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === post.img.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const handlePrevious = () => {
    if (Array.isArray(post.img)) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? post.img.length - 1 : prevIndex - 1
      );
    }
  }

  // Gestion de la navigation via les bulles
  const handleIndicatorClick = (index) => {
    setCurrentImageIndex(index);
  };

  const toggleMenu = () => {
    setIsMenuCommentOpen(!isMenuCommentOpen);
  };

  return (
    <>
      <div className="p-4 bg-white rounded-xl shadow-md border border-gray-300 mb-6">
        <div className="flex gap-2 items-start">
          <div className="avatar">
            <Link to={`/profile/${postOwner.username}`} className="w-12 h-12 rounded-full overflow-hidden">
              <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt={postOwner.username} />
            </Link>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between ml-2">
              <div>
                <Link to={`/profile/${postOwner.username}`} className="font-bold p-1">
                  {postOwner.firstName} {postOwner.lastName}
                </Link>
                {/* Date */}
                <span className="block ml-1 text-gray-700 text-sm">{formattedDate}</span>
              </div>
              {postOwner._id === authUser._id && (
                <div className="relative">
                  {/* Bouton de trois points */}
                  <button
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)} // Gérer l'état d'ouverture du menu
                  >
                    <FaEllipsisV className="w-5 h-5" />
                  </button>

                  {/* Menu déroulant */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-50">
                      <ul className="py-1">
                        <li>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-[#1A3D5E]-500"
                            onClick={() =>
                              document.getElementById("edit_modal" + post._id).showModal()
                            }
                          >
                            <FaRegEdit className="mr-2 w-4 h-4 text-[#1A3D5E]" />
                            Modifier
                          </button>
                        </li>

                        <li>
                          <button
                            className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-[#1A3D5E]-500"
                            onClick={handleDeletePost}
                          >
                            <FaTrashAlt className="mr-2 w-4 h-4 text-[#1A3D5E]" />
                            Supprimer
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Modal pour la modification */}
              <dialog id={`edit_modal${post._id}`} className="modal border-none outline-none">
                <div className="modal-box w-full bg-white border border-gray-200 rounded-lg shadow-2xl p-6 transition-all duration-300">
                  {/* Bouton pour fermer la modal */}
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    onClick={() => document.getElementById(`edit_modal${post._id}`).close()}
                  >
                    <FaTimes size={22} />
                  </button>

                  {/* Titre de la modale */}
                  <h3 className="font-bold text-2xl mb-6 text-gray-800">Modifier le post</h3>

                  {/* Formulaire de modification */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditPost();
                    }}
                  >
                    {/* Zone de texte pour éditer le post */}
                    <textarea
                      defaultValue={post.text}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full p-2 rounded-xl bg-gray-100 border-none outline-none transition-all duration-200 focus:bg-gray-200"
                      placeholder="Modifier votre post..."
                      rows={4} // Ajustez le nombre de lignes selon vos besoins
                    />

                    {/* Boutons d'action */}
                    <div className="flex justify-end mt-4 gap-2">
                      {/* Bouton Modifier */}
                      <button
                        type="submit"
                        className="bg-[#001E36] text-white px-4 py-2 rounded-lg hover:bg-[#1A3D5E] transition-colors duration-200"
                      >
                        Modifier
                      </button>
                    </div>
                  </form>
                </div>
              </dialog>


            </div>

            <div className="flex flex-col mt-5 -ml-12 gap-3 overflow-hidden">
              {/* Texte du post */}
              <span className="text-gray-800">{post.text}</span>

              {/* Vérifier si post.img est un tableau d'images */}
              {Array.isArray(post.img) && post.img.length > 0 ? (
                <div className="flex flex-col items-center">
                  {/* Conteneur de l'image avec flèches de navigation (uniquement si plus d'une image) */}
                  <div className="relative w-80 h-70 mb-6">
                    {/* Afficher les flèches uniquement s'il y a plus d'une image */}
                    {post.img.length > 1 && (
                      <>
                        {/* Flèche gauche */}
                        <button
                          onClick={handlePrevious}
                          className="absolute top-1/2 left-0 transform -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors duration-200 z-50"
                          aria-label="Image précédente"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                          </svg>
                        </button>

                        {/* Flèche droite */}
                        <button
                          onClick={handleNext}
                          className="absolute top-1/2 right-0 transform -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors duration-200 z-50"
                          aria-label="Image suivante"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Image affichée */}
                    <img
                      src={post.img[currentImageIndex]}
                      className="w-full h-full object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                      alt={`Post image ${currentImageIndex}`}
                    />
                  </div>

                  {/* Indicateurs d'images (uniquement si plus d'une image) */}
                  {post.img.length > 1 && (
                    <div className="flex mt-4 gap-2">
                      {post.img.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleIndicatorClick(index)}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${index === currentImageIndex
                            ? "bg-[#1A3D5E]"
                            : "bg-gray-300 hover:bg-gray-400"
                            }`}
                          aria-label={`Aller à l'image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Si post.img est une seule image (chaîne de caractères)
                post.img && typeof post.img === "string" && (
                  <img
                    src={post.img}
                    className="w-full h-full object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                    alt="Post image"
                  />
                )
              )}
            </div>


            <div className="flex flex-col gap-3 overflow-hidden">

              {/* Vérifier si post.videos est un tableau de vidéos */}
              {Array.isArray(post.videos) ? (
                <div className="flex justify-center gap-7">
                  {post.videos.map((video, index) => (
                    <video
                      key={index}
                      controls
                      className="w-60 h-50 rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105"
                    >
                      <source src={video} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture des vidéos.
                    </video>
                  ))}
                </div>
              ) : (
                // Si post.videos est une seule vidéo, l'afficher normalement
                post.videos && (
                  <video
                    controls
                    className="w-full rounded-lg shadow-lg transform transition-transform duration-300 hover:scale-105"
                  >
                    <source src={post.videos} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture des vidéos.
                  </video>
                )
              )}
            </div>

            <div className="">
              <div className="flex justify-start gap-4 mt-5 -ml-11">
                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={handleLikePost}
                >
                  {isLiked ? (
                    <FaHeart className="text-[#001E36] text-2xl" />
                  ) : (
                    <FaRegHeart className="text-slate-500 text-2xl" />
                  )}
                  <span className="text-xs text-[#001E36] font-bold ">{post.likes?.length || 0} {/* Vérification de likes */}
                  </span>
                </div>
                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
                >
                  {post.comments?.length > 0 ? ( // Si le nombre de commentaires > 0
                    <FaComment className="text-[#001E36] text-2xl" /> // Style actif
                  ) : (
                    <FaRegComment className="text-slate-500 text-2xl" /> // Style inactif
                  )}
                  <span className="text-xs text-[#001E36] font-bold ">
                    {post.comments?.length || 0} {/* Afficher le nombre de commentaires */}
                  </span>
                </div>





                {/* Modal for Comments */}
                <dialog id={`comments_modal${post._id}`} className="modal border-none outline-none">
                  <div className="modal-box w-full bg-white border border-gray-200 rounded-lg shadow-2xl p-6 transition-all duration-300" >
                    {/* Bouton pour fermer la modal */}
                    <button
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                      onClick={() => document.getElementById(`comments_modal${post._id}`).close()}
                    >
                      <FaTimes size={22} />
                    </button>

                    <h3 className="font-bold text-2xl mb-6 text-gray-800">Commentaires</h3>

                    {/* Liste des commentaires */}
                    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto" >
                      {post.comments?.length === 0 && (
                        <p className="text-sm text-gray-500">
                          Aucun commentaire pour l'instant 🤔 Soyez le premier à commenter 😉
                        </p>
                      )}

                      {post.comments.map((comment) => (
                        <div key={comment._id} className="flex gap-2 items-start">
                          {/* Avatar de l'utilisateur */}
                          <Link to={`/profile/${comment.user?.username}`}>
                            <div className="avatar">
                              <div className="w-8 rounded-full">
                                <img
                                  src={comment.user?.profileImg || "/avatar-placeholder.png"}
                                  alt={comment.user?.username || "User"}
                                />
                              </div>
                            </div>
                          </Link>

                          {/* Contenu du commentaire */}
                          <div className="flex-1">
                            {/* Ligne avec nom, prénom, username, bouton de like et bouton de trois points */}
                            <div className="flex items-center justify-between">
                              {/* Nom, prénom et username */}

                              <Link to={`/profile/${comment.user?.username}`} className="hover:opacity-80 transition-opacity duration-200">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold">{comment.user?.firstName} {comment.user?.lastName}</span>
                                  <span className="text-gray-600 text-sm">@{comment.user?.username}</span>
                                </div>
                              </Link>

                              {/* Bouton de like et bouton de trois points */}
                              <div className="flex items-center gap-2">
                                {/* Bouton de like */}
                                <div
                                  className="flex gap-1 items-center cursor-pointer group"
                                  onClick={() => handleLikeComment(comment._id)}
                                >
                                  {comment.likes?.includes(authUser._id) ? (
                                    <FaHeart className="text-[#001E36] text-xl" />
                                  ) : (
                                    <FaRegHeart className="text-slate-500 text-xl" />
                                  )}
                                  <span className="text-base text-slate-500 group-hover:text-[#001E36]">{comment.likes?.length || 0}</span>
                                </div>

                                {/* Bouton de trois points (menu déroulant) */}
                                {authUser._id === comment.user?._id && (
                                  <div className="relative">
                                    <FaEllipsisV
                                      className="cursor-pointer text-gray-500 hover:text-gray-700 "
                                      onClick={() => {
                                        // Fermer le menu si déjà ouvert pour ce commentaire
                                        if (isMenuCommentOpen === comment._id) {
                                          setIsMenuCommentOpen(null);
                                        } else {
                                          setIsMenuCommentOpen(comment._id);
                                        }
                                      }}
                                    />

                                    {/* Menu déroulant */}
                                    {isMenuCommentOpen === comment._id && (
                                      <div className="absolute right-0 mt-1 w-35 bg-white rounded-md shadow-lg z-50">
                                        <div className="py-1">
                                          <button
                                            className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-[#1A3D5E]-500 whitespace-nowrap"
                                            onClick={() => {
                                              handleEditComment(comment._id, comment.text);
                                              setIsMenuCommentOpen(null);
                                            }}
                                          >
                                            <FaRegEdit className="mr-2 w-4 h-4 text-[#1A3D5E]" /> Modifier
                                          </button>
                                          <button
                                            className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-[#1A3D5E]-500 whitespace-nowrap"
                                            onClick={() => {
                                              handleDeleteComment(comment._id);
                                              setIsMenuCommentOpen(null);
                                            }}
                                          >
                                            <FaTrashAlt className="mr-2 w-4 h-4 text-[#1A3D5E]" /> Supprimer
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Texte du commentaire */}
                            <div className="text-sm mt-1">{comment.text}


                            </div>


                            {/* Zone d'édition du commentaire */}
                            {editingCommentId === comment._id && (
                              <div className="flex justify-end mt-2 gap-3">
                                <input
                                  value={editedText}

                                  onChange={(e) => setEditedText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault(); // Empêcher le comportement par défaut (comme un saut de ligne)
                                      submitEditComment(comment._id);
                                    }
                                  }}
                                  className="w-full p-2 rounded-xl bg-gray-100 border-none outline-none transition-all duration-200 focus:bg-gray-200"
                                  placeholder="Modifier votre commentaire..."

                                />
                                <button
                                  onClick={() => submitEditComment(comment._id)}
                                  className=" bg-[#001E36] text-white px-3 rounded-xl"
                                >
                                  Enregistrer
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Formulaire pour ajouter un commentaire */}
                    <form onSubmit={handlePostComment} className="mt-4">
                      <div className="flex justify-end mt-2 gap-4">
                        <div className="flex items-center w-full p-2 rounded-xl bg-gray-100 border-none outline-none transition-all duration-200 focus-within:bg-gray-200">

                          <input
                            type="text"
                            placeholder="Ecrivez un commentaire..."
                            className="flex-1 ml-2 bg-transparent outline-none"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FaSmile className="text-xl" />
                          </button>
                          {showEmojiPicker && (
                            <div ref={emojiPickerRef} className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[1000]">
                              <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                width={280} 
                                height={280} 
                                previewConfig={{ showPreview: false }} // Masquer la prévisualisation
                                searchPlaceholder="Rechercher" // Texte de recherche personnalisé
                              />
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          className={`p-3 rounded-full flex items-center justify-center ${comment.trim() ? "bg-[#001E36] cursor-pointer" : "bg-gray-300 "
                            }`}
                          disabled={!comment.trim() || isCommenting}
                        >
                          < FaArrowRight
                            className={`text-lg ${comment.trim() ? "text-white" : "text-gray-500"
                              }`}
                          />
                        </button>
                      </div>
                    </form>
                  </div>
                </dialog>





              </div>

            </div>
          </div>
        </div >
      </div >
    </>
  );
};

export default Post;

