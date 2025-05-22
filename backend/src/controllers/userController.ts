import asyncHandler from "express-async-handler"
import { Request, Response } from "express"
import { databases } from "../config/appwrite"
import { Permission, Role } from "appwrite"
import { ID } from "node-appwrite"

// APIs
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
  // Get the email and password from the request body 
  const { email, password } = req.body;

  // Check if the email is present and is a string
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  // Check if the password is present and is a string
  if (!password || typeof password !== "string") {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  try {
    // Create a unique ID for the user
    const userId = ID.unique()

    // Create the user in the database
    const created = await databases.createDocument(
      DB_ID,
      USER_COLLECTION_ID,
      userId,
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

    // Return the created user
    res.status(201).json({ id: userId, ...created });

  } catch (error) {
    console.error("Appwrite error:", JSON.stringify(error, null, 2));
    res.status(500).json({ message: "Failed to create user", error });
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
    // Get all users from the database
    const response = await databases.listDocuments(
      DB_ID,
      USER_COLLECTION_ID
    );

    // Map the users to the response format
    const users = response.documents.map((user: any) => ({
      id: user.$id,
      email: user.email,
      password: user.password,
    }));

    // Return the users
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
  // Get the id from the request params
  const { id } = req.params;

  // Check if the id is present and is a string
  if (!id || typeof id !== "string") {
    res.status(400).json({ error: "User ID is required" });
    return;
  }

  try {
    // Get the user from the database
    const user = await databases.getDocument(
      DB_ID,
      USER_COLLECTION_ID,
      id
    );

    // Return the user
    res.status(200).json(user);

  } catch (error: any) {
    console.error("[getUserById]", error);
    res.status(500).json({ error: "Internal server error" });
  }
})
