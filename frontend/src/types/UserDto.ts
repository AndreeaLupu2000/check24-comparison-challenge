import {ShareDto} from './ShareDto'

export interface UserDto {
  id: string;
  email: string;
  password: string;
  shares: ShareDto[] | null;
}

export interface UserRegistrationDto {
  email: string;
  password: string;
}


