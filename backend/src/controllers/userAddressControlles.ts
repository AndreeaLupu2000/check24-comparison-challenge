import { Request, Response } from "express"
import asyncHandler from "express-async-handler"
// Appwrite
import { databases } from "../config/appwrite"
import { Permission, Role, Query } from "appwrite"
import { ID } from "node-appwrite"

// APIs
const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const USER_ADDRESS_COLLECTION_ID = process.env.APPWRITE_USERADDRESS_COLLECTION_ID!;
const ADDRESS_COLLECTION_ID = process.env.APPWRITE_ADDRESS_COLLECTION_ID!;


/**
 * Create a user address
 */
export const createUserAddress = asyncHandler(async (req: Request, res: Response) => {
    // Get the userId and addressId from the request body
    const { userId, addressId } = req.body;

    try {

        const userAddressId = ID.unique()

        // Create the user address in the database
        const created = await databases.createDocument(
            DB_ID,
            USER_ADDRESS_COLLECTION_ID,
            userAddressId,
            {
                userId,
                addressId,
                createdAt: new Date().toISOString()
            },
            [
                Permission.read(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any()),
            ]
        );

        // Return the created user address
        res.status(201).json({ id: userAddressId, ...created });

    } catch (error) {
        console.error("Appwrite error:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: "Failed to create user address", error });
    }
});


export const getUserAddressesByUserId = asyncHandler(async (req: Request, res: Response) => {
    // Get the userId from the request params
    const { userId } = req.params;

    try {
        // Get the user addresses from the database
        const userAddresses = await databases.listDocuments(
            DB_ID,
            USER_ADDRESS_COLLECTION_ID,
            [
                Query.equal("userId", userId)
            ]
        );

        // Return the user addresses
        res.status(200).json(userAddresses.documents);

    } catch (error) {
        console.error("Appwrite error:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: "Failed to get user addresses", error });
    }
});

export const getUserAddressesByAddressId = asyncHandler(async (req: Request, res: Response) => {
    // Get the addressId from the request params
    const { addressId } = req.params;

    try {
        // Get the user addresses from the database
        const userAddresses = await databases.listDocuments(
            DB_ID,
            USER_ADDRESS_COLLECTION_ID,
            [
                Query.equal("addressId", addressId)
            ]
        );

        // Return the user addresses
        res.status(200).json(userAddresses.documents);

    } catch (error) {
        console.error("Appwrite error:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: "Failed to get user addresses", error });
    }
});

export const getAllUserAddresses = asyncHandler(async (req: Request, res: Response) => {
    try {
        // Get all user addresses from the database
        const userAddresses = await databases.listDocuments(
            DB_ID,
            USER_ADDRESS_COLLECTION_ID
        );

        // Return the user addresses
        res.status(200).json(userAddresses.documents);

    } catch (error) {
        console.error("Appwrite error:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: "Failed to get all user addresses", error });
    }
});


export const getLastUsedAddressByUserId = asyncHandler(async (req: Request, res: Response) => {
    // Get the userId from the request params
    const { userId } = req.params;

    try {
        // Get the latest user address from the database
        const userAddresses = await databases.listDocuments(DB_ID, USER_ADDRESS_COLLECTION_ID, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(1)
        ]);

    if (userAddresses.documents.length === 0) 
        res.status(404).json({ message: "No user addresses found" });
    
    // Get the last user address
    const lastUserAddress = userAddresses.documents[0];

    // Get the addressId from the last user address
    const addressId = lastUserAddress.addressId;

    // Get the linked address document
    const address = await databases.getDocument(DB_ID, ADDRESS_COLLECTION_ID, addressId);
  
    // Return the address
    res.status(200).json(address);

} catch (error) {
    console.error("Appwrite error:", JSON.stringify(error, null, 2));
    res.status(500).json({ message: "Failed to get last used address", error });
}
});





