// src/adapters/webwunderAdapter.ts

import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { ProviderAdapter } from "./providerAdapter";
import { config } from "../config";
import axios from "axios";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import pLimit from "p-limit";

const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: true
});

/**
 * Parses the XML response from the WebWunder API
 * @param xml The XML response from the WebWunder API
 * @returns The parsed XML response
 */
const parser = new XMLParser({ ignoreAttributes: false });

/**
 * Fetches all offer variants for a given address
 * @param address The address of the user to fetch the offer variants for
 * @returns A list of offer variants
 */
async function getAllOfferVariants(address: AddressInput): Promise<Offer[]> {
  // Create all possible combinations of connection types and installation types
  const combinations = [
    { connectionEnum: "DSL", installation: true },
    { connectionEnum: "DSL", installation: false },
    { connectionEnum: "MOBILE", installation: true },
    { connectionEnum: "MOBILE", installation: false },
    { connectionEnum: "FIBER", installation: true },
    { connectionEnum: "FIBER", installation: false },
    { connectionEnum: "CABLE", installation: true },
    { connectionEnum: "CABLE", installation: false },
  ];

  // Process each combination in parallel of 4 requests at a time
  const limit = pLimit(4);

  // Map each combination to a request to the WebWunder API
  const tasks = combinations.map((opts) =>
    limit(() =>
      WebWunderAdapter.getOffers(address, {
        ...opts,
        internalCall: true
      })
    )
  );

  // Wait for all requests to complete
  const results = await Promise.allSettled(tasks);

  // Initialize the list of all offers
  const allOffers: Offer[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allOffers.push(...result.value);
    } else {
      console.warn("[WebWunder combo failed]", result.reason);
    }
  }

  return allOffers;
}

// Extended WebWunder-specific interface
interface WebWunderExtendedAdapter extends ProviderAdapter {
  getOffers(
    address: AddressInput,
    options?: {
      connectionEnum?: string;
      installation?: boolean;
      internalCall?: boolean;
    }
  ): Promise<Offer[]>;
  getAllOfferVariants(address: AddressInput): Promise<Offer[]>;
}


// Export it with the adapter
export const WebWunderAdapter: WebWunderExtendedAdapter = {
  async getOffers(
    address: AddressInput,
    options?: {
      connectionEnum?: string;
      installation?: boolean;
      internalCall?: boolean;
    }
  ): Promise<Offer[]> {
    const connectionEnum = options?.connectionEnum ?? "DSL";
    const installation = options?.installation ?? true;

    // Create the request body
    const bodyObject = {
      "soapenv:Envelope": {
        "@_xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
        "@_xmlns:gs": "http://webwunder.gendev7.check24.fun/offerservice",
        "soapenv:Header": {},
        "soapenv:Body": {
          "gs:legacyGetInternetOffers": {
            "gs:input": {
              "gs:installation": installation,
              "gs:connectionEnum": connectionEnum,
              "gs:address": {
                "gs:street": address.street,
                "gs:houseNumber": address.houseNumber,
                "gs:city": address.city,
                "gs:plz": address.plz,
                "gs:countryCode": config.DEFAULT_COUNTRY
              }
            }
          }
        }
      }
    };

    // Build the request body
    const xmlRequest = builder.build(bodyObject);

    // Send the request to the WebWunder API
    try {
      const response = await axios.post(
        config.WEB_WUNDER_BASE_URL,
        xmlRequest,
        {
          headers: {
            "Content-Type": "text/xml",
            "X-Api-Key": config.WEB_WUNDER_API_KEY
          },
          timeout: 5000
        }
      );

      // Parse the response
      const parsed = parser.parse(response.data);

      // Get the raw offers from the parsed response
      const rawOffers =
        parsed?.["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"]?.["Output"]?.["ns2:products"] ?? [];

      // Normalize the offers to the common offer model
      const normalized: Offer[] = rawOffers.map((o: any) => ({
        provider: "WebWunder",
        productId: o["ns2:productId"]?.toString() ?? "unknown",
        title: o["ns2:providerName"] ?? "Unnamed Package",
        speedMbps: parseInt(o["ns2:productInfo"]?.["ns2:speed"] ?? "0"),
        pricePerMonth: parseInt(o["ns2:productInfo"]?.["ns2:monthlyCostInCent"] ?? "0") / 100,
        durationMonths: parseInt(o["ns2:productInfo"]?.["ns2:contractDurationInMonths"] ?? "0"),
        connectionType: o["ns2:productInfo"]?.["ns2:connectionType"] ?? "DSL",
        extras: [
          o["ns2:productInfo"]?.["ns2:voucher"]?.["ns2:percentage"]
            ? `Voucher: ${o["ns2:productInfo"]["ns2:voucher"]["ns2:percentage"]}%`
            : undefined
        ].filter(Boolean)
      }));

      if (!options?.internalCall) {
        const additional = await getAllOfferVariants(address);

        return [...normalized, ...additional];
      }

      return normalized;
    } catch (err) {
      console.error("[WebWunder Adapter] Error:", err);
      return [];
    }
  },
  getAllOfferVariants,
};