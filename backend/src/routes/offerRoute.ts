// src/routes/offerRoute.ts

import { Router, RequestHandler } from "express";
import { getOffersHandler, streamOffersHandler, getLateOffersHandler } from "../controllers/offerController";

/**
 * Router for the offers route
 * @returns 
 */
const router = Router();

// Post request to get offers
router.post("/offers", getOffersHandler as RequestHandler);

/**
 * Get request to stream offers to enable Server-Sent Events
 * @returns 
 */
router.get("/offers/stream",  streamOffersHandler as RequestHandler);


router.get("/late-offers", getLateOffersHandler as RequestHandler);

export default router;
