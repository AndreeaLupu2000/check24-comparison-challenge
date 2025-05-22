import { Client, Databases, Permission, Role, ID} from "appwrite" 

// Create a new client
const client = new Client()

// Set the endpoint and project ID
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)

// Create a new databases instance
export const databases = new Databases(client)

// Export the Permission, Role, and ID classes
export { Permission, Role, ID } 