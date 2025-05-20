import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { OfferDto } from "../types/OfferDto"
import { useAddress } from "../context/AddressContext"
import { createOffer, streamOffers } from "../api/offerService"
import OfferCard from "../components/OfferCard"
import Icon from "../assets/icon.png"
import { createSharedOffer } from "../api/shareService"
import { useAuth } from "../context/AuthContext"
import AddressComponent from "../components/AddressComponentWrapper";
import { createAddress } from "../api/addressService"
import { createUserAddress } from "../api/userAddressService"
import OfferCardDetailModal from "../components/OfferCardDetailModal";
import OfferFilter from "../components/OfferFilterComponent";

const SearchView = () => {
  // Context of the current address
  const { address, setAddress } = useAddress()

  // Context of the current user
  const { user } = useAuth()

  // Local state for all offers
  const [offers, setOffers] = useState<OfferDto[]>([])

  // Local state for loading
  const [loading, setLoading] = useState(false)

  // Local state for streaming
  const [isStreaming, setIsStreaming] = useState(false)

  // Local state for the share ID
  const [shareId, setShareId] = useState<string | null>(null)

  // Local state for sorting
  const [sortBy, setSortBy] = useState<
    | "price low to high"
    | "price high to low"
    | "speed high to low"
    | "speed low to high"
    | undefined
  >(undefined)

  // Navigation to other views
  const navigate = useNavigate()

  // Location of the current view
  // const location = useLocation()

  // Local state for the offers reference
  const offersRef = useRef<OfferDto[]>([])
  const offerStringRef = useRef<string[]>([])

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
  


  // Auto-load address from URL or localStorage. It applies automatically the address and searches for offers.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const street = params.get("street") || ""
    const houseNumber = params.get("houseNumber") || ""
    const city = params.get("city") || ""
    const plz = params.get("plz") || ""

    const hasSearchParams = ["street", "houseNumber", "city", "plz"].some(
      (param) => params.get(param) !== null
    )

    if (hasSearchParams) {
      setAddress({
        street,
        houseNumber,
        city,
        plz,
        countryCode: "DE"
      })
    } else {
      const storedAddress = localStorage.getItem("address")
      if (storedAddress) {
        const parsed = JSON.parse(storedAddress)
        setAddress(parsed)
      }
    }
  }, [])
  

  // Handles incoming offers one at a time during streaming
  const handleNewOffer = (offer: OfferDto) => {
    offersRef.current.push(offer)
    offerStringRef.current.push(JSON.stringify(offer))
    console.log(offerStringRef.current)
    setOffers((prev) => [...prev, offer])
    setLoading(false)
  }

  // Utility to pause between offer creations (helps with API rate limits)
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Share offers by saving them and generating a WhatsApp share link
  const createSharedLink = async () => {
    try {
      /*const offerCreationPromises = offersRef.current.map(async (offer) => {
        const savedOffer = await createOffer({
          ...offer,
          speedMbps: String(offer.speedMbps),
          pricePerMonth: String(offer.pricePerMonth),
          durationMonths: String(offer.durationMonths),
          extras: typeof offer.extras === "string" ? offer.extras : JSON.stringify(offer.extras),
        });
  
        await sleep(1000); 

        return savedOffer.$id;
      });
  
      const offerIds = await Promise.all(offerCreationPromises);*/


      const share = await createSharedOffer({
        userId: user.id,
        address: JSON.stringify(address),
        offers: offerStringRef.current,
        offerIds: [],
      });
  
      const shareUrl = `${window.location.origin}/share/${share.id}`;
      setShareId(share.id);
  
     
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`Check out these offers: ${shareUrl}`)}`,
        "_blank"
      );
  
      navigate(
        `/search?street=${encodeURIComponent(address.street)}&houseNumber=${encodeURIComponent(
          address.houseNumber
        )}&city=${encodeURIComponent(address.city)}&plz=${encodeURIComponent(address.plz)}`
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
        addressLines: [`${addr.street} ${addr.houseNumber}`]
      }
    };
  
    try {
      // Send the payload to the Google Address Validation API
      const res = await fetch(
        `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );
  
      // Get the response from the Google Address Validation API
      const data = await res.json();

      console.log(data)
  
      // Get the address components from the response
      const components = data.result?.address?.addressComponents || [];
  
      // Track missing fields
      const missingFields: Partial<typeof addressErrors> = {};
  
      const getConfirmation = (type: string) =>
        components.find(c => c.componentType === type)?.confirmationLevel;
  
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
      setAddressErrors(prev => ({ ...prev, ...missingFields }));
  
      // Return true if no errors, false otherwise
      return Object.keys(missingFields).length === 0;
    } catch (err) {
      console.error("Google Address Validation API failed:", err);
      return false;
    }
  };
  
  
  
  // Triggers the search process for offers
  const onSearch = async () => {
    const newErrors: typeof addressErrors = {};

    // Check if any field is empty or undefined
    if (!address.plz?.trim()) newErrors.plz = "Please enter the PLZ.";
    if (!address.city?.trim()) newErrors.city = "Please enter the city.";
    if (!address.street?.trim()) newErrors.street = "Please enter the street.";
    if (!address.houseNumber?.trim()) newErrors.houseNumber = "Please enter the number.";

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
      countryCode: address.countryCode || "DE"
    })

    // 2. Save relation to user (UserAddressDto)
    await createUserAddress({
      userId: user.id, 
      addressId: savedAddress.$id // also a number
    })

    // Save the address to localStorage
    localStorage.setItem("address", JSON.stringify(address))

    // Clear and reset offers
    offersRef.current = [] 
    offerStringRef.current = []
    setOffers([])
    setLoading(true)
    setIsStreaming(true)

    // Start streaming new offers from the APIs
    streamOffers(
      { ...address, countryCode: address.countryCode || "DE" },
      handleNewOffer,
      handleStreamComplete,
      handleStreamError
    )
  }

  // Handles the completion of the streaming process
  const handleStreamComplete = async () => {

    // Stop streaming and update loading state
    setLoading(false)
    setIsStreaming(false)

    // Use AuthContext to get user ID directly
    if (!user.id) {
      console.warn("No user ID available for sharing")
      return
    }
  }

  // Handles errors during the streaming process
  const handleStreamError = () => {
    setLoading(false)
    setIsStreaming(false)
  }

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
          <h1 className="text-5xl font-bold leading-[3.5rem] text-gray-800">GenDevNet</h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        {/* ------------------ Search title ------------------ */}
        <h1 className="text-2xl font-bold mb-6 text-center">Search Internet Providers</h1>

        {/* ------------------ Address component ------------------ */}
        <AddressComponent errors={addressErrors} onFieldChange={handleFieldChange} />

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
            onClick={() =>{
              createSharedLink()
              }
            }
            className="w-full max-w-[200px] bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 text-lg font-medium transition-colors duration-200"
          >
            Share
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        {/* ------------------ Filter Toggle Button ------------------ */}
        <button
          className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          onClick={() => setShowFilter(prev => !prev)}
        >
          {showFilter ? "Hide Filters" : "Show Filters"}
        </button>

        {/* ------------------ Sort Selector ------------------ */}
        <div className="flex items-center">
          <label className="mr-2 text-sm font-medium text-gray-700 self-center">Sort by:</label>
          <select
            value={sortBy ?? ""}
            onChange={(e) =>
              setSortBy(
                [
                  "price low to high",
                  "price high to low",
                  "speed high to low",
                  "speed low to high"
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
            <OfferCard key={index} offer={offer} onView={() => setSelectedOffer(offer)} />
          ))}

          {/* ------------------ Loading more results ------------------ */}
          {isStreaming && (
            <div className="flex justify-center items-center py-4">
              <div className="h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading more results...</span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-6">
          {isStreaming ? "Searching for offers..." : "No offers available for this address."}
        </div>
      )}

      {/* ------------------ Offer card detail modal ------------------ */}
      {selectedOffer && (
        <OfferCardDetailModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
      )}
    </div>
  )
}

export default SearchView
