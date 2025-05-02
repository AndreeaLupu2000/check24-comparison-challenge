// src/adapters/verbyndichAdapter.ts

import { ProviderAdapter } from "./providerAdapter";
import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { config } from "../config";
import axios from "axios";

export const VerbynDichAdapter: ProviderAdapter = {
  async getOffers(address: AddressInput): Promise<Offer[]> {
      const { street, houseNumber, city, plz } = address;
      const body = `${address.street};${address.houseNumber};${address.city};${address.plz}`;
  
      let page = 0;
      let hasMore = true;
      const offers: Offer[] = [];
  
      try {
        while (hasMore) {
          const response = await axios.post(
            config.VERBYNDICH_BASE_URL,
            body,
            {
              params: {
                apiKey: config.VERBYNDICH_API_KEY,
                page
              },
              headers: {
                "Content-Type": "text/plain"
              },
              timeout: config.API_TIMEOUT_MS
            }
          );
  
          const data = response.data;
          if (!data.valid) {
            break;
          }
  
          // Extract values from description using a basic regex
          const speedMatch = data.description.match(/(\d+)\s*Mbps/i);
          const priceMatch = data.description.match(/(\d+)[,.]?(\d{0,2})\s*€/);
          const durationMatch = data.description.match(/(\d+)\s*months?/i);
  
          offers.push({
            provider: "VerbynDich",
            productId: data.product || `page-${page}`,
            title: data.product,
            speedMbps: speedMatch ? parseInt(speedMatch[1]) : 0,
            pricePerMonth: priceMatch
              ? parseFloat(`${priceMatch[1]}.${priceMatch[2] || "00"}`)
              : 0,
            durationMonths: durationMatch ? parseInt(durationMatch[1]) : 24,
            connectionType: /fiber|dsl/i.test(data.description) ? RegExp.lastMatch.toUpperCase() : "UNKNOWN",
            extras: [data.description]
          });
  
          if (data.last) {
            hasMore = false;
          } else {
            page += 1;
          }
        }
  
        return offers;
      } catch (err) {
        console.error("[VerbynDich Adapter] Error:", err);
        return [];
      }
    }
  };