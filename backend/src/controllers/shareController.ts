import { Request, Response } from "express"
import { databases } from "../config/appwrite"
import { Permission, Role, Query } from "appwrite"
import asyncHandler from "express-async-handler"
import { ID } from "node-appwrite"

const DB_ID = process.env.APPWRITE_DATABASE_ID!
const SHARE_COLLECTION_ID = process.env.APPWRITE_SHARE_COLLECTION_ID!

// Define the page size limit — Appwrite only returns up to 25 documents at once
const PAGE_LIMIT = 25


/**
 * Create a shared offer
 */
export const createSharedOffer = asyncHandler(async (req: Request, res: Response) => {
  // Get the userId, address, offerIds, and offers from the request body
  const { userId, address, offerIds, offers } = req.body

  // Check if all required fields are present
  if (!userId || !address || !offerIds) {
     res.status(400).json({ error: "Missing userId, address, or offerIds" })
     return;
  }


  try {
      // Create a unique ID for the share
    const shareId = ID.unique()

    // Create the share in the database
    const share = await databases.createDocument(
      DB_ID,
      SHARE_COLLECTION_ID,
      shareId,
      {
        userId,
        address: JSON.stringify(address),
        offerIds,
        offers,
        createdAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    )

    // Return the created share
    res.status(201).json({
        id: shareId,
        userId: share.userId,
        address: JSON.parse(share.address),
        offerIds: share.offerIds,
        offers: share.offers,
        createdAt: share.createdAt,
    })
  } catch (error) {
    console.error("[createSharedOffer]", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

/**
 * Get a shared offer by ID
 */
export const getSharedOffer = async (req: Request, res: Response) => {
  // Get the id from the request params
  const { id } = req.params

  try {
    // Get the share from the database
    const doc = await databases.getDocument(
        DB_ID, 
        SHARE_COLLECTION_ID, 
        id)
        
    // Return the share
    res.status(200).json({
      ...doc,
      address: JSON.parse(doc.address),
    })
  } catch (error) {
    console.error("[getSharedOffer]", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * Update a shared offer by ID
 */
export const updateSharedOffer = async (req: Request, res: Response) => {
  const { id } = req.params
  const { userId, address, offerIds, offers } = req.body

  if (!userId || !address || !offerIds) {
    return res.status(400).json({ error: "Missing userId, address, or offerIds" })
  }

  try {
    const updated = await databases.updateDocument(
      DB_ID,
      SHARE_COLLECTION_ID,
      id,
      {
        userId,
        address: JSON.stringify(address),
        offerIds,
        offers,
      },
      [
        Query.orderAsc("createdAt"),
        Query.limit(PAGE_LIMIT),
      ]
    )

    res.status(200).json({
      ...updated,
      address: JSON.parse(updated.address),
    })
  } catch (error) {
    console.error("[updateSharedOffer]", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * Delete a shared offer by ID
 */
export const deleteSharedOffer = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await databases.deleteDocument(DB_ID, SHARE_COLLECTION_ID, id)
    res.status(200).json({ message: "Shared offer deleted" })
  } catch (error) {
    console.error("[deleteSharedOffer]", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

/**
 * Get all shared offers
 */
export const getAllSharedOffers = async (_req: Request, res: Response) => {
  try {
    const result = await databases.listDocuments(
        DB_ID,
        SHARE_COLLECTION_ID,
        [
            Query.orderAsc("createdAt"),
            Query.limit(PAGE_LIMIT),
        ]
    );

    const shares = result.documents.map((doc: any) => ({
      id: doc.$id,
      userId: doc.userId,
      address: JSON.parse(doc.address),
      offerIds: doc.offerIds,
      offers: doc.offers,
      createdAt: doc.createdAt,
    }))

    res.status(200).json(shares)
  } catch (error) {
    console.error("[getAllSharedOffers]", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
