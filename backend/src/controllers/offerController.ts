// src/controllers/offerController.ts

import { Request, Response } from "express"
import { AddressInput } from "../models/AddressModel"
import { Offer } from "../models/OfferModel"
import { ByteMeAdapter } from "../adapters/bytemeAdapter"
import { WebWunderAdapter } from "../adapters/webwunderAdapter"
import { PingPerfectAdapter } from "../adapters/pingperfectAdapter"
import { VerbynDichAdapter } from "../adapters/verbyndichAdapter"
import { ServusSpeedAdapter } from "../adapters/servusspeedAdapter"
import { lateOffersCache } from "../models/LateOffersCacheModel"
import { databases } from "../config/appwrite"
import { ID, Permission, Role } from "appwrite"
import { retryWithTimeout } from "./utils/retry"

const DB_ID = process.env.APPWRITE_DATABASE_ID!
const OFFER_COLLECTION_ID = process.env.APPWRITE_OFFER_COLLECTION_ID!

const providers = [
  ByteMeAdapter,
  ServusSpeedAdapter,
  PingPerfectAdapter,
  WebWunderAdapter,
  VerbynDichAdapter,
]

const addressKey = (address: AddressInput) =>
  `${address.street}|${address.houseNumber}|${address.city}|${address.plz}`

/**
 * POST /offers
 * Returns offers for an address, with fast responses and background fallbacks.
 */
export const getOffersHandler = async (req: Request, res: Response) => {
  try {
    const input: AddressInput = req.body
    const { street, houseNumber, city, plz } = input

    if (!street || !houseNumber || !city || !plz) {
      return res.status(400).json({ error: "Missing address fields." })
    }

    const address = { street, houseNumber, city, plz }

    const results = await Promise.allSettled(
      providers.map((p) => retryWithTimeout(() => p.getOffers(address)))
    )

    const offers: Offer[] = []
    const lateProviders: typeof providers = []

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      if (result.status === "fulfilled") {
        offers.push(...result.value)
      } else {
        lateProviders.push(providers[i])
      }
    }

    // Persist fast offers to Appwrite
    for (const offer of offers) {
      try {
        await databases.createDocument(
          DB_ID,
          OFFER_COLLECTION_ID,
          ID.unique(),
          {
            provider: offer.provider,
            productId: offer.productId,
            title: offer.title,
            speedMbps: offer.speedMbps.toString(),
            pricePerMonth: offer.pricePerMonth.toString(),
            durationMonths: offer.durationMonths.toString(),
            connectionType: offer.connectionType,
            extras: JSON.stringify(offer.extras || []),
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any()),
          ]
        )
      } catch (err) {
        console.warn("[Appwrite Store Offer] Failed to store offer:", err)
      }
    }

    res.status(200).json({ offers })

    // Background fetch late offers
    if (lateProviders.length > 0) {
      const lateOffers: Offer[] = []
      const key = addressKey(address)

      ;(async () => {
        for (const provider of lateProviders) {
          try {
            const result = await provider.getOffers(address)
            lateOffers.push(...result)
          } catch (err) {
            console.warn(`[lateOffers] ${provider.constructor.name} failed:`, err)
          }
        }
        if (lateOffers.length > 0) {
          lateOffersCache[key] = lateOffers
        }
      })()
    }
  } catch (err) {
    console.error("[getOffersHandler] Error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * SSE offer streaming
 */
export const streamOffersHandler = async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  const { street, houseNumber, city, plz } = req.query

  if (!street || !houseNumber || !city || !plz) {
    res.write(`event: error\ndata: Missing address fields\n\n`)
    return res.end()
  }

  const address: AddressInput = {
    street: street as string,
    houseNumber: houseNumber as string,
    city: city as string,
    plz: plz as string,
  }

  const sendOffer = (offer: Offer) => {
    res.write(`data: ${JSON.stringify(offer)}\n\n`)
  }

  const tasks = providers.map(async (adapter) => {
    try {
      const offers = await adapter.getOffers(address)
      offers.forEach(sendOffer)
    } catch (err) {
      console.error(`[${adapter.constructor.name}] failed:`, err)
      res.write(`event: error\ndata: ${adapter.constructor.name} failed\n\n`)
    }
  })

  await Promise.allSettled(tasks)

  res.write("event: done\ndata: All providers processed\n\n")
  res.end()
}

/**
 * Retrieve cached late offers
 */
export const getLateOffersHandler = (req: Request, res: Response) => {
  const { street, houseNumber, city, plz } = req.query
  if (!street || !houseNumber || !city || !plz) {
    return res.status(400).json({ error: "Missing address fields." })
  }

  const address: AddressInput = {
    street: street as string,
    houseNumber: houseNumber as string,
    city: city as string,
    plz: plz as string,
  }

  const key = addressKey(address)
  const offers = lateOffersCache[key] || []

  delete lateOffersCache[key] // optional: clear after retrieval
  res.status(200).json({ offers })
}
