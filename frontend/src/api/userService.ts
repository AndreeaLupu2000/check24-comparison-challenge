//api/userService.ts
// Axios
import axios from "axios";
// Types
import { UserDto, UserRegistrationDto } from "../types/UserDto";

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
 * Create a user
 * @param user - The user to create
 * @returns The created user
 */
export const createUser = async (user: UserRegistrationDto): Promise<UserDto> => {
    const response = await axios.post(API, user);
    return response.data;
}








