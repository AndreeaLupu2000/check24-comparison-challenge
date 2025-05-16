import { AddressInputDto } from "./AddressDto";

export interface ShareDto {
    id: string;
    userId: string;
    address: AddressInputDto | string;
    offers: string[];
    createdAt: string;
}

export type CreateShareDto = Omit<ShareDto, 'id' | 'createdAt'>;
