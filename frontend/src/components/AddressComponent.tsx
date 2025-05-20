import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useAddress } from '../context/AddressContext'
import { useAuth } from '../context/AuthContext';
import { getLastUsedAddressByUserId } from '../api/userAddressService';
import { AddressDto } from '../types/AddressDto';

interface AddressComponentProps {
  errors?: {
    plz?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
  };

  onFieldChange?: (field: "plz" | "city" | "street" | "houseNumber") => void;
}


const AddressComponent: React.FC<AddressComponentProps> = ({ errors = {}, onFieldChange }) => {
  // Context state for current address
  const { address, setAddress } = useAddress()
 
  // Local states for address fields
  const [plz, setPlz] = useState('')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [houseNumber, setHouseNumber] = useState('')

  // Suggestions for PLZ and street autocompletion
  const [plzSuggestions, setPlzSuggestions] = useState<string[]>([])
  const [allStreets, setAllStreets] = useState<string[]>([])
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([])
  
  // Flags for selection and session usage
  const [plzSelected, setPlzSelected] = useState(false)
  const [streetSelected, setStreetSelected] = useState(false)
  const [sessionAddress, setSessionAddress] = useState<AddressDto | null>(null);
  const [showSessionSuggestion, setShowSessionSuggestion] = useState(false);
  const [sessionUsed, setSessionUsed] = useState(false);
  
  // Auth context to get user info
  const { user } = useAuth();

  // Refs for Google Maps services and input
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null);

  // On mount, pre-fill input fields from existing address context
  useEffect(() => {
    setPlz(address.plz || "");
    setCity(address.city || "");
    setStreet(address.street || "");
    setHouseNumber(address.houseNumber || "");
  }, []);
  

  // Initialize Google Maps services when the component mounts
  useEffect(() => {
    if (window.google) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
      geocoderRef.current = new window.google.maps.Geocoder()
    }
  }, [])


  // Close suggestion dropdowns when clicking outside input field
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setPlzSuggestions([]);
        setShowSessionSuggestion(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])


  // Fetch PLZ suggestions based on input using Google Autocomplete API
  useEffect(() => {
    if (plzSelected || sessionUsed) return
    const timeout = setTimeout(() => {
      if (!autocompleteServiceRef.current || plz.length < 2) return

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: plz,
          types: ['(regions)'],
          componentRestrictions: { country: 'de' }
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPlzSuggestions(predictions.map((p) => p.description))
          } else {
            setPlzSuggestions([])
          }
        }
      )
    }, 300)

    return () => clearTimeout(timeout)
  }, [plz, sessionUsed])


  // On input focus, try loading user's last used address (session suggestion)
  const handleFocus = async () => {
    if (!user.id) return;
    try {
      const fetchedAddress = await getLastUsedAddressByUserId(user.id);
      if (fetchedAddress) {
        setSessionAddress(fetchedAddress);
        setShowSessionSuggestion(true);
        setSessionUsed(false);
      }
    } catch (err) {
      console.error("Failed to load session address", err);
    }
  };

  // When a PLZ is selected, update related fields and fetch street names via Overpass API
  const handlePlzSelect = async (selectedPlz: string) => {
    setPlz(selectedPlz)
    setPlzSuggestions([])
    setPlzSelected(true)
    setStreet('')
    setAllStreets([])
    setStreetSuggestions([])
    setCity('')
    setHouseNumber('')

    if (!geocoderRef.current) return

    // Extract 5-digit postal code from string
    const extracted = selectedPlz.match(/\b\d{5}\b/)
    if (extracted) {
      setPlz(extracted[0])
    }

     // Geocode to get city and bounds for Overpass query
    geocoderRef.current.geocode({ address: selectedPlz }, async (results, status) => {
      if (status !== 'OK' || !results?.[0]) return

      const components = results[0].address_components

      // Attempt to get the city name from geocode result
      const cityName =
        components.find((c) => c.types.includes('locality'))?.long_name ||
        components.find((c) => c.types.includes('postal_town'))?.long_name ||
        ''
      setCity(cityName)

      const bounds = results[0].geometry.bounds || results[0].geometry.viewport

      const s = bounds.getSouthWest().lat()
      const n = bounds.getNorthEast().lat()
      const w = bounds.getSouthWest().lng()
      const e = bounds.getNorthEast().lng()

      // Build Overpass query to get street names in bounding box
      const overpassQuery = `
        [out:json][timeout:25];
        (
          way["highway"]["name"](${s},${w},${n},${e});
        );
        out tags;
      `

      try {
        const overpassRes = await axios.post(
          'https://overpass-api.de/api/interpreter',
          overpassQuery,
          { headers: { 'Content-Type': 'text/plain' } }
        )

        const streets = Array.from(
          new Set(
            overpassRes.data.elements
              .map((el: any) => el.tags?.name)
              .filter((name: string | undefined) => !!name)
          )
        ).sort()

        setAllStreets(streets)
      } catch (error) {
        console.error('Error fetching streets from Overpass:', error)
      }
    })
  }

  // Sync local address fields to the shared context
  useEffect(() => {
    if (plz && city && street && houseNumber) {
      setAddress({
        street,
        houseNumber,
        city,
        plz,
        countryCode: 'DE'
      })
    } else{

      const plzCheck = plz.length > 0? plz : ""
      const cityCheck = city.length > 0? city : ""
      const streetCheck = street.length > 0? street : ""
      const houseNumberCheck = houseNumber.length > 0? houseNumber : ""

      if(plz.length > 0 || city.length > 0 || street.length > 0 || houseNumber.length > 0){
        setAddress({
          street: streetCheck,
          houseNumber: houseNumberCheck,
          city: cityCheck,
          plz: plzCheck,
          countryCode: 'DE'
        })
      }
    }

    
  }, [street, houseNumber, city, plz])


  // Generate filtered street suggestions as user types
  useEffect(() => {
    if (streetSelected) return
    const query = street.toLowerCase()
    if (query.length < 2) {
      setStreetSuggestions([])
      return
    }

    const matches = allStreets.filter((name) =>
      name.toLowerCase().startsWith(query)
    )

    setStreetSuggestions(matches)
  }, [street, allStreets, streetSelected])

  // ------------------------ JSX: Address Form Layout ------------------------
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-4 rounded-md mt-8">
        <div className="flex gap-4 items-end">
          {/* ------------------ PLZ Input ------------------ */}
          <div className="flex flex-col">
            <label htmlFor="plz" className="text-sm font-medium text-gray-700 mb-1">
              PLZ
            </label>
            <div className="relative" ref={inputRef}>
              <input
                id="plz"
                type="text"
                value={plz}
                onFocus={handleFocus}
                onChange={(e) => {
                  setPlz(e.target.value)
                  setPlzSelected(false)
                  setShowSessionSuggestion(false)
                  setSessionUsed(false)
                  onFieldChange?.("plz");
                }}
                placeholder="12345"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                ${errors.plz ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-indigo-500"}`}
              />

              {/*------------------ Error message for PLZ ------------------ */}
              <span className={`text-xs h-5 mt-1 ${errors.plz? "text-red-500" : "text-transparent"}`}>
                {errors.plz || "No error"}
              </span>

              {/*------------------ Session suggestion ------------------ */}
              {showSessionSuggestion && sessionAddress && (
                <div
                  className="absolute bg-white border border-gray-300 rounded shadow-md p-3 mt-1 z-20 cursor-pointer"
                  onClick={() => {
                    setStreet(sessionAddress.street);
                    setHouseNumber(sessionAddress.houseNumber);
                    setCity(sessionAddress.city);
                    setPlz(sessionAddress.plz);
                    setShowSessionSuggestion(false);
                    setSessionUsed(true);
                    setPlzSelected(true);
                    setPlzSuggestions([]);
                  }}
                >
                  <div className="text-sm text-gray-600">Use last address:</div>
                  <div className=" text-gray-800">
                    {sessionAddress.plz} {sessionAddress.city}. {sessionAddress.street} {sessionAddress.houseNumber}
                  </div>
                </div>
              )}

              {/*------------------ PLZ suggestions ------------------ */}
              {plzSuggestions.length > 0 && !sessionUsed && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-full max-h-60 overflow-auto">
                  {plzSuggestions.map((s, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 cursor-pointer text-sm hover:bg-gray-100"
                      onClick={() => handlePlzSelect(s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/*------------------ City Input ------------------ */}
          <div className="flex flex-col">
            <label htmlFor="city" className="text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value)
                setPlzSelected(false)  // Reset PLZ selection state since city was manually changed
                onFieldChange?.("city");
              }}
              placeholder="City"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
              ${errors.city ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-indigo-500"}`}
            />

            {/*------------------ Error message for City ------------------ */}
            <span className={`text-xs h-5 mt-1 ${errors.city  ? "text-red-500" : "text-transparent"}`}>
              {errors.city || "No error"}
            </span>

          </div>

          {/*------------------ Street Input ------------------ */}
          <div className="flex flex-col">
            <label htmlFor="street" className="text-sm font-medium text-gray-700 mb-1">
              Street
            </label>
            <div className="relative">
              <input
                id="street"
                type="text"
                value={street}
                onChange={(e) => {
                  const value = e.target.value
                  setStreet(value)
                  if (value !== street) {
                    setStreetSelected(false)
                  }
                  onFieldChange?.("street");
                }}
                placeholder="Musterstraße"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                ${errors.street ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-indigo-500"}`}
              />

              {/*------------------ Error message for Street ------------------ */}
              <span className={`text-xs h-5 mt-1 ${errors.street ? "text-red-500" : "text-transparent"}`}>
                {errors.street || "No error"}
              </span>

              {streetSuggestions.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-full max-h-60 overflow-auto">
                  {streetSuggestions.map((s, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 cursor-pointer text-sm hover:bg-gray-100"
                      onClick={() => {
                        setStreet(s)
                        setStreetSuggestions([])
                        setStreetSelected(true)
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/*------------------ House Number Input ------------------ */}
          <div className="flex flex-col">
            <label htmlFor="houseNumber" className="text-sm font-medium text-gray-700 mb-1">
              House Number
            </label>
            <input
              id="houseNumber"
              type="text"
              value={houseNumber}
              onChange={(e) => {
                setHouseNumber(e.target.value)
                onFieldChange?.("houseNumber");
              }}
              placeholder="123"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
              ${errors.houseNumber ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-indigo-500"}`}
            />

            {/*------------------ Error message for House Number ------------------ */}
            <span className={`text-xs h-5 mt-1 ${errors.houseNumber ? "text-red-500" : "text-transparent"}`}>
              {errors.houseNumber || "No error"}
            </span>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddressComponent
