import axios from "axios";
import { UserAddressInputDto } from "../types/UserAddressDto";

const API_URL = import.meta.env.VITE_BACKEND_API_URL + '/userAddresses';

export const createUserAddress = async (userAddress: UserAddressInputDto) => {
    const response = await axios.post(API_URL, userAddress);
    return response.data;
};

export const getUserAddresses =  async() : Promise<UserAddressInputDto[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const getLastUsedAddressByUserId = async (userId: string) => {
    try {
      const response = await axios.get(`${API_URL}/lastUsed/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Handle 404 specifically
        console.warn("No address found for user");
        return null; // or handle however you'd like
      }
      // Handle other errors
      console.error("An error occurred:", error);
      throw error; // or return a default/fallback value
    }
  };
  




