// src/views/SearchView.tsx
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OfferDto } from "../types/OfferDto";
import { useAddress } from "../context/AddressContext";
import { streamOffers } from "../api/offerService";
import OfferCard from "../components/OfferCard";
import Icon from "../assets/icon.png";
import { createSharedOffer, getAllSharedOffers } from "../api/shareService";
import { getAllUsers } from "../api/userService";
import { useAuth } from "../context/AuthContext";
import { Autocomplete } from "@react-google-maps/api";

const SearchView = () => {
  const { address, setAddress } = useAddress();
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // tracking if offers are still being streamed
  const [sortBy, setSortBy] = useState<
    | "price low to high"
    | "price high to low"
    | "speed high to low"
    | "speed low to high"
    | undefined
  >(undefined);
  const [shareId, setShareId] = useState<string | null>(null);
  const plzRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const [plzAutocomplete, setPlzAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [streetAutocomplete, setStreetAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const { email } = useAuth();

  const offersArray: OfferDto[] = [];

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const street = params.get("street") || "";
    const houseNumber = params.get("houseNumber") || "";
    const city = params.get("city") || "";
    const plz = params.get("plz") || "";

    if (street && houseNumber && city && plz) {
      setAddress({ street, houseNumber, city, plz, countryCode: "DE" });
      onSearch(); // auto-search for shared links
    }
  }, []);

  const onSearch = () => {
    if (
      !address.street ||
      !address.houseNumber ||
      !address.city ||
      !address.plz
    ) {
      alert("Please fill in all address fields");
      return;
    }

    setOffers([]);
    setLoading(true);
    setIsStreaming(true);
    streamOffers(
      address,
      (offer) => {
        setOffers((prev) => {
          const updatedOffers = [...prev, offer];
          offersArray.push(offer);
          return updatedOffers;
        });
        setLoading(false);
      },
      async () => {
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

        // Get the final offers array directly from the state using a ref
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
      },
      () => {
        setLoading(false);
        setIsStreaming(false);
      }
    );

    console.log("Offers", offers);
    console.log("OffersArray", offersArray);
    console.log("SharedItem", getAllSharedOffers());

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

  const shareUrl = shareId
    ? `${window.location.origin}/share/${shareId}`
    : `${window.location.origin}/search?street=${encodeURIComponent(
        address.street
      )}&houseNumber=${encodeURIComponent(
        address.houseNumber
      )}&city=${encodeURIComponent(address.city)}&plz=${encodeURIComponent(
        address.plz
      )}`;

  const onPlzLoad = (autocomplete: google.maps.places.Autocomplete) =>
    setPlzAutocomplete(autocomplete);

  const onStreetLoad = (autocomplete: google.maps.places.Autocomplete) =>
    setStreetAutocomplete(autocomplete);

  const onPlzPlaceChanged = () => {
    if (plzAutocomplete !== null) {
      const place = plzAutocomplete.getPlace();
      const postalCode =
        place.address_components?.find((c) => c.types.includes("postal_code"))
          ?.long_name || "";
      const cityName =
        place.address_components?.find((c) => c.types.includes("locality"))
          ?.long_name || "";
      setAddress({
        ...address,
        plz: postalCode,
        city: cityName,
        countryCode: "DE",
      });
    }
  };

  const onStreetPlaceChanged = () => {
    if (streetAutocomplete !== null) {
      const place = streetAutocomplete.getPlace();
      const streetName =
        place.address_components?.find((c) => c.types.includes("route"))
          ?.long_name || "";
      setAddress({
        ...address,
        street: streetName,
        countryCode: "DE",
      });
    }
  };

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
            {/* PLZ */}
            <div className="flex flex-col">
              <label
                htmlFor="plz"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                PLZ
              </label>
              <Autocomplete
                onLoad={onPlzLoad}
                onPlaceChanged={onPlzPlaceChanged}
                options={{
                  types: ["(regions)"],
                  componentRestrictions: { country: "de" },
                }}
              >
                <input
                  ref={plzRef}
                  id="plz"
                  type="text"
                  value={address.plz}
                  onChange={(e) =>
                    setAddress({ ...address, plz: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md shadow-sm"
                  placeholder="12345"
                />
              </Autocomplete>
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

            {/* Street */}
            <div className="flex flex-col">
              <label
                htmlFor="street"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Street
              </label>
              <Autocomplete
              onLoad={onStreetLoad}
              onPlaceChanged={onStreetPlaceChanged}
              options={{
                types: ["address"],
                componentRestrictions: { country: "de" },
              }}
            >
              <input
                ref={streetRef}
                id="street"
                type="text"
                value={address.street}
                onChange={(e) =>
                  setAddress({ ...address, street: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md shadow-sm"
                placeholder="Musterstraße"
              />
            </Autocomplete>
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
          <div className="flex justify-end mt-4">
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(
                    `Check out these offers: ${shareUrl}`
                  )}`,
                  "_blank"
                )
              }
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Share
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

      {/* Modified Offers Display */}
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
