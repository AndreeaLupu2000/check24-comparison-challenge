// src/controllers/offerController.ts

import { Request, Response } from "express"
//Models
import { AddressInput } from "../models/AddressModel"
import { Offer } from "../models/OfferModel"
//Adapters
import { ByteMeAdapter } from "../adapters/bytemeAdapter"
import { WebWunderAdapter } from "../adapters/webwunderAdapter"
import { PingPerfectAdapter } from "../adapters/pingperfectAdapter"
import { VerbynDichAdapter } from "../adapters/verbyndichAdapter"
import { ServusSpeedAdapter } from "../adapters/servusspeedAdapter"


// Providers
const providers = [
  ByteMeAdapter,
  ServusSpeedAdapter,
  PingPerfectAdapter,
  WebWunderAdapter,
  VerbynDichAdapter,
]


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
