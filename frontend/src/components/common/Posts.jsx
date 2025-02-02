import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {

	// Récupération de l'utilisateur connecté
	const { data: authUser, isLoading: authLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			const res = await fetch("/api/auth/me");
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Unable to fetch user");
			}
			return data;
		},
	});



	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return "/api/posts/all";
			case "following":
				return "/api/posts/following";
			case "posts":
				return `/api/posts/user/${username}`;
			case "likes":
				return `/api/posts/likes/${userId}`;
			default:
				return "/api/posts/all";
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts = [], // Initialisation par défaut avec un tableau vide
		isLoading: postsLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT);
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


	// Fonction pour filtrer les posts en fonction de l'audience
	const filterPostsByAudience = (posts) => {
		if (!authUser) return []; // Si l'utilisateur n'est pas connecté, retournez un tableau vide

		return posts.filter((post) => {
			// Posts publics : visibles par tout le monde
			if (post.audience === "public") {
				return true;
			}


			// Posts pour les amis : visibles par l'utilisateur et ses followers
			if (post.audience === "friends") {
				// Vérifie si l'utilisateur ou ses followers peuvent voir le post
				return post.user._id === authUser._id || authUser.followers?.includes(post.user._id);
			}

			// Posts privés : visibles uniquement par l'utilisateur lui-même
			if (post.audience === "private") {
				return post.user._id === authUser._id; // Vérifiez si l'utilisateur est l'auteur du post
			}

			// Par défaut, ne pas afficher le post
			return false;
		});
	};

	console.log("Utilisateur connecté :", authUser);
	console.log("Posts récupérés :", posts);
	console.log("Posts filtrés :", filterPostsByAudience(posts));
	useEffect(() => {
		refetch();
	}, [feedType, refetch, username]);

	// Filtrer les posts en fonction de l'audience
	const filteredPosts = filterPostsByAudience(posts || []);

	// Si l'utilisateur ou les posts sont en cours de chargement, affichez un squelette
	if (authLoading || postsLoading || isRefetching) {
		return (
			<div className='flex flex-col justify-center'>
				<PostSkeleton />
				<PostSkeleton />
				<PostSkeleton />
			</div>
		);
	}

	// Si aucun post n'est trouvé après filtrage
	if (!authLoading && !postsLoading && !isRefetching && filteredPosts.length === 0) {
		return <p className='text-center my-4'>No posts in this tab. Switch 👻</p>;
	}

	// Afficher les posts filtrés
	return (
		<div>
			{filteredPosts.map((post) => (
				<Post key={post._id} post={post} />
			))}
		</div>
	);
};



export default Posts;