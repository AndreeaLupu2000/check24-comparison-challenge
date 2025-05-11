import React, { createContext, useState, useContext } from 'react'
import { AddressDto } from '../types/AddressDto'

// Omit $id if AddressDto includes it (from Appwrite)
type AddressInput = Omit<AddressDto, 'id'>

interface AddressContextType {
  address: AddressInput
  setAddress: (address: AddressInput) => void
  clearAddress: () => void
}

const AddressContext = createContext<AddressContextType>({
  address: {
    street: '',
    houseNumber: '',
    city: '',
    plz: '',
  },
  setAddress: () => {},
  clearAddress: () => {}
})

export const AddressContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<AddressInput>(() => {
    const stored = localStorage.getItem('address')
    return stored
      ? JSON.parse(stored)
      : {
          userId: '',
          street: '',
          houseNumber: '',
          city: '',
          plz: ''
        }
  })

  const setAddressWithStorage = (newAddress: AddressInput) => {
    localStorage.setItem('address', JSON.stringify(newAddress))
    setAddress(newAddress)
  }

  const clearAddress = () => {
    localStorage.removeItem('address')
    setAddress({
      street: '',
      houseNumber: '',
      city: '',
      plz: ''
    })
  }

  return (
    <AddressContext.Provider value={{ address, setAddress: setAddressWithStorage, clearAddress }}>
      {children}
    </AddressContext.Provider>
  )
}

export const useAddress = () => useContext(AddressContext)
