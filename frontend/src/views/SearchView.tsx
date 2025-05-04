// src/views/SearchView.tsx
import { useState, useEffect } from "react";
import { OfferDto } from "../types/OfferDto";
import { useAddress } from "../context/AddressContext";
import { streamOffers } from "../api/offerService";
import OfferCard from "../components/OfferCard";
import Icon from "../assets/icon.png";

const SearchView = () => {
  const { address, setAddress } = useAddress();
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<
    | "price low to high"
    | "price high to low"
    | "speed high to low"
    | "speed low to high"
    | undefined
  >(undefined);

  useEffect(() => {
    console.log("Address: ", address);
  }, [address]);

  /*const onSearch = async () => {
    if (
      !address.street ||
      !address.houseNumber ||
      !address.city ||
      !address.plz
    ) {
      alert("Please fill in all address fields");
      return;
    }

    setLoading(true);

    try {
      //const offers = await getOffers(address);
      setOffers([]);
      console.log("Offers: ", offers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };*/

  const onSearch = () => {
    if (!address.street || !address.houseNumber || !address.city || !address.plz) {
      alert("Please fill in all address fields");
      return;
    }
  
    setOffers([]);
    setLoading(true);
  
    streamOffers(
      address,
      (offer) => setOffers((prev) => [...prev, offer]), // onOffer
      () => setLoading(false),                         // onComplete
      () => setLoading(false)                          // onError
    );
  };
  
  

  // Sort offers
  const sortedOffers = sortBy
    ? [...offers].sort((a, b) => {
        if (sortBy === "price low to high") {
          return a.pricePerMonth - b.pricePerMonth;
        } else if (sortBy === "price high to low") {
          return b.pricePerMonth - a.pricePerMonth;
        } else if (sortBy === "speed high to low") {
          return b.speedMbps - a.speedMbps;
        } else {
          return a.speedMbps - b.speedMbps;
        }
      })
    : offers;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="w-full py-6 mb-8 mt-10">
        <div className="flex justify-center items-center gap-6 max-w-6xl mx-auto px-4">
          {/* Logo */}
          <img src={Icon} alt="GenDevNet Logo" className="w-32 h-auto" />

          {/* Title */}
          <h1 className="text-5xl font-bold leading-[3.5rem] text-gray-800">
            GenDevNet
          </h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Search Internet Providers
        </h1>
        {/* Input + Button Row */}
        <div className="flex gap-4 items-end">
          {/* Input Boxes (2x2 grid) */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Street */}
            <div className="flex flex-col">
              <label
                htmlFor="street"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Street
              </label>
              <input
                id="street"
                type="text"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                placeholder="Musterstraße"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* House Number */}
            <div className="flex flex-col">
              <label
                htmlFor="houseNumber"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                House Number
              </label>
              <input
                id="houseNumber"
                type="text"
                value={address.houseNumber}
                onChange={(e) =>
                  setAddress({ ...address, houseNumber: e.target.value })
                }
                placeholder="123"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* City */}
            <div className="flex flex-col">
              <label
                htmlFor="city"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                placeholder="Musterstadt"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* PLZ */}
            <div className="flex flex-col">
              <label
                htmlFor="plz"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                PLZ
              </label>
              <input
                id="plz"
                type="text"
                value={address.plz}
                onChange={(e) =>
                  setAddress({ ...address, plz: e.target.value })
                }
                placeholder="12345"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex-shrink-0 self-end">
            <button
              onClick={onSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="flex justify-end mb-4">
        <label className="mr-2 text-sm font-medium text-gray-700 self-center">
          Sort by:
        </label>
        <select
          value={sortBy ?? ""}
          onChange={(e) =>
            setSortBy(
              e.target.value === "price low to high" ||
                e.target.value === "price high to low" ||
                e.target.value === "speed high to low" ||
                e.target.value === "speed low to high"
                ? (e.target.value as
                    | "price low to high"
                    | "price high to low"
                    | "speed high to low"
                    | "speed low to high")
                : undefined
            )
          }
          className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select Sorting</option>
          <option value="price low to high">Price (Low to High)</option>
          <option value="price high to low">Price (High to Low)</option>
          <option value="speed high to low">Speed (High to Low)</option>
          <option value="speed low to high">Speed (Low to High)</option>
        </select>
      </div>

      {/* Offers Display */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : sortedOffers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 ">
          {sortedOffers.map((offer, index) => (
            <OfferCard key={index} offer={offer} onView={() => {}} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-6">
          No offers available for this address.
        </div>
      )}
    </div>
  );
};

export default SearchView;
