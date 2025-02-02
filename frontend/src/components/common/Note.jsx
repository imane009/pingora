// import { useState, useEffect } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { toast } from "react-hot-toast";

// const NotesPage = () => {
//     const [noteContent, setNoteContent] = useState("");
//     const [notes, setNotes] = useState([]);
//     const [selectedNote, setSelectedNote] = useState(null);

//     // Récupération de l'utilisateur connecté
//     const { data: authUser, isLoading: authLoading } = useQuery({
//         queryKey: ["authUser"],
//         queryFn: async () => {
//             const res = await fetch("/api/auth/user");
//             const data = await res.json();
//             if (!res.ok) {
//                 throw new Error(data.error || "Unable to fetch user");
//             }
//             return data;
//         },
//     });

//     const fetchNotes = async () => {
//         const res = await fetch("/api/notes");
//         const data = await res.json();
//         if (!res.ok) {
//             throw new Error(data.error || "Unable to fetch notes");
//         }
//         return data;
//     };

//     const { data, isLoading, refetch } = useQuery({
//         queryKey: ["notes"],
//         queryFn: fetchNotes,
//     });

//     useEffect(() => {
//         if (data) {
//             setNotes(data);
//         }
//     }, [data]);

//     const createNoteMutation = useMutation({
//         mutationFn: async (note) => {
//             const res = await fetch("/api/notes", {
//                 method: "POST",
//                 body: JSON.stringify(note),
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             });

//             const data = await res.json();
//             if (!res.ok) {
//                 throw new Error(data.error || "Unable to create note");
//             }

