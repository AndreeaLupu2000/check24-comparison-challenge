import { Router, RequestHandler } from "express";
import { createSharedOffer, getSharedOffer, updateSharedOffer, deleteSharedOffer, getAllSharedOffers } from "../controllers/shareController";

const router = Router();

router.post("/", createSharedOffer)
router.get("/", getAllSharedOffers)
router.get("/:id", getSharedOffer)
router.put("/:id", updateSharedOffer as RequestHandler)
router.delete("/:id", deleteSharedOffer)

export default router;

