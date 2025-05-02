// src/adapters/servusspeedAdapter.ts

import { ProviderAdapter } from "./providerAdapter";
import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { config } from "../config";
import axios from "axios";

export const ServusSpeedAdapter: ProviderAdapter = {
  async getOffers(address: AddressInput): Promise<Offer[]> {
    const auth = {
      username: config.SERVUS_USERNAME,
      password: config.SERVUS_PASSWORD
    };

    try {
      // Step 1: Get product list
      const available = await axios.post(
        `${config.SERVUS_BASE_URL}/api/external/available-products`,
        {
          params: {
            street: address.street,
            houseNumber: address.houseNumber,
            city: address.city,
            plz: address.plz,
            countryCode: config.DEFAULT_COUNTRY
          },
          auth,
          timeout: config.API_TIMEOUT_MS
        }
      );

      const productIds: string[] = available.data?.productIds || [];

      if (!productIds.length) return [];

      // Step 2: Fetch details for each product
      const offers: Offer[] = [];

      await Promise.all(
        productIds.map(async (id) => {
          try {
            const detailsRes = await axios.get(
              `${config.SERVUS_BASE_URL}/api/external/product-details/${id}`,
              { auth, timeout: config.API_TIMEOUT_MS }
            );

            const d = detailsRes.data;

            offers.push({
              provider: "Servus Speed",
              productId: d.productId,
              title: d.productName,
              speedMbps: parseInt(d.speedMbps),
              pricePerMonth: d.priceInCent / 100,
              durationMonths: d.durationMonths,
              connectionType: d.connectionType,
              extras: d.features || []
            });
          } catch (err) {
            console.warn(`[Servus Adapter] Failed to load product ${id}`, err);
          }
        })
      );

      return offers;
    } catch (err) {
      console.error("[Servus Speed Adapter] Error:", err);
      return [];
    }
  }
};