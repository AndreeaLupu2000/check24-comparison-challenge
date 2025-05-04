import { AddressInput } from "./AddressModel";
import { Offer } from "./OfferModel";
export interface Share {
  id: string;
  userId: string;
  address: AddressInput;
  offers: Offer[];
  createdAt: Date;
}

