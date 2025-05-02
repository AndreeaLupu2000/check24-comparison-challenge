//src/adapters/pingperfectAdapter.ts

import { ProviderAdapter } from "./providerAdapter";
import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { config } from "../config";
import axios from "axios";
import crypto from "crypto";

export const PingPerfectAdapter: ProviderAdapter = {
  /**
   * Get offers from Ping Perfect
   * @param address 
   * @returns 
   */
  async getOffers(address: AddressInput): Promise<Offer[]> {
    const { street, houseNumber, city, plz } = address;

    const payload = {
      address: {
        street,
        houseNumber,
        city,
        postalCode: plz,
        countryCode: config.DEFAULT_COUNTRY
      }
    };

    try {
      // Step 1: Prepare timestamp and body
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const bodyString = JSON.stringify(payload);
      const dataToSign = `${timestamp}:${bodyString}`;

      // Step 2: Generate signature
      const signature = crypto
        .createHmac("sha256", config.PING_PERFECT_SECRET)
        .update(dataToSign)
        .digest("hex");

      const response = await axios.post(
        `${config.PING_PERFECT_BASE_URL}/offers`, 
        payload,
        {
          headers: {
            "X-Signature": signature,
            "X-Timestamp": timestamp,
            "X-Client-Id": config.PING_PERFECT_CLIENT_ID,
            "Content-Type": "application/json"
          },
          timeout: config.API_TIMEOUT_MS
        }
      );

      const offers = response.data?.offers ?? [];

      const normalized: Offer[] = offers.map((o: any) => ({
        provider: "Ping Perfect",
        productId: o.productId,
        title: o.name || o.product,
        speedMbps: parseInt(o.speedMbps ?? o.speed ?? "0"),
        pricePerMonth: o.price / 100,
        durationMonths: o.duration || 24,
        connectionType: o.connectionType || "DSL",
        extras: [o.voucher, o.tv, o.limit].filter(Boolean)
      }));

      return normalized;
    } catch (err) {
      console.error("[Ping Perfect Adapter] Error:", err);
      return [];
    }
  }
};