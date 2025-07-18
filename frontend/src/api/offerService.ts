//api/offerService.ts
// Axios
import axios from "axios";
// Types
import { OfferDto } from "../types/OfferDto";
import { AddressInputDto } from "../types/AddressDto";

// API URL for offers
const API = import.meta.env.VITE_BACKEND_API_URL + '/offers';

/**
 * Get offers for a given address
 * @param address - The address to get offers for
 * @returns An array of offers
 */
export const getOffers = async (address: AddressInputDto): Promise<OfferDto[]> => {
  const response = await axios.post(`${API}`, address);
  return response.data.offers;
}


/**
 * SSE Streaming - returns an EventSource instance
 * @param address - The address to stream offers for
 * @param onOffer - A function to call when an offer is received
 * @param onComplete - A function to call when the stream is complete
 * @param onError - An optional function to call if an error occurs
 * @returns An EventSource instance
 */
export const streamOffers = (
  address: AddressInputDto,
  onOffer: (offer: OfferDto) => void,
  onComplete: () => void,
  onError?: (err: Error) => void
): EventSource => {
  const query = new URLSearchParams(address as unknown as Record<string, string>).toString();
  const eventSource = new EventSource(`${API}/stream?${query}`);

  // Handle incoming offers
  eventSource.onmessage = (event) => {
    const offer: OfferDto = JSON.parse(event.data);
    onOffer(offer);
  };

  // Handle stream completion
  eventSource.addEventListener("done", () => {
    onComplete();
    eventSource.close();
  });

  // Handle stream errors
  eventSource.onerror = (err) => {
    console.error("Stream error", err);
    if (onError) onError(err as unknown as Error);
    eventSource.close();
  };

  return eventSource;
};

/**
 * Get offers for a given address
 * @param address - The address to get offers for
 * @returns An array of offers
 */
export const getLateOffers = async (address: AddressInputDto): Promise<OfferDto[]> => {
  const query = new URLSearchParams(address as unknown as Record<string, string>).toString()
  const response = await axios.get(`${API}/offers/late?${query}`)
  return response.data.offers
}

/**
 * Create an offer
 * @param offer - The offer to create
 * @returns The created offer
 */
export const createOffer = async (offer: OfferDto): Promise<OfferDto> => {
  const response = await axios.post(`${API}/create`, offer)
  return response.data
}

/**
 * Get an offer by ID
 * @param id - The ID of the offer to get
 * @returns The offer
 */
export const getOfferById = async (id: string): Promise<OfferDto> => {
  const response = await axios.get(`${API}/search/${id}`);
  return response.data;
};

