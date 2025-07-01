//api/offerService.ts
// Types
import { OfferDto } from "../types/OfferDto";
import { AddressInputDto } from "../types/AddressDto";

// API URL for offers
const API = import.meta.env.VITE_BACKEND_API_URL + '/offers';

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
