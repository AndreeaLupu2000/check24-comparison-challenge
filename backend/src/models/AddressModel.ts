// src/models/AddressModel.ts

export interface AddressInput {
  street: string;
  houseNumber: string;
  city: string;
  plz: string;
  countryCode?: string | "DE";
}