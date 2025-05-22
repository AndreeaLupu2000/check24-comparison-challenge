//types/UserAddressDto.ts
export interface UserAddressDto {
    id: string;
    userId: string;
    addressId: string;
    createdAt: string;
}

export type UserAddressInputDto = Omit<UserAddressDto, "id" | "createdAt">


