import React, { createContext, useState, useContext } from 'react';
import { AddressDto } from '../types/AddressDto';

interface AddressContextType {
  address: AddressDto;
  setAddress: (address: AddressDto) => void;
}

const AddressContext = createContext<AddressContextType>({
  address: {
    street: '',
    houseNumber: '',
    city: '',
    plz: '',
    countryCode: 'DE'
  },
  setAddress: () => {}
});

export const AddressContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [address, setAddress] = useState<AddressDto>(() => {
        const stored = localStorage.getItem('address'); 
        return stored ? JSON.parse(stored) : {
          street: '',
          houseNumber: '',
          city: '',
          plz: '',
          countryCode: 'DE'
        };
      });  

  // Wrap setCode to also update localStorage
  const setAddressWithStorage = (newAddress: AddressDto) => {
    localStorage.setItem('address', JSON.stringify(newAddress));
    setAddress(newAddress);
  };

  return (
    <AddressContext.Provider 
      value={{ 
        address, 
        setAddress: setAddressWithStorage,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);
