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
  





