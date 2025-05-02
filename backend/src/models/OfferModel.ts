// src/models/OfferModel.ts

export interface Offer {
    provider: string;
    productId: string;
    title: string;
    speedMbps: number;
    pricePerMonth: number;
    durationMonths: number;
    connectionType: string;
    extras?: string[];
  }
  
  