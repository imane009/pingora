// import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";

// const FollowingList = ({ userId }) => {
// 	const [following, setFollowing] = useState([]);
// 	const [loading, setLoading] = useState(true);

// 	useEffect(() => {
// 		const fetchFollowing = async () => {
// 			try {
// 				const res = await fetch(`/api/users/${userId}/following`);
// 				const data = await res.json();
// 				if (!res.ok) {
// 					throw new Error(data.error || "Failed to fetch following");
// 				}
// 				setFollowing(data);
// 			} catch (error) {
// 				console.error("Error fetching following:", error.message);
// 			} finally {
// 				setLoading(false);
// 			}
// 		};

// 		fetchFollowing();
// 	}, [userId]);

// 	if (loading) {
// 		return <p>Loading following...</p>;
// 	}

// 	if (following.length === 0) {
// 		return <p>Aucune personne suivi.</p>;
// 	}

// 	return (
// 		<div className="following-list">
// 			{following.map((followedUser) => (
// 				<div key={followedUser._id} className="following-item flex items-center gap-4">
// 				  {/* Lien pour rediriger vers le profil */}
// 			     <Link to={`/profile/${followedUser.username}`} className="flex items-center gap-4 w-full">
							 
// 					<img
// 						src={followedUser.profileImg || "/avatar-placeholder.png"}
// 						alt={`${followedUser.username}'s profile`}
// 						className="w-10 h-10 rounded-full"
// 					/>
// 					<span>{followedUser.username}</span>
// 				 </Link>
// 				</div>
// 			))}
// 		</div>
// 	);
// };

// export default FollowingList;



import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


const FollowingList = ({ userId }) => {
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
 
    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const res = await fetch(`/api/users/${userId}/following`);
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Failed to fetch following");
                }
                setFollowing(data);
            } catch (error) {
                console.error("Error fetching following:", error.message);
            } finally {
                setLoading(false);
            }
        };


        fetchFollowing();
    }, [userId]);


    if (loading) {
        return <p>Loading following...</p>;
    }


    if (following.length === 0) {
        return <p>Aucune personne suivi.</p>;
    }


    return (
        <div className="following-list p-4">
            {following.map((followedUser) => (
                <div key={followedUser._id} className="follower-item flex items-center justify-between gap-4 p-2 bg-gray-800 rounded-md mb-2"
                style={{ backgroundColor: "#D0D7E1" }}>
                  {/* Lien pour rediriger vers le profil */}
                 <Link to={`/profile/${followedUser.username}`} className="flex items-center gap-4 w-full">
                             
                    <img
                        src={followedUser.profileImg || "/avatar-placeholder.png"}
                        alt={`${followedUser.username}'s profile`}
                        className="w-10 h-10 rounded-full"
                    />
                    <span>{followedUser.username}</span>
                 </Link>
                </div>
            ))}
        </div>
    );
};


export default FollowingList;




