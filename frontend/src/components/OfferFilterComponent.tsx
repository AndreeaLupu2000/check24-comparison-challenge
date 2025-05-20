import React, { useEffect, useState } from 'react';
import { OfferDto } from '../types/OfferDto';

// Define the props for the OfferFilter component
interface OfferFilterProps {
  offers: OfferDto[];
  onFilter: (filtered: OfferDto[]) => void;
}

const OfferFilter: React.FC<OfferFilterProps> = ({ offers, onFilter }) => {
  // Local states for filter values
  const [provider, setProvider] = useState<string>('');
  const [minSpeed, setMinSpeed] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [duration, setDuration] = useState<number | ''>('');

  // Unique providers from all offers
  const uniqueProviders = Array.from(new Set(offers.map(o => o.provider)));

  // Effect to filter offers based on current filter values
  useEffect(() => {
    const filtered = offers.filter((o) => {
      const matchesProvider = provider ? o.provider === provider : true;
      const matchesSpeed = parseFloat(o.speedMbps) >= minSpeed;
      const matchesPrice = parseFloat(o.pricePerMonth) <= maxPrice;
      const matchesDuration = duration ? parseInt(o.durationMonths) === duration : true;

      return matchesProvider && matchesSpeed && matchesPrice && matchesDuration;
    });

    onFilter(filtered);
  }, [provider, minSpeed, maxPrice, duration, offers]);

  // ------------------------ JSX: Offer Filter Layout ------------------------
  return (
    <div className="bg-white rounded-md p-4 shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-3">Filter Offers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* ------------------ Provider Filter ------------------ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="">All</option>
            {uniqueProviders.map((prov) => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>

        {/* ------------------ Min Speed Filter ------------------ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Speed (Mbps)</label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-3 py-2"
            value={minSpeed}
            onChange={(e) => setMinSpeed(Number(e.target.value))}
          />
        </div>

        {/* ------------------ Max Price Filter ------------------ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (€)</label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-3 py-2"
            value={isFinite(maxPrice) ? maxPrice : ''}
            onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : Infinity)}
          />
        </div>

        {/* ------------------ Duration Filter ------------------ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Months)</label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-3 py-2"
            value={duration}
            onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : '')}
          />
        </div>
      </div>
    </div>
  );
};

export default OfferFilter;