//             return data;
//         },
//         onSuccess: (newNote) => {
//             setNotes((prevNotes) => [
//                 ...prevNotes,
//                 { ...newNote, user: authUser }, // Inclure l'utilisateur connecté
//             ]);
//             toast.success("Note créée avec succès !");
//             setNoteContent("");
//         },
//         onError: (error) => {
//             toast.error(error.message || "Une erreur est survenue !");
//         },
//     });

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (noteContent.trim()) {
//             createNoteMutation.mutate({ content: noteContent });
//         }
//     };

//     const handleDeleteNote = async (noteId) => {
//         try {
//             const res = await fetch(`/api/notes/${noteId}`, {
//                 method: "DELETE",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             });

//             const data = await res.json();
//             if (!res.ok) {
//                 throw new Error(data.error || "Unable to delete the note");
//             }

//             setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
//             toast.success("Note supprimée avec succès !");
//         } catch (error) {
//             toast.error(error.message || "Une erreur est survenue lors de la suppression !");
//         }
//     };

//     const toggleOptions = (noteId) => {
//         setSelectedNote((prev) => (prev === noteId ? null : noteId));
//     };

//     if (authLoading) {
//         return <p>Chargement des informations utilisateur...</p>;
//     }

//     return (
//         <div className="p-6">
//             {/* Partie de création de la note */}
//             <div className="flex items-center">
//                 <img
//                     src={authUser.profileImg || "/avatar-placeholder.png"} // Utilisation de l'image de profil
//                     alt="Me"
//                     className="w-12 h-12 rounded-full mr-3"
//                 />
//                 <div>
//                     <p className="font-bold text-black">{authUser.username}</p>
//                     <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
//                         <input
//                             placeholder="Ajouter une note"
//                             value={noteContent}
//                             onChange={(e) => setNoteContent(e.target.value)}
//                             onKeyDown={(e) => {
//                                 if (e.key === "Enter" && !e.shiftKey) {
//                                     handleSubmit(e);
//                                 }
//                             }}
//                             className="w-full p-2 rounded-xl bg-gray-100 border-none outline-none "
                            
//                         />
//                     </form>
//                 </div>
//             </div>

//             {/* Liste des notes */}
//             <div className="space-y-1">
//                 {isLoading ? (
//                     <p>Chargement des notes...</p>
//                 ) : (
//                     notes.map((note) => (
//                         <div key={note._id} className="mt-4 p-2 w-64">
//                             <div className="flex items-center mb-2">
//                                 <img
//                                     src={note.user?.profileImg || "/avatar-placeholder.png"} // Image de profil de l'auteur de la note
//                                     alt={note.user?.username}
//                                     className="w-8 h-8 rounded-full mr-3"
//                                 />
//                                 <p className="font-bold text-black">{note.user?.username}</p>
//                             </div>

//                             <div className="relative w-full p-2 rounded-xl bg-gray-100 border-none outline-none ">
                                
//                                 {/* Afficher le bouton uniquement si l'utilisateur est l'auteur de la note */}
//                                 {authUser._id === note.user?._id && (
//                                     <button
//                                         onClick={() => toggleOptions(note._id)}
//                                         className="absolute right-2 text-gray-600"
//                                     >
//                                         ⋮
//                                     </button>
//                                 )}

//                                 <p className="text-sm">{note.content}</p>

//                                 {selectedNote === note._id && (
//                                     <ul className="absolute right-0 mt-2 bg-white border rounded shadow-md text-sm">
//                                         <li
//                                             className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                                             onClick={() => handleDeleteNote(note._id)}
//                                         >
//                                             Supprimer
//                                         </li>
//                                     </ul>
//                                 )}
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// };

// export default NotesPage;



import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";


const NotesPage = () => {
    const [noteContent, setNoteContent] = useState("");
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);


    // Récupération de l'utilisateur connecté
    const { data: authUser, isLoading: authLoading } = useQuery({
        queryKey: ["authUser"],
        queryFn: async () => {
            const res = await fetch("/api/auth/user");
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Unable to fetch user");
            }
            return data;
        },
    });


    const fetchNotes = async () => {
        const res = await fetch("/api/notes");
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Unable to fetch notes");
        }
        return data;
    };


    const { data, isLoading, refetch } = useQuery({
        queryKey: ["notes"],
        queryFn: fetchNotes,
    });


    useEffect(() => {
        if (data) {
            setNotes(data);
        }
    }, [data]);


    const createNoteMutation = useMutation({
        mutationFn: async (note) => {
            const res = await fetch("/api/notes", {
                method: "POST",
                body: JSON.stringify(note),
                headers: {
                    "Content-Type": "application/json",
                },
            });


            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Unable to create note");
            }


            return data;
        },
        onSuccess: (newNote) => {
            setNotes((prevNotes) => [
                ...prevNotes,
                { ...newNote, user: authUser }, // Inclure l'utilisateur connecté
            ]);
            toast.success("Note créée avec succès !");
            setNoteContent("");
        },
        onError: (error) => {
            toast.error(error.message || "Une erreur est survenue !");
        },
    });


    const handleSubmit = (e) => {
        e.preventDefault();
        if (noteContent.trim()) {
            createNoteMutation.mutate({ content: noteContent });
        }
    };


    const handleDeleteNote = async (noteId) => {
        try {
            const res = await fetch(`/api/notes/${noteId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });


            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Unable to delete the note");
            }


            setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
            toast.success("Note supprimée avec succès !");
        } catch (error) {
            toast.error(error.message || "Une erreur est survenue lors de la suppression !");
        }
    };


    const toggleOptions = (noteId) => {
        setSelectedNote((prev) => (prev === noteId ? null : noteId));
    };


    if (authLoading) {
        return <p>Chargement des informations utilisateur...</p>;
    }


    return (
        <div className="p-6">
            {/* Partie de création de la note */}
            <div className="flex items-center">
                <img
                    src={authUser.profileImg || "/avatar-placeholder.png"} // Utilisation de l'image de profil
                    alt="Me"
                    className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                    <p className="font-bold text-black">{authUser.username}</p>
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                        <input
                            placeholder="Ajouter une note"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    handleSubmit(e);
                                }
                            }}
                            className="w-full p-2 rounded-xl bg-gray-100 border-none outline-none "


                        />
                    </form>
                </div>
            </div>


            {/* Liste des notes */}
            <div className="space-y-1">
                {isLoading ? (
                    <p>Chargement des notes...</p>
                ) : (
                    notes.map((note) => (
                        <div key={note._id} className="mt-4 p-2 w-64">
                            <div className="flex items-center mb-2">
                                <Link to={`/profile/${note.user?.username}`} className="flex items-center gap-4 w-full">
                                    <img src={note.user?.profileImg || "/avatar-placeholder.png"} // Image de profil de l'auteur de la note
                                        alt={note.user?.username} className="w-8 h-8 rounded-full mr-3" />
                                    <p className="font-bold text-black">{note.user?.username}</p>
                                </Link>
                            </div>


                            <div className="relative w-full p-2 rounded-xl bg-gray-100 border-none outline-none ">


                                {/* Afficher le bouton uniquement si l'utilisateur est l'auteur de la note */}
                                {authUser._id === note.user?._id && (
                                    <button
                                        onClick={() => toggleOptions(note._id)}
                                        className="absolute right-2 text-gray-600"
                                    >
                                        ⋮
                                    </button>
                                )}


                                <p className="text-sm">{note.content}</p>


                                {selectedNote === note._id && (
                                    <ul className="absolute right-0 mt-2 bg-white border rounded shadow-md text-sm">
                                        <li
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleDeleteNote(note._id)}
                                        >
                                            Supprimer
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


export default NotesPage;

