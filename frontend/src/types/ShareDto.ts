import { AddressDto } from "./AddressDto";
import { OfferDto } from "./OfferDto";

export interface ShareDto {
    id: string;
    userId: string;
    address: AddressDto;
    offers: OfferDto[];
    createdAt: Date;
}
