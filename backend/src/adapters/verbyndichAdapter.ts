import { ProviderAdapter } from "./providerAdapter";
import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { config } from "../config";
import axios from "axios";

/**
 * Fetches all offers for a given address
 * @param address The address of the user to fetch the offers for
 * @returns A list of offers
 */
export const VerbynDichAdapter: ProviderAdapter = {
  async getOffers(address: AddressInput): Promise<Offer[]> {
    const body = `${address.street};${address.houseNumber};${address.city};${address.plz}`;

    // Initialize the page number and the list of offers
    let page = 0;
    let hasMore = true;
    const offers: Offer[] = [];

    // Loop until there are no more offers
    while (hasMore) {
      try {
        // Send the request to the API to get the offers
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
        const speedMatch = data.description.match(/(\d+)\s* Mbit/i);
        const priceMatch = data.description.match(/(\d+)[,.]?(\d{0,2})\s*€/);
        const durationMatch = data.description.match(/(\d+)\s* Monate/i);
        const connectionTypeMatch = data.description.match(/\s*([A-Za-z]+)-Verbindung/);

        // Check if any required field is missing, empty, or invalid
        if (!speedMatch ||
          !priceMatch ||
          !durationMatch ||
          !connectionTypeMatch ||
          !data.product) {
          continue;
        }

        // normalize the offer to the common offer model and add it to the list of offers
        offers.push({
          provider: "VerbynDich",
          productId: `${page}`,
          title: data.product,
          speedMbps: speedMatch[1].toString(),
          pricePerMonth: priceMatch[1].toString(),
          durationMonths: durationMatch[1].toString(),
          connectionType: connectionTypeMatch[1].toUpperCase(),
          extras: JSON.stringify([
            `Description: ${data.description}`,
          ].filter(Boolean).map(String)),
        });


        if (data.last) {
          hasMore = false;
        } else {
          page += 1;
        }
      } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        console.warn(`[Verbyndich Adapter] Rate limited on page ${page}, stopping early.`);
        break; // Exit gracefully but return what we have
      }

      console.error(`[Verbyndich Adapter] Unexpected error on page ${page}:`, err);
      break; // Optional: or continue;
    }
  }
  return offers;
},
};

