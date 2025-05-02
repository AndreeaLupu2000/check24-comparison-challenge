import { Request, Response } from "express";
import { createUser } from "../services/UserService";

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
    const user = await createUser(email, password);
    
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

