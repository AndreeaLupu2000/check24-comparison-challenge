//api/userAddressService.ts
// Axios
import axios from "axios";
// Types
import { UserAddressInputDto } from "../types/UserAddressDto";

// API URL for user addresses
const API_URL = import.meta.env.VITE_BACKEND_API_URL + '/userAddresses';

/**
 * Create a user address
 * @param userAddress - The user address to create
 * @returns The created user address
 */
export const createUserAddress = async (userAddress: UserAddressInputDto) => {
  const response = await axios.post(API_URL, userAddress);
  return response.data;
};


/**
 * Get the last used address by user ID
 * @param userId - The ID of the user to get the last used address for
 * @returns The last used address
 */
export const getLastUsedAddressByUserId = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/lastUsed/${userId}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "404") {
      // Handle 404 specifically
      console.warn("No address found for user");
      return null; // or handle however you'd like
    }
    // Handle other errors
    console.error("An error occurred:", error);
    throw error; // or return a default/fallback value
  }
};





