import { ProviderAdapter } from "./providerAdapter";
import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { config } from "../config";
import axios from "axios";
import crypto from "crypto";


export const PingPerfectAdapter: ProviderAdapter = {

  /**
   * Get offers from Ping Perfect
   * @param address - The address to get offers for
   * @returns The offers
   */
  async getOffers(address: AddressInput): Promise<Offer[]> {

    // Get the address details
    const { street, houseNumber, city, plz } = address;

    // Initialize the offers array
    const allOffers: Offer[] = [];

    // Create the request body for both fiber and non-fiber offers
    for (const wantsFiber of [true, false]) {
      const sortedPayload = {
        city,
        houseNumber,
        plz,
        street,
        wantsFiber,
      };

      // Sort the payload keys to respect to API requirements
      const sortedKeys = ["city", "houseNumber", "plz", "street", "wantsFiber"];
      const requestBody = JSON.stringify(sortedPayload, sortedKeys);

      // Create the timestamp and signature
      const timestamp = Math.floor(Date.now() / 1000);
      const message = `${timestamp}:${requestBody}`;

      const signature = crypto
        .createHmac("sha256", config.PING_PERFECT_SECRET)
        .update(message)
        .digest("hex");

      try {
        // Send the request to the API
        const response = await axios.post(
          "https://pingperfect.gendev7.check24.fun/internet/angebote/data",
          requestBody,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Client-Id": config.PING_PERFECT_CLIENT_ID,
              "X-Timestamp": timestamp.toString(),
              "X-Signature": signature,
            },
          }
        );

        const offers = response.data ?? [];

        // Normalize the offers to the common offer model
        const normalized: Offer[] = offers
          .map((o: any) => {
            // Check if any required field is empty, null, or NaN
            if (!o.providerName || 
                !o.productInfo?.speed || isNaN(o.productInfo?.speed) ||
                !o.pricingDetails?.monthlyCostInCent || isNaN(o.pricingDetails?.monthlyCostInCent) ||
                !o.productInfo?.contractDurationInMonths || isNaN(o.productInfo?.contractDurationInMonths) ||
                !o.productInfo?.connectionType) {
              return null;
            }

            return {
              provider: "Ping Perfect",
              productId: "", // not provided
              title: o.providerName,
              speedMbps: o.productInfo?.speed,
              pricePerMonth: (o.pricingDetails.monthlyCostInCent / 100).toString(),
              durationMonths: o.productInfo?.contractDurationInMonths.toString(),
              connectionType: o.productInfo?.connectionType,
              extras: JSON.stringify([
                `TV: ${o.productInfo?.tv}`,
                `Installation Service: ${o.pricingDetails?.installationService}`,
                `Limit from: ${o.productInfo?.limitFrom}`,
                `Max age: ${o.productInfo?.maxAge}`,
              ].filter(Boolean).map(String)),
            };
          })
          .filter((offer: Offer | null): offer is Offer => offer !== null); // Remove null offers

        // Add the filtered offers to the offers array
        allOffers.push(...normalized);
      } catch (err) {
        console.error(`[Ping Perfect Adapter] Error (wantsFiber=${wantsFiber}):`, err);
      }
    }

    return allOffers;
  },
};