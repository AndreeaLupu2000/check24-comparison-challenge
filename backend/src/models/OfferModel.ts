// src/models/OfferModel.ts

export interface Offer {
  provider: string;
  productId: string;
  title: string;
  speedMbps: string;
  pricePerMonth: string;
  durationMonths: string;
  connectionType: string;
  extras: string;
}

