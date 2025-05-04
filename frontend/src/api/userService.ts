import axios from "axios";
import { UserDto, UserRegistrationDto } from "../types/UserDto";
import { ShareDto } from "../types/ShareDto";


const API = import.meta.env.VITE_BACKEND_API_URL;

export const getAllUsers = async (): Promise<UserDto[]> => {
    const response = await axios.get(`${API}/users`);
    return response.data;
}

export const getUserById = async (id: string): Promise<UserDto> => {
    const response = await axios.get(`${API}/users/${id}`);
    return response.data;
}


export const updateUser = async (id: string, user: UserDto): Promise<UserDto> => {
    const response = await axios.put(`${API}/users/${id}`, user);
    return response.data;
}

export const deleteUser = async (id: string): Promise<UserDto> => {
    const response = await axios.delete(`${API}/users/${id}`);
    return response.data;
}

export const updateShares = async (id: string, shares: ShareDto[]): Promise<UserDto> => {
    const response = await axios.put(`${API}/users/${id}/shares`, shares);
    return response.data;
}

export const createUser = async (user: UserRegistrationDto): Promise<UserDto> => {
    const response = await axios.post(`${API}/users`, user);
    return response.data;
}








