// 

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  FaUser,
  FaTimes,
  FaHeart,
  FaComment,
  FaSlidersH,
  FaEllipsisV,
  FaRegCheckCircle,
  FaTrashAlt,
} from "react-icons/fa";


const NotificationPage = ({ onClose }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [notificationsList, setNotificationsList] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(null); // Correction ici : initialisé à null
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [acceptedNotifications, setAcceptedNotifications] = useState(
    JSON.parse(localStorage.getItem("acceptedNotifications")) || []
  );


  // Récupérer les notifications
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data.notifications;
      } catch (error) {
        console.error(error);
        return [];
      }
    },
  });


  // Calculer le nombre de notifications non lues
  useEffect(() => {
    if (notifications) {
      const unreadCount = notifications.filter((notification) => !notification.read).length;
      setUnreadNotificationsCount(unreadCount);
    }
  }, [notifications]);


  // Supprimer toutes les notifications
  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Notifications supprimées avec succès");
      queryClient.invalidateQueries(["notifications"]);
      setUnreadNotificationsCount(0); // Réinitialiser le compteur
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });


  // Supprimer une notification
  const { mutate: deleteSingleNotification } = useMutation({
    mutationFn: async (notificationId) => {
      try {
        const res = await fetch(`/api/notifications/${notificationId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Notification supprimée avec succès");
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });


  // Mettre à jour le statut d'une notification
  const { mutate: updateNotificationStatus } = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour de la notification");
    },
    onSuccess: () => {
      toast.success("Action mise à jour avec succès");
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: () => {
      toast.error("Une erreur est survenue");
    },
  });


  // Accepter une invitation
  const handleFollowAction = (notification) => {
    updateNotificationStatus(
      { id: notification._id, status: "accepted" },
      {
        onSuccess: () => {
          toast.success("Invitation acceptée !");
          setAcceptedNotifications((prev) => {
            const newAccepted = [...prev, notification._id];
            localStorage.setItem("acceptedNotifications", JSON.stringify(newAccepted));
            return newAccepted;
          });
          refetch();
        },
        onError: () => {
          toast.error("Une erreur est survenue lors de l'acceptation.");
        },
      }
    );
  };


  // Refuser une invitation
  const handleRejectFollowAction = (notificationId) => {
    updateNotificationStatus({ id: notificationId, status: "rejected" });
    deleteSingleNotification(notificationId);
  };


  // Formater la date
  const formatDate = (date) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return "Date invalide";
    }
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    return parsedDate.toLocaleString(undefined, options);
  };


  // Marquer une notification comme non lue
  const handleMarkAsUnread = async (notification) => {
    updateNotificationStatus(
      { id: notification._id, status: "unread" },
      {
        onSuccess: () => {
          setNotificationsList((prevNotifications) =>
            prevNotifications.map((notif) =>
              notif._id === notification._id ? { ...notif, read: false } : notif
            )
          );
          // Décrémenter le compteur de notifications non lues
          setUnreadNotificationsCount((prevCount) => prevCount - 1);
        },
        onError: () => {
          toast.error("Erreur lors de la mise à jour de la notification");
        },
      }
    );
  };


  // Ouvrir/fermer le menu
  const toggleMenu = (id) => {
    setIsMenuOpen(isMenuOpen === id ? null : id); // Correction ici : gestion du menu
  };


  // Filtrer les notifications
  const filteredNotifications = notifications
    ?.filter((notification) => {
      if (filter === "unread") return !notification.read;
      if (filter === "read") return notification.read;
      if (filter === "invitations") return notification.type === "follow";
      return true;
    });


  // Supprimer toutes les notifications
  const handleDeleteAllNotifications = () => {
    deleteNotifications();
    setIsDeleteMenuOpen(false);
  };


  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = () => {
    notifications?.forEach((notification) => {
      if (!notification.read) {
        updateNotificationStatus(
          { id: notification._id, status: "read" },
          {
            onSuccess: () => {
              setNotificationsList((prevNotifications) =>
                prevNotifications.map((notif) =>
                  notif._id === notification._id ? { ...notif, read: true } : notif
                )
              );
            },
            onError: () => {
              toast.error("Erreur lors de la mise à jour de la notification");
            },
          }
        );
      }
    });


    // Réinitialiser le compteur de notifications non lues
    setUnreadNotificationsCount(0);
  };


  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <div className="flex justify-between items-center">
          <p className="text-2xl font-bold mb-4">Notifications</p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsDeleteMenuOpen(!isDeleteMenuOpen)}
                className="m-1"
              >
                <FaSlidersH className="w-5 h-5 text-[#001E36]" />
              </button>
              {isDeleteMenuOpen && (
                <div className="absolute right-0 mt-1 w-50 bg-white rounded-md shadow-lg z-50">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-[#1A3D5E]-500 whitespace-nowrap"
                  >
                    <FaRegCheckCircle className="mr-2 w-4 h-4 text-[#1A3D5E]" />
                    Tout marquer comme lu
                  </button>
                  <button
                    onClick={handleDeleteAllNotifications}
                    className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-[#1A3D5E]-500 whitespace-nowrap"
                  >
                    <FaTrashAlt className="mr-2 w-4 h-4 text-[#1A3D5E]" />
                    Tout supprimer
                  </button>
                </div>
              )}
            </div>
            <button onClick={onClose}>
              <FaTimes className="w-5 h-5 text-[#001E36]" />
            </button>
          </div>
        </div>
        <div className="flex justify-center gap-4 my-2">
          <button
            className={`px-4 py-2 rounded-full ${filter === "all" ? "bg-[#001E36] text-white rounded-full" : "bg-gray-300 hover:bg-gray-400"}`}
            onClick={() => setFilter("all")}
          >
            Tout
          </button>
          <button
            className={`px-4 py-2 rounded-full ${filter === "unread" ? "bg-[#001E36] text-white rounded-full" : "bg-gray-300 hover:bg-gray-400"}`}
            onClick={() => setFilter("unread")}
          >
            Non lues
          </button>
          <button
            className={`px-4 py-2 rounded-full ${filter === "invitations" ? "bg-[#001E36] text-white rounded-full" : "bg-gray-300 hover:bg-gray-400"}`}
            onClick={() => setFilter("invitations")}
          >
            Invitations
          </button>
        </div>


        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}


        {filteredNotifications?.length === 0 && (
          <div className="text-center p-4 font-bold">Aucune notification 🤔</div>
        )}


        <div className="max-h-96 overflow-y-auto">
          {filteredNotifications?.map((notification) => (
            <div
              className={`border-b border-gray-700 flex justify-between items-center ${
                notification.read ? "bg-white" : "bg-gray-200"
              }`}
              key={notification._id}
            >
              <div className="flex gap-2 p-4">
 
                <Link to="#" className="flex items-center gap-3">
                  <div className="avatar w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={notification.from.profileImg || "/avatar-placeholder.png"}
                      alt={`${notification.from.username}'s avatar`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex gap-1 items-center">
                      <span className="font-bold">@{notification.from.username}</span>
                      {notification.type === "like" && (
                        <>
                          {notification.commentId ? (
                            <span> a aimé ton commentaire</span>
                          ) : (
                            <span> a aimé ta publication</span>
                          )}
                        </>
                      )}
                      {notification.type === "comment" && (
                        <span> a commenté ta publication</span>
                      )}
                      {notification.type === "follow" && notification.status === "accepted" ? (
                        "Vous êtes devenu amis"
                      ) : notification.type === "follow" ? (
                        <>
                          vous a envoyé une invitation
                          <div className="flex gap-2 ml-4">
                            {!acceptedNotifications.includes(notification._id) && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFollowAction(notification);
                                  }}
                                  className="px-4 py-2 bg-[#001E36] text-white rounded"
                                >
                                  Accepter
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectFollowAction(notification._id);
                                  }}
                                  className="px-4 py-2 bg-gray-300 text-[#001E36] rounded"
                                >
                                  Refuser
                                </button>
                              </>
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                  </div>
                </Link>
              </div>


              <div className="relative">
                <button onClick={() => toggleMenu(notification._id)}>
                  <FaEllipsisV className="w-3 h-3 text-gray-500" />
                </button>
                {isMenuOpen === notification._id && ( // Correction ici : vérification de l'état du menu
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsUnread(notification);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-[#1A3D5E]-500 whitespace-nowrap"
                    >
                      <FaRegCheckCircle className="mr-2 w-4 h-4 text-[#1A3D5E]" />
                      Marquer comme lu
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSingleNotification(notification._id);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-black hover:bg-gray-100 hover:text-[#1A3D5E]-500 whitespace-nowrap"
                    >
                      <FaTrashAlt className="mr-2 w-4 h-4 text-[#1A3D5E]" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default NotificationPage;

