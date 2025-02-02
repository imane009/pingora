import { ImImages } from "react-icons/im";
import { FaCamera } from "react-icons/fa";
import { FaRegFaceGrinBeam } from "react-icons/fa6";
import { TiVideo } from "react-icons/ti";
import { HiOutlineGif } from "react-icons/hi2";
import { GrMapLocation } from "react-icons/gr";
import { IoCloseSharp } from "react-icons/io5";
import { IoEye } from "react-icons/io5";


import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";




const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState([]);
  const [videos, setVideos] = useState([]);
  const [audience, setAudience] = useState("public");
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Nouvel état pour la modal
  const imgRef = useRef(null);
  const fileRef = useRef(null); // Référence pour le fichier
  const [uploadProgress, setUploadProgress] = useState({
    images: 0,
    videos: 0
  });
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const storage = getStorage();


  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };


    window.addEventListener('openCreatePostModal', handleOpenModal);


    return () => {
      window.removeEventListener('openCreatePostModal', handleOpenModal);
    };
  }, []);




  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, imgUrls, videoUrls, audience, commentsEnabled }) => {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, img: imgUrls, videos: videoUrls, audience, commentsEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      setText("");
      setImg([]);
      setVideos([]);
      setUploadProgress({ img: 0, video: 0 }); // Réinitialiser la progression




      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // Fermer la modale
      setIsModalOpen(false);
    },
  });




  const handleSubmit = async (e) => {
    e.preventDefault();


    const imgUrls = await Promise.all(
      img.map(async (image) => {
        const storageRef = ref(storage, `images/${Date.now()}-${image.name}`);


        const uploadTask = uploadBytesResumable(storageRef, image);


        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress((prev) => ({
                ...prev,
                images: progress
              }));
            },
            (error) => {
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      })
    );


    const videoUrls = await Promise.all(
      videos.map(async (video) => {
        const storageRef = ref(storage, `videos/${Date.now()}-${video.name}`);


        const uploadTask = uploadBytesResumable(storageRef, video);


        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress((prev) => ({
                ...prev,
                videos: progress
              }));
            },
            (error) => {
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      })
    );


    createPost({ text, imgUrls, videoUrls, audience, commentsEnabled });
  };




  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);


    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const videoFiles = files.filter((file) => file.type.startsWith("video/"));


    setImg((prevImg) => [...prevImg, ...imageFiles]);
    setVideos((prevVideos) => [...prevVideos, ...videoFiles]);
  };


  const removeImage = (index) => setImg((prevImg) => prevImg.filter((_, i) => i !== index));
  const removeVideo = (index) => setVideos((prevVideos) => prevVideos.filter((_, i) => i !== index));


  return (
    <div>
      {/* Champ de saisie pour ouvrir la modal */}
      {/* <div
        className="flex items-center gap-4 border p-2 rounded cursor-pointer"
        style={{ backgroundColor: "#D0D7E1" }}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="avatar">
          <div className="w-8 rounded-full">
            <img src={authUser?.profileImg || "/avatar-placeholder.png"} alt="Avatar" />
          </div>
        </div>
        <span className="text-gray-500">What is happening?!</span>
      </div> */}


      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-3/4 p-6 rounded-lg relative">
            {/* Bouton pour fermer la modal */}
            <IoCloseSharp
              className="absolute top-4 right-4 text-gray-600 w-6 h-6 cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            />


            {/* Avatar et Nom de l'utilisateur */}
            <div className="flex items-center gap-2 mb-4">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img src={authUser?.profileImg || "/avatar-placeholder.png"} alt="Avatar" />
                </div>
              </div>
              <span className="text-black font-bold">{authUser?.username || "Utilisateur"}</span>
            </div>


            {/* Formulaire */}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <textarea
                className="w-full p-2 rounded border focus:outline-none"
                style={{ backgroundColor: "#D0D7E1" }}
                placeholder="What is happening?!"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />


              {/* Affichage des images sélectionnées */}
              {img.length > 0 && (
                <div className="flex gap-4">
                  {img.map((image, index) => (
                    <div key={index} className="relative w-32 h-32">
                      <IoCloseSharp
                        className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
                        onClick={() => removeImage(index)}
                      />
                      <img
                        src={URL.createObjectURL(image)}
                        className="w-full h-full object-cover rounded"
                        alt="Selected"
                      />
                      {/* Barre de progression */}
                      <div className="w-full h-2 bg-gray-200 mt-2 rounded-full">
                        <div
                          className="h-full bg-[#001E36]  rounded-full"
                          style={{ width: `${Math.round(uploadProgress.images)}%` }} // Mise à jour du pourcentage sans virgule
                        />
                      </div>


                      {/* Affichage du pourcentage sans virgule */}
                      <p className="text-center text-sm mt-1">{Math.round(uploadProgress.images)}%</p>
                    </div>
                  ))}
                </div>
              )}


              {/* Affichage des vidéos sélectionnées */}
              {videos.length > 0 && (
                <div className="flex gap-4">
                  {videos.map((video, index) => (
                    <div key={index} className="relative w-32 h-32">
                      <IoCloseSharp
                        className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
                        onClick={() => removeVideo(index)}
                      />
                      <video
                        className="w-full h-full object-cover rounded"
                        controls
                        src={URL.createObjectURL(video)}
                      />
                      {/* Barre de progression pour les vidéos */}
                      <div className="w-full h-2 bg-gray-200 mt-2 rounded-full">
                        <div
                          className="h-full bg-[#001E36] rounded-full"
                          style={{ width: `${Math.round(uploadProgress.videos)}%` }}
                        />
                      </div>


                      {/* Affichage du pourcentage pour les vidéos */}
                      <p className="text-center text-sm mt-1">{Math.round(uploadProgress.videos)}%</p>


                    </div>
                  ))}
                </div>
              )}




              {/* Icônes */}
              <div className="flex justify-end gap-4 py-2">
                <FaRegFaceGrinBeam className="w-6 h-6 cursor-pointer" style={{ color: "#001E36" }} />
                <ImImages
                  className="w-6 h-6 cursor-pointer"
                  style={{ color: "#001E36" }}
                  onClick={() => fileRef.current.click()}
                />
                <FaCamera className="w-6 h-6 cursor-pointer" style={{ color: "#001E36" }} />
                <TiVideo className="w-6 h-6 cursor-pointer" style={{ color: "#001E36" }} />
                <HiOutlineGif className="w-6 h-6 cursor-pointer" style={{ color: "#001E36" }} />
                <GrMapLocation className="w-6 h-6 cursor-pointer" style={{ color: "#001E36" }} />
              </div>
              <input
                type="file"
                accept="image/*, video/*"
                multiple
                hidden
                ref={fileRef}
                onChange={handleFileChange}
              />


              {/* Audience et Commentaires */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <IoEye className="w-5 h-5" />
                  <p className="text-sm font-bold">Audience</p>
                </div>


                {/* Boutons radio */}
                <div className=" ml-4 mt-2 ">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="audience"
                      value="public"
                      checked={audience === "public"}
                      onChange={(e) => setAudience(e.target.value)}
                    />
                    Public
                  </label>
                  {/* Commentaire sur la logique de l'input */}
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="audience"
                      value="friends"
                      checked={audience === "friends"}
                      onChange={(e) => setAudience(e.target.value)}
                    />
                    Amis
                  </label>
                  {/* Commentaire sur la logique de l'input */}
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="audience"
                      value="private"
                      checked={audience === "private"}
                      onChange={(e) => setAudience(e.target.value)}
                    />
                    Moi uniquement
                  </label>
                </div>


              </div>






              {/* Bouton pour soumettre le post */}
              <button
                type="submit"
                disabled={isPending}
                className="bg-[#001E36] text-white px-3 py-1 rounded mt-4 absolute bottom-4 right-5"
              >
                {isPending ? "Posting..." : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default CreatePost;
