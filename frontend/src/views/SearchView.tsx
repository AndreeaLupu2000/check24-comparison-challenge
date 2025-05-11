// src/views/SearchView.tsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OfferDto } from "../types/OfferDto";
import { useAddress } from "../context/AddressContext";
import { streamOffers } from "../api/offerService";
import OfferCard from "../components/OfferCard";
import Icon from "../assets/icon.png";
import { createSharedOffer } from "../api/shareService";
import { getAllUsers } from "../api/userService";
import { useAuth } from "../context/AuthContext";
import AddressComponent from "../components/AddressComponent";
import { createAddress } from "../api/addressService";

/**
 * SearchView Component
 *
 * Main component for handling address search and displaying internet provider offers.
 * Implements address validation, autocomplete, history management, and offer streaming.
 */
const SearchView = () => {
  // Context and Primary State Management
  const { address, setAddress } = useAddress();
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Sorting Configuration
  const [sortBy, setSortBy] = useState<
    | "price low to high"
    | "price high to low"
    | "speed high to low"
    | "speed low to high"
    | undefined
  >(undefined);

  // Share Management
  const [shareId, setShareId] = useState<string | null>(null);

  // Authentication Context
  const { email } = useAuth();

  // Temporary Storage for Streaming Offers
  const offersArray: OfferDto[] = [];

  // Router Utilities
  const location = useLocation();
  const navigate = useNavigate();  

  /**
   * Handle initial address loading and auto-search
   * Processes URL parameters and stored addresses
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const street = params.get("street") || "";
    const houseNumber = params.get("houseNumber") || "";
    const city = params.get("city") || "";
    const plz = params.get("plz") || "";

    const hasSearchParams = ["street", "houseNumber", "city", "plz"].some(
      (param) => params.get(param) !== null
    );

    if (!hasSearchParams) {
      const storedAddress = localStorage.getItem("address");

      if (storedAddress) {
        const parsedAddress = JSON.parse(storedAddress);
        setAddress(parsedAddress);
        onSearch(); // Auto-trigger search for remembered address
      }
    }

    if (hasSearchParams) {
      setAddress({ street, houseNumber, city, plz, countryCode: "DE" });
      onSearch(); // auto-search for shared links
    }
  }, []);

  /**
   * Main search handler
   * Validates address and initiates offer streaming
   */
  const onSearch = async () => {
    // Input validation
    console.log(address);
    if (
      !address.street ||
      !address.houseNumber ||
      !address.city ||
      !address.plz
    ) {
      alert("Please fill in all address fields");
      return;
    }

    await createAddress(
      {
        street: address.street,
        houseNumber: address.houseNumber,
        plz: address.plz,
        city: address.city,
      }
    );

    // Save valid address to localStorage
    localStorage.setItem("address", JSON.stringify(address));

    // Initialize search
    setOffers([]);
    setLoading(true);
    setIsStreaming(true);

    // Stream offers and handle results
    streamOffers(
      address,
      handleNewOffer,
      handleStreamComplete,
      handleStreamError
    );
  };

  /**
   * Handle incoming offers during streaming
   */
  const handleNewOffer = (offer: OfferDto) => {
    setOffers((prev) => {
      const updatedOffers = [...prev, offer];
      offersArray.push(offer);
      return updatedOffers;
    });
    setLoading(false);
  };

  /**
   * Handle stream completion
   */
  const handleStreamComplete = async () => {
    setLoading(false);
    setIsStreaming(false);

    const getUserId = async () => {
      const users = await getAllUsers();
      if (users.length > 0) {
        for (const user of users) {
          if (user.email === email) {
            return user.id.toString();
          }
        }
      }
      return "";
    };

    const userId = await getUserId();

    createSharedOffer({
      userId: userId,
      address,
      offers: offersArray,
    })
      .then((share) => {
        setShareId(share.id);
        const shareUrl = `${window.location.origin}/share/${share.id}`;
        console.log(shareUrl);
      })
      .catch((err) => {
        console.error("Failed to create share link", err);
      });

    navigate(
      `/search?street=${encodeURIComponent(
        address.street
      )}&houseNumber=${encodeURIComponent(
        address.houseNumber
      )}&city=${encodeURIComponent(address.city)}&plz=${encodeURIComponent(
        address.plz
      )}`
    );
  };

  /**
   * Handle stream error
   */
  const handleStreamError = () => {
    setLoading(false);
    setIsStreaming(false);
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

  // Share URL
  const shareUrl = shareId
    ? `${window.location.origin}/share/${shareId}`
    : `${window.location.origin}/search?street=${encodeURIComponent(
        address.street
      )}&houseNumber=${encodeURIComponent(
        address.houseNumber
      )}&city=${encodeURIComponent(address.city)}&plz=${encodeURIComponent(
        address.plz
      )}`;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
        
        {/* Address Component */}
        <AddressComponent/>

        {/* Search and Share Buttons - Updated styling */}
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={onSearch}
            className="w-full max-w-[200px] bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 text-lg font-medium transition-colors duration-200"
          >
            Search
          </button>
          <button
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(
                  `Check out these offers: ${shareUrl}`
                )}`,
                "_blank"
              )
            }
            className="w-full max-w-[200px] bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 text-lg font-medium transition-colors duration-200"
          >
            Share
          </button>
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
      {loading && offers.length === 0 ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : sortedOffers.length > 0 ? (
        <div className="space-y-4">
          {sortedOffers.map((offer, index) => (
            <OfferCard key={index} offer={offer} onView={() => {}} />
          ))}

          {/* Show loading indicator at bottom while streaming */}
          {isStreaming && (
            <div className="flex justify-center items-center py-4">
              <div className="h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">
                Loading more results...
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-6">
          {isStreaming
            ? "Searching for offers..."
            : "No offers available for this address."}
        </div>
      )}
    </div>
  );
};

export default SearchView;
