// src/services/OfferService.ts

import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { ByteMeAdapter } from "../adapters/bytemeAdapter";
import { WebWunderAdapter } from "../adapters/webwunderAdapter";
import { PingPerfectAdapter } from "../adapters/pingperfectAdapter";
import { VerbynDichAdapter } from "../adapters/verbyndichAdapter";
import { ServusSpeedAdapter } from "../adapters/servusspeedAdapter";

const providers = [
  ByteMeAdapter,
  WebWunderAdapter,
  PingPerfectAdapter,
  VerbynDichAdapter,
  ServusSpeedAdapter
];

export const getAllOffers = async (address: AddressInput): Promise<Offer[]> => {

  /**
   * Get all offers from all providers
   * allSettled offers a way to run all promises in parallel but also provides a way to handle errors, such as a provider not being available.
   * @param address 
   * @returns 
   */
  const results = await Promise.allSettled(
    providers.map(p => p.getOffers(address))
  );

  const offers: Offer[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      offers.push(...result.value);
    } else {
      console.warn("[offers.service] Provider failed:", result.reason);
    }
  }

  return offers;
};
