import axios from 'axios';
import { AddressDto } from '../types/AddressDto';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API; // Replace with your actual API key

const API = import.meta.env.VITE_BACKEND_API_URL + '/addresses';
export async function validateAddress(
  street: string,
  number: string,
  postalCode: string,
  city: string
): Promise<{ valid: boolean; formattedAddress?: string }> {
  // Allow both English and German city names by not hardcoding the country
  const address = `${street} ${number}, ${postalCode} ${city}, DE`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}&language=de&region=de`;

  try {

    console.log(url);
    console.log(address);
    const response = await axios.get(url);
    const result = response.data;

    if (result.status === 'OK' && result.results.length > 0) {
      return {
        valid: true,
        formattedAddress: result.results[0].formatted_address
      };
    } else {
      return { valid: false };
    }
  } catch (error) {
    console.error('Address validation failed:', error);
    return { valid: false };
  }
}

export const createAddress = async (address: AddressDto): Promise<AddressDto> => {
  const response = await axios.post(API, address);
  return response.data;
}

export const getAllAddresses = async (): Promise<AddressDto[]> => {
  const response = await axios.get(API);
  return response.data;
}

export const getAddress = async (id: string): Promise<AddressDto> => {
  const response = await axios.get(`${API}/${id}`);
  return response.data;
}







