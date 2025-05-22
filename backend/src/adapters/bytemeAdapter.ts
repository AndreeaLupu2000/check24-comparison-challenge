//src/adapters/bytemeAdapter.ts

import axios from "axios";
import Papa from "papaparse";
import { ProviderAdapter } from "./providerAdapter";
import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { config } from "../config";

const BYTE_ME_URL = "https://byteme.gendev7.check24.fun/app/api/products/data";

/**
 * Interface for a ByteMe raw offer
 */
interface ByteMeRawOffer {
  productId: string;
  providerName: string;
  speed: string;
  monthlyCostInCent: string;
  afterTwoYearsMonthlyCost: string;
  durationInMonths: string;
  connectionType: string;
  installationService: string;
  tv: string;
  limitFrom: string;
  maxAge: string;
  voucherType: string;
  voucherValue: string;
}

export const ByteMeAdapter: ProviderAdapter = {
  /**
   * Get offers from ByteMe
   * @param address 
   * @returns 
   */
  async getOffers(address: AddressInput): Promise<Offer[]> {
    // Get search address
    const { street, houseNumber, city, plz } = address;

    try {
      // Get offers from ByteMe based on the address
      const response = await axios.get(BYTE_ME_URL, {
        headers: {
          "X-Api-Key": config.BYTE_ME_API_KEY
        },
        params: {
          street,
          houseNumber,
          city,
          plz
        },
        responseType: "text"
      });

      // Received data
      const csv = response.data;

      // Parse the CSV data to a ByteMeRawOffer array
      const parsed = Papa.parse<ByteMeRawOffer>(csv, {
        header: true,
        skipEmptyLines: true
      });

      // Map the ByteMe raw offer to the general offer interface
      const offers = parsed.data.map(row => ({
        provider: "ByteMe",
        productId: row.productId,
        title: `${row.providerName.trim()} ${row.speed} Internet`,
        speedMbps: row.speed || "0",
        pricePerMonth: (parseInt(row.monthlyCostInCent) / 100).toString(),
        durationMonths: row.durationInMonths || "24",
        connectionType: row.connectionType,
        extras: JSON.stringify([
          `Limit: ${row.limitFrom}`,
          `Max Age: ${row.maxAge}`,
          `Voucher: ${row.voucherType} ${row.voucherValue}`,
          `TV: ${row.tv}`,
          `Installation Service: ${row.installationService}`,
          `After 2 Years: ${row.afterTwoYearsMonthlyCost}`
        ].filter(Boolean).map(String)),
      }));

      // Keep only unique offers
      const uniqueOffersMap = new Map<string, Offer>();
      for (const offer of offers) {
        if (!uniqueOffersMap.has(offer.productId)) {
          uniqueOffersMap.set(offer.productId, offer);
        }
      }

      return Array.from(uniqueOffersMap.values());
    } catch (err) {
      console.error("[ByteMe Adapter] Error:", err);
      return []; // fail silently and let others continue
    }
  }
};
