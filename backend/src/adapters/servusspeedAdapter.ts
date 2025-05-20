import { ProviderAdapter } from "./providerAdapter";
import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { config } from "../config";
import axios from "axios";
import pLimit from "p-limit"; 


const auth = {
  username: config.SERVUS_USERNAME,
  password: config.SERVUS_PASSWORD
};

/**
 * Fetches all available products for a given address
 * @param address The address to fetch the products for
 * @returns A list of product IDs
 */
async function fetchAvailableProducts(address: AddressInput): Promise<string[]> {
  try {
    // Send the request to the API to get all available products
    const response = await axios.post(
      "https://servus-speed.gendev7.check24.fun/api/external/available-products",
      {
        address: {
          strasse: address.street,
          hausnummer: address.houseNumber,
          stadt: address.city,
          postleitzahl: address.plz,
          land: "DE"
        }
      },
      {
        auth: auth,
        timeout: 5000
      }
    );

    // Return the list of product IDs
    return response.data?.availableProducts ?? [];
  } catch (err: any) {
    console.warn("[Servus Adapter] First attempt failed:", err?.response?.status);

    if (err?.response?.status === 503) {
      await new Promise((res) => setTimeout(res, 1000));
      return fetchAvailableProducts(address);
    }

    throw err;
  }
}


/**
 * Fetches the product details for a given product ID
 * @param productId The ID of the product to fetch the details for
 * @param address The address of the user to fetch the product details for
 * @returns The product details
 */
async function fetchProductDetails(productId: string, address: AddressInput) {
  // Send the request to the API to get the product details of a product given by ID
  const response = await axios.post(
    `https://servus-speed.gendev7.check24.fun/api/external/product-details/${productId}`,
    {
      address: {
        strasse: address.street,
        hausnummer: address.houseNumber,
        stadt: address.city,
        postleitzahl: address.plz,
        land: "DE"
      }
    },
    { auth: auth }
  );

  return response.data.servusSpeedProduct;
}

/**
 * Fetches all offers for a given address
 * @param address The address of the user to fetch the offers for
 * @returns A list of offers
 */
export const ServusSpeedAdapter: ProviderAdapter = {
  async getOffers(address: AddressInput): Promise<Offer[]> {
    try {
      // Fetch all available products for the given address
      const availableProductIds = await fetchAvailableProducts(address);

      if (!Array.isArray(availableProductIds) || availableProductIds.length === 0) {
        console.warn("[Servus Speed Adapter] No products found or unexpected format");
        return [];
      }

      // 4 parallel requests
      const limit = pLimit(4); 

      // process each product ID in parallel of 4 requests at a time
      const tasks = availableProductIds.map(productId =>
        limit(async () => {
          await new Promise((res) => setTimeout(res, Math.random() * 300));
      
          try {
            // Fetch the product details for the given product ID
            const d = await fetchProductDetails(productId, address);
      
            return {
              provider: "Servus Speed",
              productId,
              title: d.providerName,
              speedMbps: d.productInfo.speed.toString(),
              pricePerMonth: (d.pricingDetails.monthlyCostInCent / 100).toString(),
              durationMonths: d.productInfo.contractDurationInMonths.toString(),
              connectionType: d.productInfo.connectionType.toString(),
              extras: JSON.stringify([
                `TV: ${d.productInfo.tv}`,
                `Max age: ${d.productInfo.maxAge}`,
                `Limit from: ${d.productInfo.limitFrom}`,
                `Discount: €${(d.discount / 100).toFixed(2)}`,
                d.pricingDetails.installationService ? "Includes installation service" : "No installation"
              ].filter(Boolean).map(String)),
            } as Offer;

          } catch {
            console.warn(`[Servus Adapter] Failed to load product ${productId}`);
            return null;
          }
        })
      );
      
      const results = await Promise.all(tasks);
      return results.filter((r): r is Offer => r !== null);

    } catch (err) {
      console.error("[Servus Adapter] Top-level error:", err);
      return [];
    }
  }
};