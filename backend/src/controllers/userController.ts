import { Request, Response } from "express";
import { prisma } from "../db/client";
import { Prisma } from "@prisma/client";
/**
 * Register a new user  
 * @param req 
 * @param res 
 * @returns 
 */
export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "Password is required" });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password,
      }
    });

    res.status(201).json(user);

  } catch (error: any) {
    if (error.code === "P2002") {
      // Prisma unique constraint error
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error("[registerUser]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all users
 * @param req 
 * @param res 
 * @returns 
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();

    res.status(200).json(users);

  } catch (error: any) {
    console.error("[getAllUsers]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get a user by id
 * @param req 
 * @param res 
 * @returns 
 */
export const getUserByID = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    res.status(200).json(user);

  } catch (error: any) {
    console.error("[getUserById]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update a user by id
 * @param req 
 * @param res 
 * @returns 
 */
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { email, password } = req.body;
  try {
    const user = await prisma.user.update({ where: { id }, data: { email, password } });

    res.status(200).json(user);

  } catch (error: any) {
    console.error("[updateUser]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * Update shares of a user by id
 * @param req 
 * @param res 
 * @returns 
 */
export const updateShares = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { shares } = req.body;

  try {
    const user = await prisma.user.update({ where: { id }, data: { shares: shares } });

    res.status(200).json(user);

  } catch (error: any) {
    console.error("[updateShares]", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Delete a user by id
 * @param req 
 * @param res 
 * @returns 
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.delete({ where: { id } });

    res.status(200).json(user);

  } catch (error: any) {
    console.error("[deleteUser]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
