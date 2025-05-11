import { AddressDto } from "./AddressDto";

export interface ShareDto {
    id: string;
    userId: string;
    address: AddressDto | string;
    offers: string[];
    createdAt: string;
}

export type CreateShareDto = Omit<ShareDto, 'id' | 'createdAt'>;
