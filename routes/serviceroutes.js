import express from 'express';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} from '../controllers/servicecontroller.js';

const router = express.Router();

// CRUD routes
router.post('/', createService);        // Create
router.get('/', getServices);           // Get all
router.get('/:id', getServiceById);     // Get one
router.put('/:id', updateService);      // Update
router.delete('/:id', deleteService);   // Delete

export default router;