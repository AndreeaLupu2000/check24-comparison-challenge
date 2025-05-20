// This file establishes the connection to the appwrite database
import { Client } from 'appwrite'

export const appwriteClient = new Client()
  .setEndpoint('https://service.appwrite.dpschool.app/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)