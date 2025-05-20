import { Router, RequestHandler } from 'express';
import { createAddress, getAllAddresses } from '../controllers/addressController';

const router = Router();

router.post('/', createAddress as RequestHandler);
router.get('/', getAllAddresses as RequestHandler);

export default router;

