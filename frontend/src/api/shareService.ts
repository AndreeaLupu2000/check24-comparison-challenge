import axios from "axios";
import { ShareDto } from "../types/ShareDto";

const API = import.meta.env.VITE_BACKEND_API_URL;


export const createShareOffer = async (share: ShareDto): Promise<ShareDto> => {
    const response = await axios.post(`${API}/shares`, share);
    return response.data;
}


export const getShareOffer = async (id: string): Promise<ShareDto> => {
    const response = await axios.get(`${API}/shares/${id}`);
    return response.data;
}


export const updateShareOffer = async (id: string, share: ShareDto): Promise<ShareDto> => {
    const response = await axios.put(`${API}/shares/${id}`, share);
    return response.data;
}


export const deleteShareOffer = async (id: string): Promise<ShareDto> => {
    const response = await axios.delete(`${API}/shares/${id}`);
    return response.data;
}


export const getAllShareOffers = async (): Promise<ShareDto[]> => {
    const response = await axios.get(`${API}/shares`);
    return response.data;
}






