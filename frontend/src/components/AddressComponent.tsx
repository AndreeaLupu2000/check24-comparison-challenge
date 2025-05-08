import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const AddressForm: React.FC = () => {
  const [plz, setPlz] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [plzSuggestions, setPlzSuggestions] = useState<string[]>([]);
  const [allStreets, setAllStreets] = useState<string[]>([]);
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [plzSelected, setPlzSelected] = useState(false);
  const [streetSelected, setStreetSelected] = useState(false);


  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (window.google) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, []);

  // Google Places PLZ autocomplete
  useEffect(() => {
    if (plzSelected) return;
    const timeout = setTimeout(() => {
      if (!autocompleteServiceRef.current || plz.length < 2) return;

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: plz,
          types: ['(regions)'],
          componentRestrictions: { country: 'de' },
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPlzSuggestions(predictions.map((p) => p.description));
          } else {
            setPlzSuggestions([]);
          }
        }
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [plz]);

  const handlePlzSelect = async (selectedPlz: string) => {
    setPlz(selectedPlz);
    setPlzSuggestions([]);
    setPlzSelected(true);
    setStreet('');
    setAllStreets([]);
    setStreetSuggestions([]);
    setCity('');
  
    if (!geocoderRef.current) return;
  
    const extracted = selectedPlz.match(/\b\d{5}\b/);
    if (extracted) {
      setPlz(extracted[0]);
    }
  
    geocoderRef.current.geocode({ address: selectedPlz }, async (results, status) => {
      if (status !== 'OK' || !results?.[0]) return;
  
      const components = results[0].address_components;
  
      const cityName =
        components.find((c) => c.types.includes('locality'))?.long_name ||
        components.find((c) => c.types.includes('postal_town'))?.long_name ||
        '';
      setCity(cityName);
  
      const bounds = results[0].geometry.bounds || results[0].geometry.viewport;

      const s = bounds.getSouthWest().lat();
      const n = bounds.getNorthEast().lat();
      const w = bounds.getSouthWest().lng();
      const e = bounds.getNorthEast().lng();
  
      const overpassQuery = `
        [out:json][timeout:25];
        (
          way["highway"]["name"](${s},${w},${n},${e});
        );
        out tags;
      `;
  
      try {
        const overpassRes = await axios.post(
          'https://overpass-api.de/api/interpreter',
          overpassQuery,
          { headers: { 'Content-Type': 'text/plain' } }
        );
  
        const streets = Array.from(
          new Set(
            overpassRes.data.elements
              .map((el: any) => el.tags?.name)
              .filter((name: string | undefined) => !!name)
          )
        ).sort();
  
        setAllStreets(streets);
      } catch (error) {
        console.error('Error fetching streets from Overpass:', error);
      }
    });
  };
  
  // Filter street suggestions
  useEffect(() => {
    if (streetSelected) return;
    const query = street.toLowerCase();
    if (query.length < 2) {
      setStreetSuggestions([]);
      return;
    }

    const matches = allStreets.filter((name) =>
      name.toLowerCase().startsWith(query)
    );

    setStreetSuggestions(matches);
  }, [street, allStreets, streetSelected]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="bg-white p-4 rounded-md mt-8">       
        <div className="flex gap-4 items-end">
          {/* PLZ */}
          <div className="flex flex-col">
            <label htmlFor="plz" className="text-sm font-medium text-gray-700 mb-1">
              PLZ
            </label>
            <div className="relative">
              <input
                id="plz"
                type="text"
                value={plz}
                onChange={(e) => {
                  setPlz(e.target.value);
                  setPlzSelected(false);
                }}
                placeholder="12345"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {plzSuggestions.length > 0 && (
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

          {/* City */}
          <div className="flex flex-col">
            <label htmlFor="city" className="text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              readOnly
              placeholder="City auto-filled"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Street */}
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
                  const value = e.target.value;
                  setStreet(value);
                  if (value !== street) {
                    setStreetSelected(false);
                  }
                }}
                placeholder="Musterstraße"
                className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {streetSuggestions.length > 0 && (
                <div className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 w-full max-h-60 overflow-auto">
                  {streetSuggestions.map((s, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 cursor-pointer text-sm hover:bg-gray-100"
                      onClick={() => {
                        setStreet(s);
                        setStreetSuggestions([]);
                        setStreetSelected(true);
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* House Number */}
          <div className="flex flex-col">
            <label htmlFor="houseNumber" className="text-sm font-medium text-gray-700 mb-1">
              House Number
            </label>
            <input
              id="houseNumber"
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="123"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressForm;

  
/**
 * import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddressForm: React.FC = () => {
  const [plz, setPlz] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [plzSuggestions, setPlzSuggestions] = useState<string[]>([]);
  const [allStreets, setAllStreets] = useState<string[]>([]);
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);

  // Fetch PLZ suggestions
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (plz.length < 2) return;

      axios
        .get('https://nominatim.openstreetmap.org/search', {
          params: {
            postalcode: plz,
            country: 'Germany',
            format: 'json',
            addressdetails: 1,
          },
        })
        .then((res) => {
          const suggestions = Array.from(
            new Set(res.data.map((item: any) => item.address.postcode))
          );
          setPlzSuggestions(suggestions);
        });
    }, 300);

    return () => clearTimeout(timeout);
  }, [plz]);

  // Handle PLZ selection
  const handlePlzSelect = async (selectedPlz: string) => {
    setPlz(selectedPlz);
    setPlzSuggestions([]);
    setStreet('');
    setAllStreets([]);
    setStreetSuggestions([]);

    const nominatimRes = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        postalcode: selectedPlz,
        country: 'Germany',
        format: 'json',
        addressdetails: 1,
      },
    });

    const result = nominatimRes.data[0];
    if (!result) return;

    const cityName =
      result.address.city || result.address.town || result.address.village || '';
    setCity(cityName);

    const [s, n, w, e] = result.boundingbox; // South, North, West, East

    const overpassQuery = `
      [out:json][timeout:25];
      (
        way["highway"]["name"](${s},${w},${n},${e});
      );
      out tags;
    `;

    try {
      const overpassRes = await axios.post(
        'https://overpass-api.de/api/interpreter',
        overpassQuery,
        { headers: { 'Content-Type': 'text/plain' } }
      );

      const streets = Array.from(
        new Set(
          overpassRes.data.elements
            .map((el: any) => el.tags?.name)
            .filter((name: string | undefined) => !!name)
        )
      ).sort();

      setAllStreets(streets);
    } catch (error) {
      console.error('Error fetching streets from Overpass:', error);
    }
  };

  // Filter street suggestions
  useEffect(() => {
    const query = street.toLowerCase();
    if (query.length < 2) {
      setStreetSuggestions([]);
      return;
    }

    const matches = allStreets.filter((name) =>
      name.toLowerCase().startsWith(query)
    );
    setStreetSuggestions(matches);
  }, [street, allStreets]);

  // Styles
  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    width: '100%',
    zIndex: 1000,
    maxHeight: '150px',
    overflowY: 'auto',
  };

  const suggestionStyle: React.CSSProperties = {
    padding: '8px',
    cursor: 'pointer',
  };

  return (
    <form style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div style={{ position: 'relative' }}>
        <label>PLZ</label>
        <input
          type="text"
          value={plz}
          onChange={(e) => setPlz(e.target.value)}
          placeholder="Enter PLZ"
          style={{ width: '100%', padding: '8px' }}
        />
        {plzSuggestions.length > 0 && (
          <div style={dropdownStyle}>
            {plzSuggestions.map((s, i) => (
              <div key={i} style={suggestionStyle} onClick={() => handlePlzSelect(s)}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>City</label>
        <input
          type="text"
          value={city}
          readOnly
          placeholder="City auto-filled"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginTop: '1rem', position: 'relative' }}>
        <label>Street</label>
        <input
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="Enter street"
          style={{ width: '100%', padding: '8px' }}
        />
        {streetSuggestions.length > 0 && (
          <div style={dropdownStyle}>
            {streetSuggestions.map((s, i) => (
              <div
                key={i}
                style={suggestionStyle}
                onClick={() => {
                  setStreet(s);
                  setStreetSuggestions([]);
                }}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>House Number</label>
        <input
          type="text"
          value={houseNumber}
          onChange={(e) => setHouseNumber(e.target.value)}
          placeholder="123"
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
    </form>
  );
};

export default AddressForm;

 */