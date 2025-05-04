// src/controllers/OfferController.ts

import { Request, Response } from "express";
import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { ByteMeAdapter } from "../adapters/bytemeAdapter";
import { WebWunderAdapter } from "../adapters/webwunderAdapter";
import { PingPerfectAdapter } from "../adapters/pingperfectAdapter";
import { VerbynDichAdapter } from "../adapters/verbyndichAdapter";
import { ServusSpeedAdapter } from "../adapters/servusspeedAdapter";
import { retryWithTimeout } from "./utils/retry";

const providers = [
  ByteMeAdapter,
  WebWunderAdapter,
  PingPerfectAdapter,
  VerbynDichAdapter,
  ServusSpeedAdapter
];


/**
 * Get offers handler
 * @param req 
 * @param res 
 */
export const getOffersHandler = async (req: Request, res: Response) => {
  try {

    const input: AddressInput = req.body;
    const address = {
      street: input.street,
      houseNumber: input.houseNumber,
      city: input.city,
      plz: input.plz
    };

    console.log("[offerController] Getting offers for address:", address);

    // Check if the address is valid
    if (!input || !input.street || !input.houseNumber || !input.city || !input.plz) {
      return res.status(400).json({ error: "Missing address fields." });
    }



    const results = await Promise.allSettled(
      providers.map(p => retryWithTimeout(() => p.getOffers(address)))
    );

    const offers: Offer[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        offers.push(...result.value);
      } else {
        console.warn("[offers.service] Provider failed:", result.reason);
      }
    }

    res.status(200).json({ offers });
  } catch (err) {
    console.error("[getOffersHandler] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Stream offers handler to enable Server-Sent Events to send offers as soon as they are available, not to wait for the whole request to finish.
 * Enables a more responsive user experience without any delays.
 * @param req 
 * @param res 
 */
export const streamOffersHandler = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { street, houseNumber, city, plz } = req.query;

  if (!street || !houseNumber || !city || !plz) {
    res.write(`event: error\ndata: Missing or invalid address fields\n\n`);
    res.end();
    return;
  }

  const address: AddressInput = {
    street: street as string,
    houseNumber: houseNumber as string,
    city: city as string,
    plz: plz as string
  };

  const sendOffer = (offer: Offer) => {
    res.write(`data: ${JSON.stringify(offer)}\n\n`);
  };

  const tasks = providers.map(async (adapter) => {
    try {
      const offers = await adapter.getOffers(address);
      offers.forEach(sendOffer);
    } catch (err) {
      console.error(`[${adapter.constructor.name}] failed:`, err);
      res.write(`event: error\ndata: ${adapter.constructor.name} failed\n\n`);
    }
  });

  // End stream when all tasks are done
  await Promise.allSettled(tasks);
  res.write("event: done\ndata: All providers processed\n\n");
  res.end();
};
