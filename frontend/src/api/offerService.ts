import axios from "axios";
import { OfferDto } from "../types/OfferDto";
import { AddressDto } from "../types/AddressDto";

const API = import.meta.env.VITE_BACKEND_API_URL;


export const getOffers = async (address: AddressDto): Promise<OfferDto[]> => {
    const response = await axios.post(`${API}/offers`, address );
    return response.data.offers;
}


// SSE Streaming - returns an EventSource instance
export const streamOffers = (
    address: AddressDto,
    onOffer: (offer: OfferDto) => void,
    onComplete: () => void,
    onError?: (err: Error) => void
  ): EventSource => {
    const query = new URLSearchParams(address as unknown as Record<string, string>).toString();
    const eventSource = new EventSource(`${API}/offers/stream?${query}`);
  
    eventSource.onmessage = (event) => {
      const offer: OfferDto = JSON.parse(event.data);
      onOffer(offer);
    };
  
    eventSource.addEventListener("done", () => {
      onComplete();
      eventSource.close();
    });
  
    eventSource.onerror = (err) => {
      console.error("Stream error", err);
      if (onError) onError(err as unknown as Error);
      eventSource.close();
    };
  
    return eventSource;
  };