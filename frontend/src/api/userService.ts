import axios from "axios";
import { UserDto, UserRegistrationDto } from "../types/UserDto";
import { ShareDto } from "../types/ShareDto";

// API URL for users
const API = import.meta.env.VITE_BACKEND_API_URL + '/users';

/**
 * Get all users
 * @returns An array of users
 */
export const getAllUsers = async (): Promise<UserDto[]> => {
    const response = await axios.get(API);
    return response.data;
}

/**
 * Get a user by ID
 * @param id - The ID of the user to get
 * @returns The user
 */
export const getUserById = async (id: string): Promise<UserDto> => {
    const response = await axios.get(`${API}/${id}`);
    return response.data;
}

/**
 * Update a user
 * @param id - The ID of the user to update
 * @param user - The user to update
 * @returns The updated user
 */
export const updateUser = async (id: string, user: UserDto): Promise<UserDto> => {
    const response = await axios.put(`${API}/${id}`, user);
    return response.data;
}

/**
 * Delete a user
 * @param id - The ID of the user to delete
 * @returns The deleted user
 */
export const deleteUser = async (id: string): Promise<UserDto> => {
    const response = await axios.delete(`${API}/${id}`);
    return response.data;
}

/**
 * Update shares for a user
 * @param id - The ID of the user to update shares for
 * @param shares - The shares to update
 * @returns The updated user
 */
export const updateShares = async (id: string, shares: ShareDto[]): Promise<UserDto> => {
    const response = await axios.put(`${API}/${id}/shares`, shares);
    return response.data;
}

/**
 * Create a user
 * @param user - The user to create
 * @returns The created user
 */
export const createUser = async (user: UserRegistrationDto): Promise<UserDto> => {
    const response = await axios.post(API, user);
    return response.data;
}








