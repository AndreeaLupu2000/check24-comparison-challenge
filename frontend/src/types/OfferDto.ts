export interface OfferDto {
    provider: string;
    productId: string;
    title: string;
    speedMbps: number;
    pricePerMonth: number;
    durationMonths: number;
    connectionType: string;
    extras?: string[] | null;
}
