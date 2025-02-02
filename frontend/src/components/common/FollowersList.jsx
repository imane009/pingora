import { useState, useEffect } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { Link } from "react-router-dom";

const FollowersList = ({ userId }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null); // ID du follower pour le menu ouvert

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/followers`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch followers");
        }
        setFollowers(data);
      } catch (error) {
        console.error("Error fetching followers:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  const handleRemoveFollower = async (followerId) => {
    try {
      const res = await fetch(`/api/users/${userId}/remove-follower`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ followerId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove follower");
      }
      setFollowers(followers.filter((f) => f._id !== followerId)); // Mise à jour locale
      setMenuOpen(null); // Fermer le menu
    } catch (error) {
      console.error("Error removing follower:", error.message);
    }
  };

  if (loading) {
    return <p>Loading followers...</p>;
  }

  if (followers.length === 0) {
    return <p>Aucun follower 😢</p>;
  }

  return (
    <div className="followers-list p-4">
      {followers.map((follower) => (
        <div
          key={follower._id}
          className="follower-item flex items-center justify-between gap-4 p-2 bg-gray-800 rounded-md mb-2"
          style={{ backgroundColor: "#D0D7E1" }}
        >
          {/* Lien pour rediriger vers le profil */}
          <Link to={`/profile/${follower.username}`} className="flex items-center gap-4 w-full">
            <img
              src={follower.profileImg || "/avatar-placeholder.png"}
              alt={`${follower.username}'s profile`}
              className="w-10 h-10 rounded-full"
            />
            <span className="font-semibold text-black">{follower.username}</span>
          </Link>

          {/* Menu des trois points */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Empêche le clic d'ouvrir le lien
                setMenuOpen(menuOpen === follower._id ? null : follower._id);
              }}
              className="text-black hover:text-gray-500"
            >
              <FaEllipsisV />
            </button>
            {menuOpen === follower._id && (
              <div className="absolute right-0 mt-2 bg-gray-700 rounded-md shadow-lg">
                <button
                  onClick={() => handleRemoveFollower(follower._id)}
                  className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-600"
                >
                  Retirer
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FollowersList;
