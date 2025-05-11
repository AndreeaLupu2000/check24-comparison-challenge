export interface AddressDto {
    id: string
    street: string;
    houseNumber: string;
    city: string;
    plz: string;
    countryCode?: string | "DE";
}

export type AddressInputDto = Omit<AddressDto, "id">
