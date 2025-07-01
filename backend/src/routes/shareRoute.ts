import { Router, RequestHandler } from "express";
import { createSharedOffer, getSharedOffer } from "../controllers/shareController";

const router = Router();

router.post("/", createSharedOffer)
router.get("/:id", getSharedOffer)

export default router;

