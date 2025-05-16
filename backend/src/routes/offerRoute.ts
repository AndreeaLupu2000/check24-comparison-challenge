// src/routes/offerRoute.ts

import { Router, RequestHandler } from "express";
import { getOffersHandler, streamOffersHandler, getLateOffersHandler, createOfferHandler, getOfferByIdHandler } from "../controllers/offerController";

/**
 * Router for the offers route
 * @returns 
 */
const router = Router();


// Post request to get offers
router.post("/", getOffersHandler as RequestHandler);
router.post("/create", createOfferHandler as RequestHandler);
router.get("/search/:id", getOfferByIdHandler as RequestHandler);

/**
 * Get request to stream offers to enable Server-Sent Events
 * @returns 
 */
router.get("/stream",  streamOffersHandler as RequestHandler);


router.get("/late-offers", getLateOffersHandler as RequestHandler);

export default router;
