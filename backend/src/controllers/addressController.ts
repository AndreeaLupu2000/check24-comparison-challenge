import { Request, Response } from "express"
import { databases } from "../config/appwrite"
import { ID, Permission, Role, Query } from "appwrite"
import asyncHandler from "express-async-handler"

const DB_ID = process.env.APPWRITE_DATABASE_ID!
const ADDRESS_COLLECTION_ID = process.env.APPWRITE_ADDRESS_COLLECTION_ID!

const addressKey = (a: any) => `${a.plz}|${a.city}|${a.street}|${a.houseNumber}`

export const createAddress = async (req: Request, res: Response) => {
  const { plz, city, street, houseNumber } = req.body

  if ( !plz || !city || !street || !houseNumber ) {
    return res.status(400).json({ error: "Missing required address fields" })
  }

  const hash = addressKey({ plz, city, street, houseNumber})

  try {
    const result = await databases.listDocuments(DB_ID, ADDRESS_COLLECTION_ID, [
      Query.equal("hash", hash),
      Query.limit(1),
    ])

    if (result.total > 0) {
      return res.status(200).json(result.documents[0])
    }

    const created = await databases.createDocument(
      DB_ID,
      ADDRESS_COLLECTION_ID,
      ID.unique(),
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

    res.status(201).json(created)
  } catch (error) {
    console.error("[createOrGetAddress]", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

export const getAllAddresses = asyncHandler(async (req: Request, res: Response) => {
    try {

      const response = await databases.listDocuments(
        DB_ID,
        ADDRESS_COLLECTION_ID,
      );


      const addresses	 = response.documents.map((doc: any) => ({
        id: doc.$id,
        plz: doc.plz,
        city: doc.city,
        street: doc.street,
        houseNumber: doc.houseNumber,
        hash: doc.hash,
      }));

      res.status(200).json(addresses);
    } catch (error) {
      console.error("[getAllAddresses]", error)
      res.status(500).json({ error: "Internal server error" })
    }
})
