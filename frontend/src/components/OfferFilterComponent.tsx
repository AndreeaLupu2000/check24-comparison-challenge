// components/OfferFilterComponent.tsx
// React
import React, { useEffect, useState, useMemo } from "react";
// Dtos
import { OfferDto } from "../types/OfferDto";

/**
 * OfferFilter component
 * @param offers - The offers to filter
 * @param onFilter - The function to call when the filter is applied
 * @returns The OfferFilter component
 */
interface OfferFilterProps {
  offers: OfferDto[];
  onFilter: (filtered: OfferDto[]) => void;
}

/**
 * OfferFilter component
 * @param offers - The offers to filter
 * @param onFilter - The function to call when the filter is applied
 * @returns The OfferFilter component
 */
const OfferFilter: React.FC<OfferFilterProps> = ({ offers, onFilter }) => {
  // Calculate min/max values from all offers
  const { speedRange, priceRange, durationRange } = useMemo(() => {
    if (offers.length === 0) {
      return {
        speedRange: { min: 0, max: 1000 },
        priceRange: { min: 0, max: 100 },
        durationRange: { min: 1, max: 24 }
      };
    }

    const speeds = offers.map(o => parseFloat(o.speedMbps));
    const prices = offers.map(o => parseFloat(o.pricePerMonth));
    const durations = offers.map(o => parseInt(o.durationMonths));

    return {
      speedRange: { min: Math.min(...speeds), max: Math.max(...speeds) },
      priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
      durationRange: { min: Math.min(...durations), max: Math.max(...durations) }
    };
  }, [offers]);

  // Local states for filter values
  const [provider, setProvider] = useState<string>("");
  const [speedMin, setSpeedMin] = useState<number>(speedRange.min);
  const [speedMax, setSpeedMax] = useState<number>(speedRange.max);
  const [priceMin, setPriceMin] = useState<number>(priceRange.min);
  const [priceMax, setPriceMax] = useState<number>(priceRange.max);
  const [durationMin, setDurationMin] = useState<number>(durationRange.min);
  const [durationMax, setDurationMax] = useState<number>(durationRange.max);
  const [filteredCount, setFilteredCount] = useState<number>(offers.length);


  // Update slider values when offers change
  useEffect(() => {
    setSpeedMin(speedRange.min);
    setSpeedMax(speedRange.max);
    setPriceMin(priceRange.min);
    setPriceMax(priceRange.max);
    setDurationMin(durationRange.min);
    setDurationMax(durationRange.max);
  }, [speedRange, priceRange, durationRange]);

  // Unique providers from all offers
  const uniqueProviders = Array.from(new Set(offers.map((o) => o.provider)));

  // Effect to filter offers based on current filter values
  useEffect(() => {
    // Start with all offers
    let filtered = [...offers];

    // Apply Provider filter first
    if (provider !== "") {
      filtered = filtered.filter(o => o.provider === provider);
    }

    // Apply Speed filter to the already filtered results
    if (speedMin > speedRange.min || speedMax < speedRange.max) {
      filtered = filtered.filter(o => {
        const speed = parseFloat(o.speedMbps);
        return speed >= speedMin && speed <= speedMax;
      });
    }

    // Apply Price filter to the already filtered results
    if (priceMin > priceRange.min || priceMax < priceRange.max) {
      filtered = filtered.filter(o => {
        const price = parseFloat(o.pricePerMonth);
        return price >= priceMin && price <= priceMax;
      });
    }

    // Apply Duration filter to the already filtered results
    if (durationMin > durationRange.min || durationMax < durationRange.max) {
      filtered = filtered.filter(o => {
        const duration = parseInt(o.durationMonths);
        return duration >= durationMin && duration <= durationMax;
      });
    }

    setFilteredCount(filtered.length);
    onFilter(filtered);
  }, [provider, speedMin, speedMax, priceMin, priceMax, durationMin, durationMax, offers, speedRange, priceRange, durationRange]);

  const DualInputRange = ({
    label,
    unit = "",
    valueMin,
    valueMax,
    onMinChange,
    onMaxChange,
    min,
    max
  }: {
    label: string;
    unit?: string;
    valueMin: number;
    valueMax: number;
    onMinChange: (value: number) => void;
    onMaxChange: (value: number) => void;
    min: number;
    max: number;
  }) => {
    const [minInput, setMinInput] = useState(valueMin.toString());
    const [maxInput, setMaxInput] = useState(valueMax.toString());
  
    // Sync external changes into local state
    useEffect(() => setMinInput(valueMin.toString()), [valueMin]);
    useEffect(() => setMaxInput(valueMax.toString()), [valueMax]);
  
    const handleMinBlur = () => {
      const parsed = parseFloat(minInput);
      if (!isNaN(parsed) && parsed <= valueMax && parsed >= min) {
        onMinChange(parsed);
      } else {
        setMinInput(valueMin.toString()); // Reset if invalid
      }
    };
  
    const handleMaxBlur = () => {
      const parsed = parseFloat(maxInput);
      if (!isNaN(parsed) && parsed >= valueMin && parsed <= max) {
        onMaxChange(parsed);
      } else {
        setMaxInput(valueMax.toString()); // Reset if invalid
      }
    };
  
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-0.5">Min</label>
            <input
              type="text"
              inputMode="decimal"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={handleMinBlur}
              className="w-full border px-2 py-1 rounded text-sm"
              placeholder={`Min${unit}`}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-0.5">Max</label>
            <input
              type="text"
              inputMode="decimal"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={handleMaxBlur}
              className="w-full border px-2 py-1 rounded text-sm"
              placeholder={`Max${unit}`}
            />
          </div>
        </div>
      </div>
    );
  };
  



  // ------------------------ JSX: Offer Filter Layout ------------------------
  return (
    <div className="bg-white rounded-md p-4 shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-3">Filter Offers</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ------------------ Provider Filter ------------------ */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-0.5">
            Provider 
          </label>
          <span className="block text-xs text-gray-600 mb-1">
            Name
          </span>
          <select
            className="w-full border px-2 py-1.25 rounded text-sm"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="">All</option>
            {uniqueProviders.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        {/* ------------------ Speed Range Filter ------------------ */}
        <DualInputRange
          label="Speed Range (Mbps)"
          unit=" Mbps"
          min={speedRange.min}
          max={speedRange.max}
          valueMin={speedMin}
          valueMax={speedMax}
          onMinChange={setSpeedMin}
          onMaxChange={setSpeedMax}
        />


        {/* ------------------ Price Range Filter ------------------ */}
        <DualInputRange
          label="Price Range (€)"
          unit="€"
          min={priceRange.min}
          max={priceRange.max}
          valueMin={priceMin}
          valueMax={priceMax}
          onMinChange={setPriceMin}
          onMaxChange={setPriceMax}
        />

        {/* ------------------ Duration Range Filter ------------------ */}
        <DualInputRange
          label="Duration Range (Months)"
          unit=" months"
          min={durationRange.min}
          max={durationRange.max}
          valueMin={durationMin}
          valueMax={durationMax}
          onMinChange={setDurationMin}
          onMaxChange={setDurationMax}
        />

      </div>
      {filteredCount === 0 && (
  <div className="mt-4 text-sm text-red-600">
    No offers match your selected filters.
  </div>
)}
    </div>
  );
};

export default OfferFilter;
