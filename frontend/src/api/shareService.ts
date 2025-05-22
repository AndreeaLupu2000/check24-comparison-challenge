//api/shareService.ts
// Axios
import axios from "axios";
// Types
import { ShareDto, CreateShareDto } from "../types/ShareDto";

// API URL for shares
const API = import.meta.env.VITE_BACKEND_API_URL + '/shares';

/**
 * Create a shared offer
 * @param share - The share to create
 * @returns The created share
 */
export const createSharedOffer = async (share: CreateShareDto): Promise<ShareDto> => {
    const response = await axios.post(`${API}`, share);
    return response.data;
}

/**
 * Get a shared offer by ID
 * @param id - The ID of the share to get
 * @returns The share
 */
export const getSharedOffer = async (id: string): Promise<ShareDto> => {
    const response = await axios.get(`${API}/${id}`);
    return response.data;
}

/**
 * Update a shared offer
 * @param id - The ID of the share to update
 * @param share - The share to update
 * @returns The updated share
 */
export const updateSharedOffer = async (id: string, share: ShareDto): Promise<ShareDto> => {
    const response = await axios.put(`${API}/${id}`, share);
    return response.data;
}

/**
 * Delete a shared offer
 * @param id - The ID of the share to delete
 * @returns The deleted share
 */
export const deleteSharedOffer = async (id: string): Promise<ShareDto> => {
    const response = await axios.delete(`${API}/${id}`);
    return response.data;
}

/**
 * Get all shared offers
 * @returns An array of shares
 */
export const getAllSharedOffers = async (): Promise<ShareDto[]> => {
    const response = await axios.get(API);
    return response.data;
}






