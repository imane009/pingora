// import { useEffect, useRef, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import Posts from "../../components/common/Posts";
// import FollowersList from "../../components/common/FollowersList";
// import FollowingList from "../../components/common/FollowingList";
// import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
// import EditProfileModal from "./EditProfileModal";
// import { storage } from "../../firebase";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { FaArrowLeft } from "react-icons/fa6";
// import { IoCalendarOutline } from "react-icons/io5";
// import { FaLink } from "react-icons/fa";
// import { MdEdit } from "react-icons/md";
// import { useQuery } from "@tanstack/react-query";
// import { formatMemberSinceDate } from "../../utils/date";
// import useFollow from "../../hooks/useFollow";
// import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

// const ProfilePage = () => {
//   const [coverImg, setCoverImg] = useState(null);
//   const [profileImg, setProfileImg] = useState(null);
//   const [feedType, setFeedType] = useState("posts");

//   const coverImgRef = useRef(null);
//   const profileImgRef = useRef(null);

//   const { username } = useParams();

//   const { follow, isPending } = useFollow();
//   const { data: authUser } = useQuery({ queryKey: ["authUser"] });

//   const {
//     data: user,
//     isLoading,
//     refetch,
//     isRefetching,
//   } = useQuery({
//     queryKey: ["userProfile"],
//     queryFn: async () => {
//       try {
//         const res = await fetch(`/api/users/profile/${username}`);
//         const data = await res.json();
//         if (!res.ok) {
//           throw new Error(data.error || "Something went wrong");
//         }
//         return data;
//       } catch (error) {
//         throw new Error(error);
//       }
//     },
//   });

//   const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

//   const isMyProfile = authUser?._id === user?._id;
//   const memberSinceDate = formatMemberSinceDate(user?.createdAt);
//   const amIFollowing = authUser?.following.includes(user?._id);

//   const handleImgChange = async (e, state) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         if (state === "coverImg") setCoverImg(reader.result);
//         if (state === "profileImg") setProfileImg(reader.result);
//       };
//       reader.readAsDataURL(file);

//       try {
//         const storageRef = ref(storage, `images/${authUser._id}/${state}-${Date.now()}`);
//         const snapshot = await uploadBytes(storageRef, file);
//         const downloadURL = await getDownloadURL(snapshot.ref);
//         await updateProfile({ [state]: downloadURL });
//         state === "coverImg" && setCoverImg(null);
//         state === "profileImg" && setProfileImg(null);
//       } catch (error) {
//         console.error("Erreur lors du téléchargement de l'image :", error);
//       }
//     }
//   };

//   useEffect(() => {
//     refetch();
//   }, [username, refetch]);

//   return (
//     <>
//       <div className='flex-[4_4_0] border-r border-gray-700 min-h-screen'>
//         {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
//         {!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
//         <div className='flex flex-col'>
//           {!isLoading && !isRefetching && user && (
//             <>
//               {/* Header */}
//               <div className='flex gap-10 px-4 py-2 items-center'>
//                 <Link to='/'>
//                   <FaArrowLeft className='w-4 h-4' />
//                 </Link>
//                 <div className='flex flex-col'>
//                   <p className='font-bold text-lg'>{user?.username}</p>
//                   <span className='text-sm text-slate-500'>{user?.posts?.length} posts</span>
//                 </div>
//               </div>

//               {/* Cover Image */}
//               <div className='relative group/cover'>
//                 <img
//                   src={coverImg || user?.coverImg || "/cover.png"}
//                   className='h-52 w-full object-cover'
//                   alt='cover image'
//                 />
//                 {isMyProfile && (
//                   <div
//                     className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
//                     onClick={() => coverImgRef.current.click()}
//                   >
//                     <MdEdit className='w-5 h-5 text-white' />
//                   </div>
//                 )}
//                 <input
//                   type='file'
//                   hidden
//                   accept='image/*'
//                   ref={coverImgRef}
//                   onChange={(e) => handleImgChange(e, "coverImg")}
//                 />
//                 <input
//                   type='file'
//                   hidden
//                   accept='image/*'
//                   ref={profileImgRef}
//                   onChange={(e) => handleImgChange(e, "profileImg")}
//                 />

//                 {/* User Avatar */}
//                 <div className='avatar absolute -bottom-16 left-4'>
//                   <div className='w-32 rounded-full relative group/avatar'>
//                     <img src={profileImg || user?.profileImg || "/avatar-placeholder.png"} />
//                     <div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
//                       {isMyProfile && (
//                         <MdEdit
//                           className='w-4 h-4 text-white'
//                           onClick={() => profileImgRef.current.click()}
//                         />
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className='flex justify-end px-4 mt-5'>
//                 {isMyProfile && <EditProfileModal authUser={authUser} />}
//                 {!isMyProfile && (
//                   <>
//                     <button
//                       className='btn btn-outline rounded-full btn-sm'
//                       onClick={() => follow(user?._id)}
//                     >
//                       {isPending && "Loading..."}
//                       {!isPending && amIFollowing && "Unfollow"}
//                       {!isPending && !amIFollowing && "Follow"}
//                     </button>
//                     <button
//                       className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
//                       onClick={() => console.log("Redirecting to messaging...")}
//                     >
//                       Message
//                     </button>
//                   </>
//                 )}
//                 {(coverImg || profileImg) && (
//                   <button
//                     className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
//                     onClick={async () => {
//                       await updateProfile({ coverImg, profileImg });
//                       setProfileImg(null);
//                       setCoverImg(null);
//                     }}
//                   >
//                     {isUpdatingProfile ? "Updating..." : "Update"}
//                   </button>
//                 )}
//               </div>

