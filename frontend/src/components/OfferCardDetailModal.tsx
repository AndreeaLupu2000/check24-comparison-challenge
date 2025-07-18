// components/OfferCardDetailModal.tsx
// React
import React from "react";
// Dtos
import { OfferDto } from "../types/OfferDto";
// Assets
import ByteMe from "../assets/byteme.png";
import WebWunder from "../assets/webwunder.png";
import PingPerfect from "../assets/pingperfect.png";
import ServusSpeed from "../assets/servusspeed.png";
import VerbynDich from "../assets/verbyndich.png";

/**
 * OfferCardDetailModal component displays the details of a single internet offer
 * @param offer - The offer to display
 * @param onClose - The function to call when the offer is closed
 * @returns The OfferCardDetailModal component
 */
interface Props {
  offer: OfferDto;
  onClose: () => void;
}

/**
 * OfferCardDetailModal component displays the details of a single internet offer
 * @param offer - The offer to display
 * @param onClose - The function to call when the offer is closed
 * @returns The OfferCardDetailModal component
 */
const OfferCardDetailModal: React.FC<Props> = ({ offer, onClose }) => {
  // Helper function to return the correct logo image based on provider name
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
      default:
        return '';
    }
  };

  // ------------------------ JSX: Offer Card Detail Modal Layout ------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm">

      <div className="bg-white bg-opacity-100 backdrop-blur rounded-lg shadow-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>

        <div className="flex items-center gap-6 mb-6">
          {/* ------------------ Provider logo ------------------ */}
          <img
            src={getProviderImage(offer.provider)}
            alt={`${offer.provider} logo`}
            className="w-24 h-24 object-contain"
          />

          {/* ------------------ Provider title and provider name ------------------ */}
          <div>
            <h2 className="text-2xl font-bold">{offer.title}</h2>
            <p className="text-xl text-gray-600">{offer.provider}</p>
          </div>
        </div>

        {/* ------------------ Speed, price, duration and extras ------------------ */}
        <div className="space-y-2 text-xl text-gray-700">
          <p><strong>Speed:</strong> {offer.speedMbps} Mbps</p>
          <p><strong>Price per Month:</strong> {offer.pricePerMonth} €</p>
          <p><strong>Duration:</strong> {offer.durationMonths} months</p>

          {/* ------------------ Extras based on the provider's offer ------------------ */}
          {offer.extras && (
            <div>
                <strong>Extras:</strong>
                {(() => {
                const parsedExtras = typeof offer.extras === 'string'
                    ? JSON.parse(offer.extras)
                    : offer.extras;

                if (!Array.isArray(parsedExtras) || parsedExtras.length === 0) {
                    return <p className="text-gray-500 mt-1">No extra information</p>;
                }

                const validExtras = parsedExtras.filter((extra: string) => {
                    const [, rawValue] = extra.split(':').map(s => s.trim());
                    return rawValue && rawValue.toLowerCase() !== 'null';
                });

                if (validExtras.length === 0) {
                    return <p className="text-gray-500 mt-1">No extra information</p>;
                }

                return (
                    <ul className="list-disc list-inside mt-1 space-y-1">
                    {validExtras.map((extra: string, idx: number) => {
                        const [label, rawValue] = extra.split(':').map(s => s.trim());
                        const value = rawValue ?? '';
                        let displayValue = value;

                        if (value.toLowerCase() === 'true' || value.toLowerCase() === '1' || value.toLowerCase() === 'ja' || value.toLowerCase() === 'yes') displayValue = '✅';
                        else if (value.toLowerCase() === 'false' || value.toLowerCase() === '0' || value.toLowerCase() === 'nein' || value.toLowerCase() === 'no') displayValue = '❌';

                        return (
                        <li key={idx} className="text-gray-700">
                            {label}{value ? `: ${displayValue}` : ''}
                        </li>
                        );
                    })}
                    </ul>
                );
                })()}
            </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default OfferCardDetailModal;
