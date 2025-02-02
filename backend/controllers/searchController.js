import Post from "../models/post.model.js"; 
import User from "../models/user.model.js"; 
 
export const search = async (req, res) => { 
    const { q } = req.query; // Requête de recherche 
 
    try { 
        // Recherche des utilisateurs 
        const users = await User.find({ 
            $or: [ 
                { username: { $regex: q, $options: "i" } }, // Recherche insensible à la casse 
                { email: { $regex: q, $options: "i" } } 
            ] 
        }).select("-password").sort({ username: 1 }); // Tri par nomd'utilisateur (ordre alphabétique croissant) 
 
        // Recherche des posts 
        const posts = await Post.find({ 
            $or: [ 
                { text: { $regex: q, $options: "i" } }, // Recherche dans le texte des posts 
                { img: { $regex: q, $options: "i" } }, // Recherche d'images ou vidéos 
                { videos: { $regex: q, $options: "i" } } 
            ] 
        }).populate('user', '-password').sort({ text: 1 }); // Tri par texte du post (ordre alphabétique croissant) 
 
        // Retourner les résultats de la recherche 
        res.status(200).json({ users, posts }); 
    } catch (error) { 
        console.log("Error in search controller: ", error); 
        res.status(500).json({ error: "Internal server error" }); 
    } 
}; 
/*import Post from "../models/post.model.js"; 
import User from "../models/user.model.js"; 
 
export const search = async (req, res) => { 
    const { q } = req.query; // Requête de recherche 
 
    try { 
        // Recherche des utilisateurs 
        const users = await User.find({ 
            $or: [ 
                { username: { $regex: q, $options: "i" } }, // 
Recherche insensible à la casse 
                { email: { $regex: q, $options: "i" } } 
            ] 
        }).select("-password").sort({ username: 1 }); // Tri par nom 
d'utilisateur (ordre alphabétique croissant) 
 
        // Recherche des posts publics uniquement 
        const posts = await Post.find({ 
            $and: [ 
                { isPublic: true }, // Filtrer par posts publics 
                { 
                    $or: [ 
                        { text: { $regex: q, $options: "i" } }, // 
Recherche dans le texte des posts 
                        { img: { $regex: q, $options: "i" } }, // 
Recherche d'images ou vidéos 
                        { videos: { $regex: q, $options: "i" } } 
                    ] 
                } 
            ] 
        }).populate('user', '-password').sort({ text: 1 }); // Tri par 
texte du post (ordre alphabétique croissant) 
 
        // Retourner les résultats de la recherche 
        res.status(200).json({ users, posts }); 
    } catch (error) { 
        console.log("Error in search controller: ", error); 
        res.status(500).json({ error: "Internal server error" }); 
    } 
}; 
*/ 
 