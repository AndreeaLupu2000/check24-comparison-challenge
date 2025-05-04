import { Router, Request, Response } from "express";
import { createShareOffer, getShareOffer, updateShareOffer, deleteShareOffer, getAllShareOffers } from "../controllers/shareController";

const router = Router();

router.post("/shareOffer", createShareOffer);
router.get("/shareOffer/:id", getShareOffer);
router.put("/shareOffer/:id", updateShareOffer);
router.delete("/shareOffer/:id", deleteShareOffer);
router.get("/shareOffer", getAllShareOffers);

export default router;

