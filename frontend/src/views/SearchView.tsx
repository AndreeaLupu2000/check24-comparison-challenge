// views/SearchView.tsx
// React
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Dtos
import { OfferDto } from "../types/OfferDto";
// Services
import { streamOffers } from "../api/offerService";
import { createSharedOffer } from "../api/shareService";
import { createAddress, getAllAddresses } from "../api/addressService";
import { createUserAddress } from "../api/userAddressService";
//Contexts
import { useAddress } from "../context/AddressContext";
import { useAuth } from "../context/AuthContext";
// Components
import OfferCard from "../components/OfferCard";
import AddressComponent from "../components/AddressComponentWrapper";
import OfferCardDetailModal from "../components/OfferCardDetailModal";
import OfferFilter from "../components/OfferFilterComponent";
// Assets
import Icon from "../assets/icon.png";

const SearchView = () => {
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
  // const location = useLocation()

  // Local state for the offers reference
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


  // Add this state to control dropdown visibility
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  // Auto-load address from URL or localStorage. It applies automatically the address and searches for offers.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const street = params.get("street") || "";
    const houseNumber = params.get("houseNumber") || "";
    const city = params.get("city") || "";
    const plz = params.get("plz") || "";

    setCanShare(false);

    const hasSearchParams = ["street", "houseNumber", "city", "plz"].some(
      (param) => params.get(param) !== null
    );

    if (hasSearchParams) {
      setAddress({
        street,
        houseNumber,
        city,
        plz,
        countryCode: "DE",
      });
    } else {
      const storedAddress = localStorage.getItem("address");
      if (storedAddress) {
        const parsed = JSON.parse(storedAddress);
        setAddress(parsed);
      }
    }

    const navType = 
      (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type ?? "navigate";

    if (navType === "reload") {
      const storedOffers = localStorage.getItem("offers");
      if (storedOffers) {
        const parsedOffers = JSON.parse(storedOffers);
        offerStringRef.current = parsedOffers;
        setOffers(parsedOffers.map((o: string) => JSON.parse(o)));
        setCanShare(true); // allow sharing restored offers
      }
      setLoading(false);
    }
  }, []);

  // Handles incoming offers one at a time during streaming
  const handleNewOffer = (offer: OfferDto) => {
    // Add the offer to the offers reference coming from the streamOffers function
    offerStringRef.current.push(JSON.stringify(offer));

    // Add the offer to the offers state
    setOffers((prev) => [...prev, offer]);
    setLoading(false);
  };

  // Share offers by saving them and generating a WhatsApp share link
  const createSharedLink = async (mode: 'all' | 'filtered') => {
    try {
      // Determine which offers to share based on shareMode
      const offersToShare = mode === 'all' 
        ? offerStringRef.current 
        : displayOffers.map(offer => JSON.stringify(offer));


      // Create the shared offer
      const share = await createSharedOffer({
        userId: user.id,
        address: JSON.stringify(address),
        offers: offersToShare,
        offerIds: [],
      });

      // Create the share URL
      const shareUrl = `${window.location.origin}/share/${share.id}`;

      // Open the WhatsApp share link
      window.open(
        `https://wa.me/?text=${encodeURIComponent(
          `Check out these offers: ${shareUrl}`
        )}`,
        "_blank"
      );

      // Navigate to the search view with the same address
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
      if (getConfirmation("street_number") === "UNCONFIRMED_BUT_PLAUSIBLE") {
        missingFields.houseNumber = "The input is unconfirmed";
      } else if (getConfirmation("street_number") !== "CONFIRMED") {
        missingFields.houseNumber = "House Number is invalid.";
      }

      // Check if the street is confirmed
      if (getConfirmation("route") === "UNCONFIRMED_BUT_PLAUSIBLE") {
        missingFields.street = "The input is unconfirmed";
      } else if (getConfirmation("route") !== "CONFIRMED") {
        missingFields.street = "Street is invalid.";
      }

      // Check if the city is confirmed
      if (getConfirmation("locality") === "UNCONFIRMED_BUT_PLAUSIBLE") {
        missingFields.city = "The input is unconfirmed";
      } else if (getConfirmation("locality") !== "CONFIRMED") {
        missingFields.city = "City is invalid.";
      }

      // Check if the postal code is confirmed
       if (getConfirmation("postal_code") === "UNCONFIRMED_BUT_PLAUSIBLE") {
        missingFields.plz = "The input is unconfirmed";
      } else if (getConfirmation("postal_code") !== "CONFIRMED") {
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

  // Triggers the search process for offers
  const onSearch = async () => {
    // Clear Local Storage of the offers
    localStorage.removeItem("offers");

    const newErrors: typeof addressErrors = {};

    // Check if any field is empty or undefined
    if (!address.plz?.trim()) newErrors.plz = "Please enter the PLZ.";
    if (!address.city?.trim()) newErrors.city = "Please enter the city.";
    if (!address.street?.trim()) newErrors.street = "Please enter the street.";
    if (!address.houseNumber?.trim())
      newErrors.houseNumber = "Please enter the number.";

    // Set initial errors for empty fields
    setAddressErrors(newErrors);

    // If any field is empty, stop here
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Only proceed with Google validation if all fields are filled
    const isValid = await validateAddressWithGoogle(address, setAddressErrors);
    if (!isValid) {
      return;
    }

    // If we get here, both validations passed, proceed with the search
    // 1. Store the address and get back the created address with its ID
    const savedAddress = await createAddress({
      street: address.street,
      houseNumber: address.houseNumber,
      city: address.city,
      plz: address.plz,
      countryCode: address.countryCode || "DE",
    });

    // If the address already exists, get the existing address ID
    if (!savedAddress.id) {
      const allAddresses = await getAllAddresses();

      for (const a of allAddresses) {
        if (a.street === address.street && a.houseNumber === address.houseNumber && a.city === address.city && a.plz === address.plz) {
          savedAddress.id = a.id;
          break;
        }
      }
    }
    // 2. Save relation to user (UserAddressDto)
    const savedUserAddress = await createUserAddress({
      userId: user.id,
      addressId: savedAddress.id,
    });

    console.log("savedUserAddress", savedUserAddress);

    // Save the address to localStorage
    localStorage.setItem("address", JSON.stringify(address));

    // Clear and reset offers
    offerStringRef.current = [];
    setOffers([]);
    setLoading(true);
    setIsStreaming(true);

    // Start streaming new offers from the APIs
    streamOffers(
      { ...address, countryCode: address.countryCode || "DE" },
      handleNewOffer,
      handleStreamComplete,
      handleStreamError
    );
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

    // Save the offers to the local storage
    localStorage.setItem("offers", JSON.stringify(offerStringRef.current));
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

  // Update the OfferFilter component to maintain sorting
  const handleFilterChange = (filtered: OfferDto[]) => {
    setFilteredOffers(filtered);
    // If there's an active sort, apply it to the filtered results
    if (sortBy) {
      const sortedFiltered = [...filtered].sort((a, b) => {
        if (sortBy === "price low to high")
          return parseFloat(a.pricePerMonth) - parseFloat(b.pricePerMonth);
        if (sortBy === "price high to low")
          return parseFloat(b.pricePerMonth) - parseFloat(a.pricePerMonth);
        if (sortBy === "speed high to low")
          return parseFloat(b.speedMbps) - parseFloat(a.speedMbps);
        if (sortBy === "speed low to high")
          return parseFloat(a.speedMbps) - parseFloat(b.speedMbps);
        return 0;
      });
      setFilteredOffers(sortedFiltered);
    }
  };

  // Update the sort handler to maintain filtering
  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    // If there are filtered results, apply the new sort to them
    if (filteredOffers.length > 0) {
      const sortedFiltered = [...filteredOffers].sort((a, b) => {
        if (newSortBy === "price low to high")
          return parseFloat(a.pricePerMonth) - parseFloat(b.pricePerMonth);
        if (newSortBy === "price high to low")
          return parseFloat(b.pricePerMonth) - parseFloat(a.pricePerMonth);
        if (newSortBy === "speed high to low")
          return parseFloat(b.speedMbps) - parseFloat(a.speedMbps);
        if (newSortBy === "speed low to high")
          return parseFloat(a.speedMbps) - parseFloat(b.speedMbps);
        return 0;
      });
      setFilteredOffers(sortedFiltered);
    }
  };

  // Clear error when field is changed
  const handleFieldChange = (field: keyof typeof addressErrors) => {
    setAddressErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('shareDropdownButton');
      const dropdownMenu = document.getElementById('shareDropdownMenu');
      
      if (dropdown && !dropdown.contains(event.target as Node) && 
          dropdownMenu && !dropdownMenu.contains(event.target as Node)) {
        setShowShareDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ------------------------ JSX: Search View Layout ------------------------
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => {
            localStorage.removeItem("address");
            localStorage.removeItem("user");
            localStorage.removeItem("offers");
            setOffers([]);
            setFilteredOffers([]);
            navigate("/");
          }}
          className="text-blue-600 hover:underline text-md font-semibold bg-white px-3 py-1 rounded shadow"
        >
          Back to Login
        </button>
      </div>
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
          <div className="relative w-full max-w-[200px]">
            <button
              id="shareDropdownButton"
              onClick={() => {
                setShowShareDropdown(!showShareDropdown);
              }}
              disabled={!canShare}
              className={`w-full text-white px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200 focus:ring-4 focus:outline-none focus:ring-green-300 inline-flex items-center justify-center ${
                canShare
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              type="button"
            >
              <span className="inline-flex items-center">
                Share on
                <svg
                  className="w-6 h-6 ml-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16 0C7.164 0 0 7.163 0 16c0 2.82.735 5.522 2.131 7.918L0 32l8.273-2.154C10.659 31.265 13.296 32 16 32c8.836 0 16-7.163 16-16S24.836 0 16 0zm0 29.867c-2.386 0-4.722-.648-6.747-1.873l-.483-.287-4.914 1.279 1.315-4.781-.315-.499C4.597 21.422 4 18.741 4 16 4 8.832 9.832 3 16 3s12 5.832 12 13-5.832 13-12 13zm7.442-9.939c-.391-.195-2.314-1.144-2.672-1.274-.358-.132-.619-.195-.88.196s-1.008 1.274-1.237 1.537c-.227.26-.451.294-.842.098-.39-.195-1.647-.605-3.137-1.929-1.159-1.036-1.94-2.313-2.169-2.703-.227-.39-.024-.6.17-.796.174-.174.39-.452.586-.678.195-.227.26-.391.39-.65.13-.26.065-.488-.032-.683-.098-.195-.88-2.124-1.204-2.909-.317-.762-.638-.658-.88-.668l-.75-.014c-.26 0-.683.098-1.04.488-.358.391-1.37 1.337-1.37 3.26 0 1.922 1.402 3.78 1.596 4.04.195.26 2.75 4.2 6.66 5.89.931.402 1.653.64 2.217.819.93.296 1.777.254 2.448.154.747-.112 2.314-.946 2.64-1.859.325-.911.325-1.69.227-1.859-.098-.169-.358-.26-.748-.456z" />
                </svg>
              </span>
              <svg 
                className={`w-2.5 h-2.5 ms-3 transition-transform ${showShareDropdown ? 'rotate-180' : ''}`} 
                aria-hidden="true" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 10 6"
              >
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
              </svg>
            </button>

            {/* Dropdown menu */}
            {showShareDropdown && canShare && (
              <div 
                id="shareDropdownMenu"
                className="absolute z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-full max-w-[200px]"
                onClick={(e) => {
                  // Prevent the click from bubbling up to the parent
                  e.stopPropagation();
                }}
              >
                <ul className="py-2 text-sm text-gray-700" aria-labelledby="shareDropdownButton">
                  <li>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        createSharedLink('all');
                        setShowShareDropdown(false);
                      }}
                      className="w-full text-left block px-4 py-2 hover:bg-gray-100 rounded-md"
                    >
                      Share All Offers
                    </button>
                  </li>
                  {(filteredOffers.length > 0 || sortBy) && (
                    <li>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          createSharedLink('filtered');
                          setShowShareDropdown(false);
                        }}
                        className="w-full text-left block px-4 py-2 hover:bg-gray-100 rounded-md"
                      >
                        Share Filtered/Sorted Offers
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
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
              handleSortChange(
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
        <OfferFilter 
          offers={offers} 
          onFilter={handleFilterChange} 
        />
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

export default SearchView;
