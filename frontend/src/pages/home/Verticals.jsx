import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart } from "react-icons/fa"; // FontAwesome
import { BiSolidMessageRounded } from "react-icons/bi"; // Bootstrap Icons
import { IoSendSharp } from "react-icons/io5"; // Ionicons
import { FaBookmark } from "react-icons/fa"; // FontAwesome
import { IoEllipsisHorizontalSharp } from "react-icons/io5"; // Ionicons

const Verticals = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/api/posts/all");
        const filteredPosts = response.data.filter((post) => post.videos.length > 0); // Posts avec vidéos

        // Calculer la durée des vidéos
        const postsWithDurations = await Promise.all(
          filteredPosts.map(async (post) => {
            const videosWithDuration = await Promise.all(
              post.videos.map(
                (video) =>
                  new Promise((resolve) => {
                    const videoElement = document.createElement("video");
                    videoElement.src = video; // URL de la vidéo
                    videoElement.addEventListener("loadedmetadata", () => {
                      resolve({
                        url: video,
                        duration: videoElement.duration, // Durée en secondes
                      });
                    });
                  })
              )
            );

            // Filtrer les vidéos de moins de 60 secondes
            return {
              ...post,
              videos: videosWithDuration.filter((video) => video.duration < 60),
            };
          })
        );

        // Filtrer les posts pour garder ceux avec au moins une vidéo valide
        const finalPosts = postsWithDurations.filter((post) => post.videos.length > 0);
        setPosts(finalPosts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-20 w-[500px]">
      <h1 className=" text-2xl font-bold mb-8 ">Verticals</h1>
      <div className="space-y-4 ">
        {posts.map((post) => (
          <div key={post._id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Corps du post */}
            <div className="relative flex items-start p-3">
              <div className="flex-grow">
                {post.videos.map((video, index) => (
                  <div key={index} className="mb-3">
                    <video className="w-full max-w-sm rounded-lg mb-3" controls>
                      <source src={video.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {/* Informations sur la vidéo */}
                    <div className="flex items-center mb-3">
                      <img
                        src={post.user?.profileImg || "/avatar-placeholder.png"} // Photo de profil
                        alt={post.user?.username || "Utilisateur"}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <span className="font-semibold text-lg">
                        {post.user?.username || "Utilisateur anonyme"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Icônes avec un espacement réduit */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Verticals;
