// views/SharedView.tsx
// React
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
// Dtos
import { OfferDto } from "../types/OfferDto";
// Contexts
import { useAddress } from "../context/AddressContext";
import { useAuth } from "../context/AuthContext";
// Services
import { streamOffers } from "../api/offerService";
import { createSharedOffer, getSharedOffer } from "../api/shareService";
import { createAddress } from "../api/addressService";
import { createUserAddress } from "../api/userAddressService";
// Components
import OfferCard from "../components/OfferCard";
import AddressComponent from "../components/AddressComponentWrapper";
import OfferCardDetailModal from "../components/OfferCardDetailModal";
import OfferFilter from "../components/OfferFilterComponent";
// Assets
import Icon from "../assets/icon.png";

const SharedView = () => {
  // Context of the current address
  const { address, setAddress } = useAddress();

  // Context of the current user
  const { user } = useAuth();

  // Local state for all offers
  const [offers, setOffers] = useState<OfferDto[]>([]);

  // Local state for loading
  const [loading, setLoading] = useState(false);

  // Local state for streaming
  const [isStreaming, setIsStreaming] = useState(false);

  // Local state for can share to know when to show the share button
  const [canShare, setCanShare] = useState(false);

  // Local state for sorting
  const [sortBy, setSortBy] = useState<
    | "price low to high"
    | "price high to low"
    | "speed high to low"
    | "speed low to high"
    | undefined
  >(undefined);

  // Navigation to other views
  const navigate = useNavigate();

  // Location of the current view
  const location = useLocation();

  // Local state for the offers reference
  const offersRef = useRef<OfferDto[]>([]);
  const offerStringRef = useRef<string[]>([]);

  // Local state for the selected offer
  const [selectedOffer, setSelectedOffer] = useState<OfferDto | null>(null);

  // Local state for showing the filter
  const [showFilter, setShowFilter] = useState(false);

  // Local state for filtered offers
  const [filteredOffers, setFilteredOffers] = useState<OfferDto[]>([]);

  // Local state for address errors
  const [addressErrors, setAddressErrors] = useState<{
    plz?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
  }>({});

  // Local state for the share ID
  const { id } = useParams();

  // Add new state for tracking view mode
  const [isSharedView, setIsSharedView] = useState(false);

  // Hook to load shared offers if the URL has a share ID
  useEffect(() => {
    const loadSharedOffers = async () => {
      try {
        // If no share ID, return
        if (!id) return;

        // Set the view to shared
        setIsSharedView(true);

        // Set the loading to true; used for increasing the user experience
        setLoading(true);

        // Get the shared offers by id
        const share = await getSharedOffer(id);

        // Parse the offers
        const validOffers = share.offers.map((offer) => JSON.parse(offer));

        // Set the offers
        setOffers(validOffers);
      } catch (err) {
        console.error(err);
      } finally {
        // Set the loading to false
        setLoading(false);
      }
    };

    // Load the shared offers
    loadSharedOffers();
  }, [id]);

  // Auto-load address from URL or localStorage. It applies automatically the address and searches for offers.
  useEffect(() => {
    // Get the search params for the location
    const params = new URLSearchParams(location.search);
    const street = params.get("street") || "";
    const houseNumber = params.get("houseNumber") || "";
    const city = params.get("city") || "";
    const plz = params.get("plz") || "";

    // Set the can share to false
    setCanShare(false);

    // Check if the search params are set
    const hasSearchParams = ["street", "houseNumber", "city", "plz"].some(
      (param) => params.get(param) !== null
    );

    // If the search params are set, set the address
    if (hasSearchParams) {
      setAddress({
        street,
        houseNumber,
        city,
        plz,
        countryCode: "DE",
      });
    } else {
      // If the search params are not set, get the address from the localStorage
      const storedAddress = localStorage.getItem("address");

      // If the address is in the local storage, set the address
      if (storedAddress) {
        // Parse the address
        const parsed = JSON.parse(storedAddress);
        setAddress(parsed);
      }
    }
  }, []);

  // Handles incoming offers one at a time during streaming
  const handleNewOffer = (offer: OfferDto) => {
    // Add the offer to the offers reference coming from the streamOffers function
    offersRef.current.push(offer);

    // Add the offer to the offer string reference coming from the streamOffers function in the JSON format
    offerStringRef.current.push(JSON.stringify(offer));

    // Add the offer to the offers state
    setOffers((prev) => [...prev, offer]);
    setLoading(false);
  };

  // Share offers by saving them and generating a WhatsApp share link
  const createSharedLink = async () => {
    try {
      // Create the shared offer
      const share = await createSharedOffer({
        userId: user.id,
        address: JSON.stringify(address),
        offers: offerStringRef.current,
        offerIds: [],
      });

      // Create the share URL
      const shareUrl = `${window.location.origin}/share/${share.id}`;

      // Open WhatsApp with the share URL if the Share button is pressed
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `Check out these offers: ${shareUrl}`
        )}`,
        "_blank"
      );

      // Navigate to the search view with the address
      navigate(
        `/search?street=${encodeURIComponent(
          address.street
        )}&houseNumber=${encodeURIComponent(
          address.houseNumber
        )}&city=${encodeURIComponent(address.city)}&plz=${encodeURIComponent(
          address.plz
        )}`
      );
    } catch (err) {
      console.error("Failed to create share link", err);
    }
  };

  // Validates the address using Google's Address Validation API
  const validateAddressWithGoogle = async (
    addr: typeof address,
    setAddressErrors: React.Dispatch<React.SetStateAction<typeof addressErrors>>
  ): Promise<boolean> => {
    // Get the API key from the environment variables
    const apiKey = import.meta.env.VITE_GOOGLE_PLACE_API;

    // Create the payload for the Google Address Validation API
    const payload = {
      address: {
        regionCode: "DE",
        locality: addr.city,
        postalCode: addr.plz,
        addressLines: [`${addr.street} ${addr.houseNumber}`],
      },
    };

    try {
      // Send the payload to the Google Address Validation API
      const res = await fetch(
        `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      // Get the response from the Google Address Validation API
      const data = await res.json();

      // Get the address components from the response
      const components = data.result?.address?.addressComponents || [];

      // Track missing fields
      const missingFields: Partial<typeof addressErrors> = {};

      const getConfirmation = (type: string) =>
        components.find(
          (c: { componentType: string }) => c.componentType === type
        )?.confirmationLevel;

      // Check if the house number is confirmed
      if (getConfirmation("street_number") !== "CONFIRMED") {
        missingFields.houseNumber = "House Number is invalid.";
      }

      // Check if the street is confirmed
      if (getConfirmation("route") !== "CONFIRMED") {
        missingFields.street = "Street is invalid.";
      }

      // Check if the city is confirmed
      if (getConfirmation("locality") !== "CONFIRMED") {
        missingFields.city = "City is invalid.";
      }

      // Check if the postal code is confirmed
      if (getConfirmation("postal_code") !== "CONFIRMED") {
        missingFields.plz = "Postal Code is invalid.";
      }

      // Set field-specific errors
      setAddressErrors((prev) => ({ ...prev, ...missingFields }));

      // Return true if no errors, false otherwise
      return Object.keys(missingFields).length === 0;
    } catch (err) {
      console.error("Google Address Validation API failed:", err);
      return false;
    }
  };

  // Modified onSearch to handle both shared and regular views
  const onSearch = async () => {
    const newErrors: typeof addressErrors = {};

    // Validation checks remain the same
    if (!address.plz?.trim()) newErrors.plz = "Please enter the PLZ.";
    if (!address.city?.trim()) newErrors.city = "Please enter the city.";
    if (!address.street?.trim()) newErrors.street = "Please enter the street.";
    if (!address.houseNumber?.trim())
      newErrors.houseNumber = "Please enter the number.";

    // Set the address errors
    setAddressErrors(newErrors);

    // If there are errors, return
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Validate the address with Google's Address Validation API
    const isValid = await validateAddressWithGoogle(address, setAddressErrors);

    // If the address is not valid, return
    if (!isValid) {
      return;
    }

    // If we were in shared view, switch to regular view
    if (isSharedView) {
      setIsSharedView(false);

      // Clear the share ID from the URL without reloading
      window.history.pushState({}, "", "/search");
    }

    // Clear and reset offers
    offersRef.current = [];
    offerStringRef.current = [];
    setOffers([]);
    setLoading(true);
    setIsStreaming(true);

    // Start streaming new offers
    streamOffers(
      { ...address, countryCode: address.countryCode || "DE" },
      handleNewOffer,
      handleStreamComplete,
      handleStreamError
    );

    // Store the address if user is logged in
    if (user?.id) {
      try {
        // Create the address in the Address DB
        const savedAddress = await createAddress({
          street: address.street,
          houseNumber: address.houseNumber,
          city: address.city,
          plz: address.plz,
          countryCode: address.countryCode || "DE",
        });

        // Create the user-address relation in the UserAddress DB for better correlation
        await createUserAddress({
          userId: user.id,
          addressId: savedAddress.id,
        });

        // Save the address to the local storage
        localStorage.setItem("address", JSON.stringify(address));
      } catch (err) {
        console.error("Failed to save address:", err);
      }
    }
  };

  // Handles the completion of the streaming process
  const handleStreamComplete = async () => {
    // Stop streaming and update loading state
    setLoading(false);
    setIsStreaming(false);
    setCanShare(true);

    // Use AuthContext to get user ID directly
    if (!user.id) {
      console.warn("No user ID available for sharing");
      return;
    }
  };

  // Handles errors during the streaming process
  const handleStreamError = () => {
    setLoading(false);
    setIsStreaming(false);
  };

  // Decide how to show the offers
  const baseList = filteredOffers.length > 0 ? filteredOffers : offers;

  // Sort the offers based on the selected sorting option
  const displayOffers = sortBy
    ? [...baseList].sort((a, b) => {
        if (sortBy === "price low to high")
          return parseFloat(a.pricePerMonth) - parseFloat(b.pricePerMonth);
        if (sortBy === "price high to low")
          return parseFloat(b.pricePerMonth) - parseFloat(a.pricePerMonth);
        if (sortBy === "speed high to low")
          return parseFloat(b.speedMbps) - parseFloat(a.speedMbps);
        if (sortBy === "speed low to high")
          return parseFloat(a.speedMbps) - parseFloat(b.speedMbps);
        return 0;
      })
    : baseList;

  // Clear error when field is changed
  const handleFieldChange = (field: keyof typeof addressErrors) => {
    setAddressErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ------------------------ JSX: Search View Layout ------------------------
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full py-6 mb-8 mt-10">
        {/* ------------------ Logo and title ------------------ */}
        <div className="flex justify-center items-center gap-6 max-w-6xl mx-auto px-4">
          <img src={Icon} alt="GenDevNet Logo" className="w-32 h-auto" />
          <h1 className="text-5xl font-bold leading-[3.5rem] text-gray-800">
            GenDevNet
          </h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        {/* ------------------ Search title ------------------ */}
        <h1 className="text-2xl font-bold mb-6 text-center">
          Search Internet Providers
        </h1>

        {/* ------------------ Address component ------------------ */}
        <AddressComponent
          errors={addressErrors}
          onFieldChange={handleFieldChange}
        />

        {/* ------------------ Search button ------------------ */}
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={onSearch}
            className="w-full max-w-[200px] bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 text-lg font-medium transition-colors duration-200"
          >
            Search
          </button>

          {/* ------------------ Share button ------------------ */}
          <button
            onClick={() => {
              createSharedLink();
            }}
            disabled={!canShare}
            className={`w-full max-w-[200px] text-white px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200 ${
              canShare
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Share
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        {/* ------------------ Filter Toggle Button ------------------ */}
        <button
          className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          onClick={() => setShowFilter((prev) => !prev)}
        >
          {showFilter ? "Hide Filters" : "Show Filters"}
        </button>

        {/* ------------------ Sort Selector ------------------ */}
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700 self-center">
            Sort by:
          </label>
          <select
            value={sortBy ?? ""}
            onChange={(e) =>
              setSortBy(
                [
                  "price low to high",
                  "price high to low",
                  "speed high to low",
                  "speed low to high",
                ].includes(e.target.value)
                  ? (e.target.value as typeof sortBy)
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
      </div>

      {/* ------------------ Filter component ------------------ */}
      {showFilter && (
        <OfferFilter offers={offers} onFilter={setFilteredOffers} />
      )}

      {/* ------------------ Loading indicator ------------------ */}
      {loading && offers.length === 0 ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayOffers.length > 0 ? (
        <div className="space-y-4">
          {/* ------------------ Offer cards ------------------ */}
          {displayOffers.map((offer, index) => (
            <OfferCard
              key={index}
              offer={offer}
              onView={() => setSelectedOffer(offer)}
            />
          ))}

          {/* ------------------ Loading more results ------------------ */}
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

      {/* ------------------ Offer card detail modal ------------------ */}
      {selectedOffer && (
        <OfferCardDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
        />
      )}
    </div>
  );
};

export default SharedView;
