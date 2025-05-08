// OfferCard.tsx
import { OfferDto } from '../types/OfferDto';
import ByteMe from '../assets/byteme.png';
import WebWunder from '../assets/webwunder.png';
import PingPerfect from '../assets/pingperfect.png';
import ServusSpeed from '../assets/servusspeed.png';
import VerbynDich from '../assets/verbyndich.png';

interface OfferCardProps {
  offer: OfferDto;
  onView: (offer: OfferDto) => void;
}

const OfferCard = ({ offer, onView }: OfferCardProps) => {
  const getProviderImage = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'byteme':
        return ByteMe;
      case 'webwunder':
        return WebWunder;
      case 'ping perfect':
        return PingPerfect;
      case 'servus speed':
        return ServusSpeed;
      case 'verbyndich':
        return VerbynDich;
    }
  };

  return (
    <div
      onClick={() => onView(offer)}
      className="rounded-lg bg-white shadow-md p-5 hover:shadow-xl transition cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <img 
          src={getProviderImage(offer.provider)} 
          alt={`${offer.provider} logo`}
          className="relative w-24 h-24 object-contain rounded-lg"
        />
        <div className="flex-1">
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
      </div>
    </div>
  );
};

export default OfferCard;
