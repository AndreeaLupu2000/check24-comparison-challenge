import axios from "axios";
import { OfferDto } from "../types/OfferDto";
import { AddressInputDto } from "../types/AddressDto";

const API = import.meta.env.VITE_BACKEND_API_URL + '/offers';


export const getOffers = async (address: AddressInputDto): Promise<OfferDto[]> => {
    const response = await axios.post(`${API}`, address );
    return response.data.offers;
}


// SSE Streaming - returns an EventSource instance
export const streamOffers = (
    address: AddressInputDto,
    onOffer: (offer: OfferDto) => void,
    onComplete: () => void,
    onError?: (err: Error) => void
  ): EventSource => {
    const query = new URLSearchParams(address as unknown as Record<string, string>).toString();
    const eventSource = new EventSource(`${API}/stream?${query}`);
  
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

  export const getLateOffers = async (address: AddressInputDto): Promise<OfferDto[]> => {
    const query = new URLSearchParams(address as unknown as Record<string, string>).toString()
    const response = await axios.get(`${API}/offers/late?${query}`)
    return response.data.offers
  }

  export const createOffer = async (offer: OfferDto): Promise<OfferDto> => {
    const response = await axios.post(`${API}/create`, offer)
    return response.data
  }

export const getOfferById = async (id: string): Promise<OfferDto> => {
  const response = await axios.get(`${API}/search/${id}`);
  return response.data;
};

