import { Request, Response } from "express"
import { databases } from "../config/appwrite"
import { Permission, Role, Query } from "appwrite"
import asyncHandler from "express-async-handler"
import { ID} from "node-appwrite"

// Config
const DB_ID = process.env.APPWRITE_DATABASE_ID!
const ADDRESS_COLLECTION_ID = process.env.APPWRITE_ADDRESS_COLLECTION_ID!

// Helper function to create a unique hash for the address
const addressKey = (a: any) => `${a.plz}|${a.city}|${a.street}|${a.houseNumber}`

export const createAddress = async (req: Request, res: Response) => {
  // Get the address fields from the request body
  const { plz, city, street, houseNumber } = req.body

  // Check if all required fields are present
  if ( !plz || !city || !street || !houseNumber ) {
    return res.status(400).json({ error: "Missing required address fields" })
  }

  // Create a unique hash for the address
  const hash = addressKey({ plz, city, street, houseNumber})

  try {
    // Check if the address already exists in the database
    const result = await databases.listDocuments(DB_ID, ADDRESS_COLLECTION_ID, [
      Query.equal("hash", hash),
      Query.limit(1),
    ])

    if (result.total > 0) {
      return res.status(200).json(result.documents[0])
    }

    // Create a unique ID for the address
    const addressId = ID.unique()

    // Create the address in the database
    const created = await databases.createDocument(
      DB_ID,
      ADDRESS_COLLECTION_ID,
      addressId,
      {
        plz,
        city,
        street,
        houseNumber,
        hash,
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    )

    // Return the created address
    res.status(201).json(
      {
        id: addressId,
        plz: created.plz,
        city: created.city,
        street: created.street,
        houseNumber: created.houseNumber,
        hash: created.hash,
      }
    )
  } catch (error) {
    console.error("[createOrGetAddress]", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getAllAddresses = asyncHandler(async (req: Request, res: Response) => {
    try {

      // Get all addresses from the database
      const response = await databases.listDocuments(
        DB_ID,
        ADDRESS_COLLECTION_ID,
      );

      // Map the addresses to the response format
      const addresses	 = response.documents.map((doc: any) => ({
        id: doc.$id,
        plz: doc.plz,
        city: doc.city,
        street: doc.street,
        houseNumber: doc.houseNumber,
        hash: doc.hash,
      }));

      // Return the addresses
      res.status(200).json(addresses);
    } catch (error) {
      console.error("[getAllAddresses]", error)
      res.status(500).json({ error: "Internal server error" })
    }
})
