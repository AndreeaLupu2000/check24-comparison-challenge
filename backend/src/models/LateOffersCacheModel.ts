import { Offer } from "./OfferModel";

type LateOffersCache = {
    [addressKey: string]: Offer[];
  };
  
  export const lateOffersCache: LateOffersCache = {};