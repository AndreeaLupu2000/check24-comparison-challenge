import { Router, Request, Response } from "express";
import { createSharedOffer, getSharedOffer, updateSharedOffer, deleteSharedOffer, getAllSharedOffers } from "../controllers/shareController";

const router = Router();

router.post("/share", createSharedOffer);
router.get("/share/:id", getSharedOffer);
router.put("/share/:id", updateSharedOffer);
router.delete("/share/:id", deleteSharedOffer);
router.get("/share", getAllSharedOffers);

export default router;

