//api/appwriteClient.ts
// Appwrite
import { Client } from 'appwrite'

export const appwriteClient = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT!)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)