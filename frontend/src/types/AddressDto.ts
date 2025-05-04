export interface AddressDto {
    street: string;
    houseNumber: string;
    city: string;
    plz: string;
    countryCode?: string | "DE";
}
