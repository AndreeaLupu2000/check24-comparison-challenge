// src/routes/offerRoute.ts

import { Router, RequestHandler } from "express";
import { streamOffersHandler } from "../controllers/offerController";

/**
 * Router for the offers route
 * @returns 
 */
const router = Router();


/**
 * Get request to stream offers to enable Server-Sent Events
 * @returns 
 */
router.get("/stream",  streamOffersHandler as RequestHandler);


export default router;
