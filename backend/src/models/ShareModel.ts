import { AddressInput } from "./AddressModel";
export interface Share {
  userId: string
  offerIds: string[]
  address: AddressInput
  offers: string[]
  createdAt: string
}

