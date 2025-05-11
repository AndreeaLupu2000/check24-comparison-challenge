import asyncHandler from "express-async-handler"
import { Request, Response } from "express"
import { databases } from "../config/appwrite"
import { ID, Permission, Role, Query } from "appwrite"


const DB_ID = process.env.APPWRITE_DATABASE_ID!
const USER_COLLECTION_ID = process.env.APPWRITE_USER_COLLECTION_ID!

// Define the page size limit — Appwrite only returns up to 25 documents at once
const PAGE_LIMIT = 25

/**
 * Register a new user  
 * @param req 
 * @param res 
 * @returns 
 */
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  if (!password || typeof password !== "string") {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  try {
    const created = await databases.createDocument(
      DB_ID,
      USER_COLLECTION_ID,
      ID.unique(),
      {
        email,
        password,
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );

    res.status(201).json({
      id: created.$id,
      email,
      password,
    });

  } catch (error) {
    console.error("Appwrite error:", JSON.stringify(error, null, 2));
    res.status(500).json({ message: "Failed to create task", error });
  }
})

/**
 * Get all users
 * @param req 
 * @param res 
 * @returns 
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await databases.listDocuments(
      DB_ID,
      USER_COLLECTION_ID
    );

    const users = response.documents.map((user: any) => ({
      id: user.$id,
      email: user.email,
      password: user.password,
    }));

    res.status(200).json(users);

  } catch (error: any) {
    console.error("[getAllUsers]", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

/**
 * Get a user by id
 * @param req 
 * @param res 
 * @returns 
 */
export const getUserByID = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "User ID is required" });
    return;
  }
  try {
    const user = await databases.getDocument(
      DB_ID,
      USER_COLLECTION_ID,
      id
    );

    res.status(200).json(user);

  } catch (error: any) {
    console.error("[getUserById]", error);
    res.status(500).json({ error: "Internal server error" });
  }
})
