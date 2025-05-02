import { prisma } from "../db/client";

export const createUser = async (email: string, password: string) => {
  return await prisma.user.create({
    data: { 
      email,
      password,
     }
  });
};
