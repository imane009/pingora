import express from "express";
import { createNote, getAllNotes, deleteNote } from "../controllers/note.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Route pour créer une note
router.post("/", protectRoute, createNote);

// Route pour récupérer toutes les notes
router.get("/", protectRoute, getAllNotes);

// Route pour supprimer une note
router.delete("/:id", protectRoute, deleteNote);



export default router;