//               {/* User Info */}
//               <div className='flex flex-col gap-4 mt-14 px-4'>
//                 <div className='flex flex-col'>
//                   <span className='font-bold text-lg'>{user?.firstName} {user?.lastName}</span>
//                   <span className='text-sm text-slate-500'>@{user?.username}</span>
//                   <span className='text-sm my-1'>{user?.bio}</span>
//                 </div>

//                 <div className='flex gap-2 flex-wrap'>
//                   {user?.link && (
//                     <div className='flex gap-1 items-center'>
//                       <FaLink className='w-3 h-3 text-slate-500' />
//                       <a
//                         href={user?.link}
//                         target='_blank'
//                         rel='noreferrer'
//                         className='text-sm text-blue-500 hover:underline'
//                       >
//                         {user?.link}
//                       </a>
//                     </div>
//                   )}
//                   <div className='flex gap-2 items-center'>
//                     <IoCalendarOutline className='w-4 h-4 text-slate-500' />
//                     <span className='text-sm text-slate-500'>{memberSinceDate}</span>
//                   </div>
//                 </div>

//                 <div className='flex gap-2'>
//                   <div className='flex gap-1 items-center'>
//                     <span className='font-bold text-xs'>{user?.following.length}</span>
//                     <span className='text-slate-500 text-xs'>Following</span>
//                   </div>
//                   <div className='flex gap-1 items-center'>
//                     <span className='font-bold text-xs'>{user?.followers.length}</span>
//                     <span className='text-slate-500 text-xs'>Followers</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Feed Navigation */}
//               <div className='flex w-full border-b border-gray-700 mt-4'>
//                 <div
//                   className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
//                   onClick={() => setFeedType("posts")}
//                 >
//                   Posts
//                   {feedType === "posts" && (
//                     <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
//                   )}
//                 </div>

//                 {isMyProfile && (
//                   <div
//                     className='flex justify-center flex-1 p-3 text-slate-500 hover:bg-secondary transition duration-300 relative cursor-pointer'
//                     onClick={() => setFeedType("likes")}
//                   >
//                     Liked Posts
//                     {feedType === "likes" && (
//                       <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
//                     )}
//                   </div>
//                 )}

//                 <div
//                   className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
//                   onClick={() => setFeedType("followers")}
//                 >
//                   Followers
//                   {feedType === "followers" && (
//                     <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
//                   )}
//                 </div>

//                 <div
//                   className='flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 relative cursor-pointer'
//                   onClick={() => setFeedType("following")}
//                 >
//                   Following
//                   {feedType === "following" && (
//                     <div className='absolute bottom-0 w-10 h-1 rounded-full bg-primary' />
//                   )}
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Feed Content */}
//           {feedType === "followers" ? (
//             <FollowersList userId={user?._id} />
//           ) : feedType === "following" ? (
//             <FollowingList userId={user?._id} />
//           ) : (
//             <Posts feedType={feedType} username={username} userId={user?._id} />
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default ProfilePage;




import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import FollowersList from "../../components/common/FollowersList";
import FollowingList from "../../components/common/FollowingList";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";


