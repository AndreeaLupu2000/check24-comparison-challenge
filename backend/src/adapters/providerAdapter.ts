//src/adapters/providerAdapter.ts

import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";

/**
 * Interface for a provider adapter
 */
export interface ProviderAdapter {
  /**
   * Get offers from the provider
   * @param address - The address to get offers for
   * @returns The offers
   */
  getOffers(address: AddressInput): Promise<Offer[]>;
}
