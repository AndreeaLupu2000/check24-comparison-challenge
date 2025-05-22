import axios from 'axios';
import { AddressInputDto, AddressDto } from '../types/AddressDto';

// API URL for addresses
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_API; // Replace with your actual API key

// API URL for addresses
const API = import.meta.env.VITE_BACKEND_API_URL + '/addresses';

/**
 * Validate an address
 * @param street - The street name
 * @param number - The house number
 * @param postalCode - The postal code
 * @param city - The city name
 * @returns A boolean indicating if the address is valid
 */
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

/**
 * Create an address
 * @param address - The address to create
 * @returns The created address
 */
export const createAddress = async (address: AddressInputDto): Promise<AddressDto> => {
  const response = await axios.post(API, address);
  return response.data;
}

/**
 * Get all addresses
 * @returns An array of addresses
 */
export const getAllAddresses = async (): Promise<AddressInputDto[]> => {
  const response = await axios.get(API);
  return response.data;
}






