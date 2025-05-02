//src/adapters/providerAdapter.ts

import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";

export interface ProviderAdapter {
  getOffers(address: AddressInput): Promise<Offer[]>;
}
