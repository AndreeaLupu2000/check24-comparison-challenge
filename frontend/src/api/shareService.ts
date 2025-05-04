import axios from "axios";
import { ShareDto, CreateShareDto } from "../types/ShareDto";

const API = import.meta.env.VITE_BACKEND_API_URL;


export const createSharedOffer = async (share: CreateShareDto): Promise<ShareDto> => {
    const response = await axios.post(`${API}/share`, share);
    return response.data;
}


export const getSharedOffer = async (id: string): Promise<ShareDto> => {
    const response = await axios.get(`${API}/share/${id}`);
    return response.data;
}


export const updateSharedOffer = async (id: string, share: ShareDto): Promise<ShareDto> => {
    const response = await axios.put(`${API}/share/${id}`, share);
    return response.data;
}


export const deleteSharedOffer = async (id: string): Promise<ShareDto> => {
    const response = await axios.delete(`${API}/share/${id}`);
    return response.data;
}


export const getAllSharedOffers = async (): Promise<ShareDto[]> => {
    const response = await axios.get(`${API}/share`);
    return response.data;
}






