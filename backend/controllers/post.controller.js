import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";


export const createPost = async (req, res) => {
	try {
		const { text, img, videos, audience } = req.body;
		const userId = req.user._id.toString();

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		// Vérification si le post a au moins un contenu (texte, image ou vidéo)
		if (!text && (!img || img.length === 0) && (!videos || videos.length === 0)) {
			return res.status(400).json({ error: "Post must have text, image, or video" });
		}

		// Création du post 
		const newPost = new Post({
			user: userId,
			text,
			img,
			videos,
			audience: audience || 'public',
		});

		await newPost.save();

		res.status(201).json(newPost);
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
		console.log("Error in createPost controller: ", error);
	}
};


export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "You are not authorized to delete this post" });
		}



		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};



export const likeUnlikePost = async (req, res) => {
	try {
		const userId = req.user._id;
		const { id: postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

			const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString());
			res.status(200).json(updatedLikes);
		} else {
			// Like post
			post.likes.push(userId);
			await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
				postId: post._id,
			});
			await notification.save();

			const updatedLikes = post.likes;
			res.status(200).json(updatedLikes);
		}
	} catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

import { ObjectId } from "mongodb"; // Importation d'ObjectId avec import

export const getAllPosts = async (req, res) => {
	// Vérification de l'utilisateur connecté
	if (!req.user) {
		return res.status(401).json({ error: "Utilisateur non authentifié" });
	}

	const userId = req.user._id; // L'ID de l'utilisateur connecté
	try {
		// Récupération de l'utilisateur connecté
		const user = await User.findById(userId);

		// Vérifie si l'utilisateur existe
		if (!user) {
			return res.status(404).json({ error: "Utilisateur introuvable" });
		}

		// Convertir les followers en ObjectId
		const followerIds = user.followers // Les abonnés (followers) de l'utilisateur

		// Récupération des posts en fonction de l'audience et de l'utilisateur connecté
		const posts = await Post.find({
			$or: [
				{ audience: "public" }, // Posts publics (visibles par tout le monde)
				{
					audience: "friends", // Posts des amis (visibles pour l'utilisateur et ses followers)
					$or: [
						{ user: userId }, // Posts de l'utilisateur connecté
						{ user: { $in: followerIds } }, // Posts des abonnés de l'utilisateur
					],
				},
				{
					audience: "private", // Posts privés (visibles uniquement par l'utilisateur)
					user: userId, // Posts de l'utilisateur connecté
				},
			],
		})
			.sort({ createdAt: -1 }) // Trie les posts du plus récent au plus ancien
			.populate({
				path: "user",
				select: "-password", // Exclut le mot de passe de l'utilisateur
			})
			.populate({
				path: "comments", // Remplit les commentaires associés au post
				populate: {
					path: "user", // Remplit l'utilisateur qui a posté chaque commentaire
					select: "-password", // Exclut le mot de passe de l'utilisateur des commentaires
				},
			});

		// Si aucun post n'est trouvé
		if (posts.length === 0) {
			return res.status(200).json([]); // Retourne un tableau vide
		}

		// Retourne les posts avec les commentaires
		res.status(200).json(posts);
	} catch (error) {
		console.log("Erreur dans getAllPosts :", error);
		res.status(500).json({ error: "Erreur interne du serveur" });
	}
};






export const getLikedPosts = async (req, res) => {
	const userId = req.params.id;

	try {
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(likedPosts);
	} catch (error) {
		console.log("Error in getLikedPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ error: "User not found" });

		const following = user.following;

		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({ createdAt: -1 })
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			});

		res.status(200).json(feedPosts);
	} catch (error) {
		console.log("Error in getFollowingPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params;

		// Trouver l'utilisateur par son username
		const user = await User.findOne({ username }).select("-password"); // Exclure le mot de passe
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		//  Récupérer les posts de l'utilisateur
		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 }) // Trier par date de création décroissante
			.populate({
				path: "user",
				select: "-password", // Exclure le mot de passe de l'utilisateur
			})
			.populate({
				path: "comments.user",
				select: "-password", // Exclure le mot de passe des utilisateurs des commentaires
			});

		// Vérifier si des posts ont été trouvés
		if (posts.length === 0) {
			return res.status(200).json([]); // Retourner un tableau vide si aucun post n'est trouvé
		}

		// Retourner les posts
		res.status(200).json(posts);
	} catch (error) {
		console.log("Error in getUserPosts controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getPostById = async (req, res) => {
	const { postId } = req.params; // ID du post dans les paramètres de l'URL
	try {
		// Recherche du post par ID et récupération des commentaires
		const post = await Post.findById(postId)
			.populate({
				path: "user", // Charger l'utilisateur qui a créé le post
				select: "-password", // Exclure le mot de passe
			})
			.populate({
				path: "comments.user", // Charger l'utilisateur qui a commenté
				select: "-password", // Exclure le mot de passe
			});

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.status(200).json(post); // Retourne le post avec les commentaires
	} catch (error) {
		console.error("Error in getPostById controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
};



// Mettre à jour un post
export const updatePost = async (req, res) => {
	const { postId } = req.params; // ID du post à mettre à jour
	const { text, img, mediaType  } = req.body; // Données de la mise à jour

	try {
		// Rechercher le post par son ID
		const post = await Post.findById(postId);
		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Not authorized to update this post" });
		}

		if (!post) {
			return res.status(404).json({ message: "Post non trouvé" });
		}

		if (text) post.text = text;
		if (img) {
			post.img = img;
			post.mediaType = 'image'; // Met à jour le type média en "image"
		}
		if (mediaType === 'video') {
			post.mediaType = 'video'; // Assigner le type "video"
			post.img = null; // Supprime l'image si une vidéo est ajoutée
		}

		

		// Sauvegarder les modifications
		const updatedPost = await post.save();

		return res.status(200).json({
			message: "Post mis à jour avec succès",
			post: updatedPost,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Erreur serveur", error: error.message });
	}
};

