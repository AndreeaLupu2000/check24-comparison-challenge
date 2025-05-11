import { Client, Databases, Permission, Role, ID} from "appwrite" 

const client = new Client()

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)

export const databases = new Databases(client)

export { Permission, Role, ID } 