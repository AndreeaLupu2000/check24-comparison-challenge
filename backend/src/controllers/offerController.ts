// src/controllers/OfferController.ts

import { Request, Response } from "express";
import { getAllOffers } from "../services/OfferService";
import { AddressInput } from "../models/AddressModel";

/**
 * Get offers handler
 * @param req 
 * @param res 
 */
export const getOffersHandler = async (req: Request, res: Response) => {
  try {

    const input: AddressInput = req.body;

    // Check if the address is valid
    if (!input || !input.street || !input.houseNumber || !input.city || !input.plz) {
      return res.status(400).json({ error: "Missing address fields." });
    }

    // Get all offers
    const offers = await getAllOffers(input);

    res.status(200).json({ offers });
  } catch (err) {
    console.error("[getOffersHandler] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
