import { Request, Response } from "express"
import { databases } from "../config/appwrite"
import { Permission, Role, Query } from "appwrite"
import asyncHandler from "express-async-handler"
import { ID } from "node-appwrite"

const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const USER_ADDRESS_COLLECTION_ID = process.env.APPWRITE_USERADDRESS_COLLECTION_ID!;

export const createUserAddress = asyncHandler(async (req: Request, res: Response) => {
    const { userId, addressId } = req.body;

    try {

        const userAddressId = ID.unique()

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

        res.status(201).json({ id: userAddressId, ...created });

    } catch (error) {
        console.error("Appwrite error:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: "Failed to create task", error });
    }
});


export const getUserAddressesByUserId = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
        const userAddresses = await databases.listDocuments(
            DB_ID,
            USER_ADDRESS_COLLECTION_ID,
            [
                Query.equal("userId", userId)
            ]
        );

        res.status(200).json(userAddresses.documents);

    } catch (error) {
        console.error("Appwrite error:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: "Failed to get user addresses", error });
    }
});

export const getUserAddressesByAddressId = asyncHandler(async (req: Request, res: Response) => {
    const { addressId } = req.params;

    try {
        const userAddresses = await databases.listDocuments(
            DB_ID,
            USER_ADDRESS_COLLECTION_ID,
            [
                Query.equal("addressId", addressId)
            ]
        );

        res.status(200).json(userAddresses.documents);

    } catch (error) {
        console.error("Appwrite error:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: "Failed to get user addresses", error });
    }
});

export const getAllUserAddresses = asyncHandler(async (req: Request, res: Response) => {
    try {
        const userAddresses = await databases.listDocuments(
            DB_ID,
            USER_ADDRESS_COLLECTION_ID
        );

        res.status(200).json(userAddresses.documents);

    } catch (error) {
        console.error("Appwrite error:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: "Failed to get all user addresses", error });
    }
});






