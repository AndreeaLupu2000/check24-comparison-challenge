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
import { lateOffersCache } from "../models/LateOffersCacheModel";

const providers = [
  ByteMeAdapter, // works fast
  ServusSpeedAdapter,
  PingPerfectAdapter,
  WebWunderAdapter, //works fast
  VerbynDichAdapter
];

// Helper to create a unique key for an address
function addressKey(address: AddressInput) {
  return `${address.street}|${address.houseNumber}|${address.city}|${address.plz}`;
}

/**
 * Get offers handler
 * @param req 
 * @param res 
 */
export const getOffersHandler = async (req: Request, res: Response) => {
  try {
    const input: AddressInput = req.body;

    // Create the address object
    const address = {
      street: input.street,
      houseNumber: input.houseNumber,
      city: input.city,
      plz: input.plz
    };

    // Check if the address is valid
    if (!input || !input.street || !input.houseNumber || !input.city || !input.plz) {
      return res.status(400).json({ error: "Missing address fields." });
    }

    // Set a 3-second timeout for each provider
    const results = await Promise.allSettled(
      providers.map(p => retryWithTimeout(() => p.getOffers(address)))
    );

    const offers: Offer[] = [];
    const lateProviders: typeof providers = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      // If the provider returned a list of offers, add them to the list of offers
      if (result.status === "fulfilled") {
        offers.push(...result.value);
      } else {
        // This provider timed out or failed, so we fetch in the background
        lateProviders.push(providers[i]);
      }
    }

    // Respond immediately with fast offers
    res.status(200).json({ offers });

    // Fetch late offers in the background and store them
    if (lateProviders.length > 0) {
      (async () => {
        const lateOffers: Offer[] = [];

        for (const provider of lateProviders) {
          try {
            // Fetch the offers from the provider
            const result = await provider.getOffers(address);
            lateOffers.push(...result);
          } catch (err) {
            console.warn("[lateOffers] Provider failed:", err);
          }
        }
        if (lateOffers.length > 0) {
          lateOffersCache[addressKey(address)] = lateOffers;
        }
      })();
    }
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

export const getLateOffersHandler = (req: Request, res: Response) => {
  const { street, houseNumber, city, plz } = req.query;
  if (!street || !houseNumber || !city || !plz) {
    return res.status(400).json({ error: "Missing address fields." });
  }
  const address: AddressInput = {
    street: street as string,
    houseNumber: houseNumber as string,
    city: city as string,
    plz: plz as string
  };
  const key = addressKey(address);
  const offers = lateOffersCache[key] || [];
  // Optionally, clear the cache after serving
  delete lateOffersCache[key];
  res.status(200).json({ offers });
};