const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");


  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);


  const { username } = useParams();


  const { follow, isPending } = useFollow();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });


  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });


  const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();


  const isMyProfile = authUser?._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following.includes(user?._id);


  const handleImgChange = async (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (state === "coverImg") setCoverImg(reader.result);
        if (state === "profileImg") setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);


      try {
        const storageRef = ref(storage, `images/${authUser._id}/${state}-${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        await updateProfile({ [state]: downloadURL });
        state === "coverImg" && setCoverImg(null);
        state === "profileImg" && setProfileImg(null);
      } catch (error) {
        console.error("Erreur lors du téléchargement de l'image :", error);
      }
    }
  };


  useEffect(() => {
    refetch();
  }, [username, refetch]);


  return (
    <>
      <div className='flex-[4_4_0] border-r border-gray-700 min-h-screen'>
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
        <div className='flex flex-col'>
          {!isLoading && !isRefetching && user && (
            <>
              {/* Header */}
              <div className='flex gap-10 px-4 py-2 items-center'>
                <Link to='/'>
                  <FaArrowLeft className='w-4 h-4' />
                </Link>
                <div className='flex flex-col'>
                  <p className='font-bold text-lg'>{user?.username}</p>
                  <span className='text-sm text-slate-500'>{user?.posts?.length} posts</span>
                </div>
              </div>


              {/* Cover Image */}
              <div className='relative group/cover'>
                <img
                  src={coverImg || user?.coverImg || "/cover.png"}
                  className='h-52 w-full object-cover'
                  alt='cover image'
                />
                {isMyProfile && (
                  <div
                    className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className='w-5 h-5 text-white' />
                  </div>
                )}
                <input
                  type='file'
                  hidden
                  accept='image/*'
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type='file'
                  hidden
                  accept='image/*'
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />


                {/* User Avatar */}
                <div className='avatar absolute -bottom-16 left-4'>
                  <div className='w-32 rounded-full relative group/avatar'>
                    <img src={profileImg || user?.profileImg || "/avatar-placeholder.png"} />
                    <div className='absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer'>
                      {isMyProfile && (
                        <MdEdit
                          className='w-4 h-4 text-white'
                          onClick={() => profileImgRef.current.click()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {/* Actions */}
              <div className='flex justify-end px-4 mt-5'>
                {isMyProfile && <EditProfileModal authUser={authUser} />}
                {!isMyProfile && (
                  <>
                    <button
                      className='btn btn-outline rounded-full btn-sm'
                      onClick={() => follow(user?._id)}
                    >
                      {isPending && "Loading..."}
                      {!isPending && amIFollowing && "Unfollow"}
                      {!isPending && !amIFollowing && "Follow"}
                    </button>
                    <button
                      className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
                      onClick={() => console.log("Redirecting to messaging...")}
                    >
                      Message
                    </button>
                  </>
                )}
                {(coverImg || profileImg) && (
                  <button
                    className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
                    onClick={async () => {
                      await updateProfile({ coverImg, profileImg });
                      setProfileImg(null);
                      setCoverImg(null);
                    }}
                  >
                    {isUpdatingProfile ? "Updating..." : "Update"}
                  </button>
                )}
              </div>


              {/* User Info */}
              <div className='flex flex-col gap-4 mt-14 px-4'>
                <div className='flex flex-col'>
                  <span className='font-bold text-lg'>{user?.firstName} {user?.lastName}</span>
                  <span className='text-sm text-slate-500'>@{user?.username}</span>
                  <span className='text-sm my-1'>{user?.bio}</span>
                </div>


                <div className='flex gap-2 flex-wrap'>
                  {user?.link && (
                    <div className='flex gap-1 items-center'>
                      <FaLink className='w-3 h-3 text-slate-500' />
                      <a
                        href={user?.link}
                        target='_blank'
                        rel='noreferrer'
                        className='text-sm text-blue-500 hover:underline'
                      >
                        {user?.link}
                      </a>
                    </div>
                  )}
                  <div className='flex gap-2 items-center'>
                    <IoCalendarOutline className='w-4 h-4 text-slate-500' />
                    <span className='text-sm text-slate-500'>{memberSinceDate}</span>
                  </div>
                </div>


                <div className='flex gap-2'>
                  <div className='flex gap-1 items-center'>
                    <span className='font-bold text-xs'>{user?.following.length}</span>
                    <span className='text-slate-500 text-xs'>Following</span>
                  </div>
                  <div className='flex gap-1 items-center'>
                    <span className='font-bold text-xs'>{user?.followers.length}</span>
                    <span className='text-slate-500 text-xs'>Followers</span>
                  </div>
                </div>
              </div>


              {/* Feed Navigation */}
              <div className='flex w-full border-b border-gray-700 mt-4'>
                <div
                  className='flex justify-center flex-1 p-3 text-[#001E36] hover: transition duration-300 relative cursor-pointer'
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className='absolute bottom-0 w-10 h-1 rounded-full bg-[#1A3D5E]'  />
                  )}
                </div>


                {isMyProfile && (
                  <div
                    className='flex justify-center flex-1 p-3 text-[#001E36] hover: transition duration-300 relative cursor-pointer'
                    onClick={() => setFeedType("likes")}
                  >
                    Liked Posts
                    {feedType === "likes" && (
                      <div className='absolute bottom-0 w-10 h-1 rounded-full bg-[#1A3D5E]'  />
                    )}
                  </div>
                )}


                <div
                  className='flex justify-center flex-1 p-3 text-[#001E36] hover: transition duration-300 relative cursor-pointer'
                  onClick={() => setFeedType("followers")}
                >
                  Followers
                  {feedType === "followers" && (
                    <div className='absolute bottom-0 w-10 h-1 rounded-full bg-[#1A3D5E]' />
                  )}
                </div>


                <div
                  className='flex justify-center flex-1 p-3 text-[#001E36] hover: transition duration-300 relative cursor-pointer'
                  onClick={() => setFeedType("following")}
                >
                  Following
                  {feedType === "following" && (
                    <div className='absolute bottom-0 w-10 h-1 rounded-full bg-[#1A3D5E]' />
                  )}
                </div>
              </div>
            </>
          )}


          {/* Feed Content */}
          {feedType === "followers" ? (
            <FollowersList userId={user?._id} />
          ) : feedType === "following" ? (
            <FollowingList userId={user?._id} />
          ) : (
            <Posts feedType={feedType} username={username} userId={user?._id} />
          )}
        </div>
      </div>
    </>
  );
};


export default ProfilePage;

