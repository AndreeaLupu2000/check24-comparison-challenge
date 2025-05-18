import { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { OfferDto } from "../types/OfferDto"
import { useAddress } from "../context/AddressContext"
import { createOffer, streamOffers } from "../api/offerService"
import OfferCard from "../components/OfferCard"
import Icon from "../assets/icon.png"
import { createSharedOffer } from "../api/shareService"
import { useAuth } from "../context/AuthContext"
import AddressComponent from "../components/AddressComponent"
import { createAddress } from "../api/addressService"
import { createUserAddress } from "../api/userAddressService"
import OfferCardDetailModal from "../components/OfferCardDetailModal";
import OfferFilter from "../components/OfferFilterComponent";

const SearchView = () => {
  const { address, setAddress } = useAddress()
  const { user } = useAuth()
  const [offers, setOffers] = useState<OfferDto[]>([])
  const [loading, setLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [shareId, setShareId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<
    | "price low to high"
    | "price high to low"
    | "speed high to low"
    | "speed low to high"
    | undefined
  >(undefined)

  const navigate = useNavigate()
  const location = useLocation()
  const offersRef = useRef<OfferDto[]>([])
  const [selectedOffer, setSelectedOffer] = useState<OfferDto | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filteredOffers, setFilteredOffers] = useState<OfferDto[]>([]);
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
      onSearch()
    } else {
      const storedAddress = localStorage.getItem("address")
      if (storedAddress) {
        const parsed = JSON.parse(storedAddress)
        setAddress(parsed)
        onSearch()
      }
    }
  }, [])
  

  const handleNewOffer = (offer: OfferDto) => {
    offersRef.current.push(offer)
    setOffers((prev) => [...prev, offer])
    setLoading(false)
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const createSharedLink = async () => {
    try {
      // 1. Persist only the displayed offers
      const offerCreationPromises = offersRef.current.map(async (offer) => {
        const savedOffer = await createOffer({
          ...offer,
          speedMbps: String(offer.speedMbps),
          pricePerMonth: String(offer.pricePerMonth),
          durationMonths: String(offer.durationMonths),
          extras: typeof offer.extras === "string" ? offer.extras : JSON.stringify(offer.extras),
        });

        await sleep(1000);
        
        return savedOffer.$id; // Only need the Appwrite document ID
      });
  
      const offerIds = await Promise.all(offerCreationPromises);
  
      // 2. Create share document with the collected Appwrite offer IDs
      const share = await createSharedOffer({
        userId: user.id,
        address: JSON.stringify(address),
        offerIds,
      });
  
      setShareId(share.id);
  
      const shareUrl = `${window.location.origin}/share/${share.id}`;
  
      // 3. Optional: update URL with address info
      navigate(
        `/search?street=${encodeURIComponent(address.street)}&houseNumber=${encodeURIComponent(
          address.houseNumber
        )}&city=${encodeURIComponent(address.city)}&plz=${encodeURIComponent(address.plz)}`
      );
  
      // 4. Open WhatsApp share link
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`Check out these offers: ${shareUrl}`)}`,
        "_blank"
      );
    } catch (err) {
      console.error("Failed to create share link", err);
    }
  };  
  
  
  
  const onSearch = async () => {
    const newErrors: typeof addressErrors = {};

    if (!address.plz) newErrors.plz = "Please enter the PLZ.";
    if (!address.city) newErrors.city = "Please enter the city.";
    if (!address.street) newErrors.street = "Please enter the street.";
    if (!address.houseNumber) newErrors.houseNumber = "Please enter the number.";

    setAddressErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

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

    localStorage.setItem("address", JSON.stringify(address))

    offersRef.current = [] //Clear the previous stored offers

    setOffers([])
    setLoading(true)
    setIsStreaming(true)

    streamOffers(
      { ...address, countryCode: address.countryCode || "DE" },
      handleNewOffer,
      handleStreamComplete,
      handleStreamError
    )
  }

  const handleStreamComplete = async () => {
    setLoading(false)
    setIsStreaming(false)

    // Use AuthContext to get user ID directly
    if (!user.id) {
      console.warn("No user ID available for sharing")
      return
    }
  }

  const handleStreamError = () => {
    setLoading(false)
    setIsStreaming(false)
  }

  const baseList = filteredOffers.length > 0 ? filteredOffers : offers;

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

  const shareUrl = shareId
    ? `${window.location.origin}/share/${shareId}`
    : `${window.location.origin}/search?street=${encodeURIComponent(
        address.street
      )}&houseNumber=${encodeURIComponent(address.houseNumber)}&city=${encodeURIComponent(
        address.city
      )}&plz=${encodeURIComponent(address.plz)}`

  // Clear error when field is changed
  const handleFieldChange = (field: keyof typeof addressErrors) => {
    setAddressErrors((prev) => ({ ...prev, [field]: undefined }));
  };
      

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full py-6 mb-8 mt-10">
        <div className="flex justify-center items-center gap-6 max-w-6xl mx-auto px-4">
          <img src={Icon} alt="GenDevNet Logo" className="w-32 h-auto" />
          <h1 className="text-5xl font-bold leading-[3.5rem] text-gray-800">GenDevNet</h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Search Internet Providers</h1>

        <AddressComponent errors={addressErrors} onFieldChange={handleFieldChange} />

        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={onSearch}
            className="w-full max-w-[200px] bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 text-lg font-medium transition-colors duration-200"
          >
            Search
          </button>
          <button
            onClick={() =>{
              createSharedLink()
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(
                    `Check out these offers: ${shareUrl}`
                  )}`,
                  "_blank"
                )
              }
            }
            className="w-full max-w-[200px] bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 text-lg font-medium transition-colors duration-200"
          >
            Share
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        {/* Filter Toggle Button */}
        <button
          className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          onClick={() => setShowFilter(prev => !prev)}
        >
          {showFilter ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Sort Selector */}
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

      {showFilter && (
        <OfferFilter offers={offers} onFilter={setFilteredOffers} />
      )}
      {loading && offers.length === 0 ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : displayOffers.length > 0 ? (
        <div className="space-y-4">
          {displayOffers.map((offer, index) => (
            <OfferCard key={index} offer={offer} onView={() => setSelectedOffer(offer)} />
          ))}
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

      {selectedOffer && (
        <OfferCardDetailModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
      )}
    </div>
  )
}

export default SearchView
