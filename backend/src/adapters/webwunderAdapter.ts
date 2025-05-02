// src/adapters/webwunderAdapter.ts

import { AddressInput } from "../models/AddressModel";
import { Offer } from "../models/OfferModel";
import { ProviderAdapter } from "./providerAdapter";
import { config } from "../config";
import axios from "axios";
import { XMLBuilder, XMLParser } from "fast-xml-parser";


const builder = new XMLBuilder({
  ignoreAttributes: false,
  format: true
});
const parser = new XMLParser({ ignoreAttributes: false });


export const WebWunderAdapter: ProviderAdapter = {
  async getOffers(address: AddressInput): Promise<Offer[]> {
    const bodyObject = {
      "soapenv:Envelope": {
        "@_xmlns:soapenv": "http://schemas.xmlsoap.org/soap/envelope/",
        "@_xmlns:gs": "http://webwunder.gendev7.check24.fun/offerservice",
        "soapenv:Header": {},
        "soapenv:Body": {
          "gs:legacyGetInternetOffers": {
            "gs:input": {
              "gs:installation": true,
              "gs:connectionEnum": "DSL",
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

    const xmlRequest = builder.build(bodyObject);

    try {
      const response = await axios.post(
        config.WEB_WUNDER_BASE_URL,
        xmlRequest,
        {
          headers: {
            "Content-Type": "text/xml",
            "X-Api-Key": config.WEB_WUNDER_API_KEY
          },
          timeout: config.API_TIMEOUT_MS
        }
      );

      const parsed = parser.parse(response.data);

      const rawOffers =
        parsed?.["soapenv:Envelope"]?.["soapenv:Body"]?.["ns2:legacyGetInternetOffersResponse"]?.["ns2:output"] ?? [];

      const offersArray = Array.isArray(rawOffers) ? rawOffers : [rawOffers];

      const normalized: Offer[] = offersArray.map((o: any) => ({
        provider: "WebWunder",
        productId: o?.id ?? o?.productId ?? "unknown",
        title: o?.title || o?.name || "Unnamed Package",
        speedMbps: parseInt(o?.speed ?? "0"),
        pricePerMonth: parseInt(o?.monthlyCostInCent ?? "0") / 100,
        durationMonths: parseInt(o?.durationInMonths ?? "24"),
        connectionType: o?.connectionType ?? "DSL",
        extras: [o?.tv, o?.voucherType].filter(Boolean)
      }));

      return normalized;
    } catch (err) {
      console.error("[WebWunder Adapter] Error:", err);
      return [];
    }
  }
};