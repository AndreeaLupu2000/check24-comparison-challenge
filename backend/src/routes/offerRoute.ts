// src/routes/offerRoute.ts

import { Router, RequestHandler } from "express";
import { getOffersHandler } from "../controllers/offerController";

/**
 * Router for the offers route
 * @returns 
 */
const router = Router();

// Post request to get offers
router.post("/offers", getOffersHandler as RequestHandler);

export default router;
