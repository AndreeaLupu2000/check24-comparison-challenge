// OfferCard.tsx
import { OfferDto } from '../types/OfferDto';

interface OfferCardProps {
  offer: OfferDto;
  onView: (offer: OfferDto) => void;
}

const OfferCard = ({ offer, onView }: OfferCardProps) => {
  return (
    <div
      onClick={() => onView(offer)}
      className="rounded-lg bg-white shadow-md p-5 hover:shadow-xl transition cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{offer.title}</h3>
          <p className="text-sm text-gray-500">{offer.provider}</p>
        </div>
        <div className="text-sm font-semibold text-blue-600">{offer.pricePerMonth} €</div>
      </div>
      <div className="text-sm text-gray-700">Speed: {offer.speedMbps} Mbps</div>
      <div className="text-sm text-gray-700">Duration: {offer.durationMonths} months</div>
    </div>
  );
};

export default OfferCard;
