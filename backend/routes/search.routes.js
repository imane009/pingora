import express from 'express'; 
import { search } from '../controllers/searchController.js'; 
 
const router = express.Router(); 
 
// Route pour la recherche 
router.get('/', search);  // La recherche est accessible via /api/search 
 
export default router;