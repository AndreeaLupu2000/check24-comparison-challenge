import React, { createContext, useState, useContext } from 'react'
import { AddressDto } from '../types/AddressDto'

// Omit $id if AddressDto includes it (from Appwrite)
type AddressInput = Omit<AddressDto, 'id'>

/**
 * AddressContextType interface
 * @param address - The address to display
 * @param setAddress - The function to call when the address is set
 * @param clearAddress - The function to call when the address is cleared
 */
interface AddressContextType {
  address: AddressInput
  setAddress: (address: AddressInput) => void
  clearAddress: () => void
}

/**
 * AddressContext
 * @param address - The address to display
 * @param setAddress - The function to call when the address is set
 * @param clearAddress - The function to call when the address is cleared
 */
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

/**
 * AddressContextProvider component
 * @param children - The children to display
 * @returns The AddressContextProvider component
 */
export const AddressContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // State for the address
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

  // Set the address with storage
  const setAddressWithStorage = (newAddress: AddressInput) => {
    localStorage.setItem('address', JSON.stringify(newAddress))
    setAddress(newAddress)
  }

  // Clear the address
  const clearAddress = () => {
    localStorage.removeItem('address')
    setAddress({
      street: '',
      houseNumber: '',
      city: '',
      plz: ''
    })
  }

  // Return the AddressContextProvider component
  return (
    <AddressContext.Provider value={{ address, setAddress: setAddressWithStorage, clearAddress }}>
      {children}
    </AddressContext.Provider>
  )
}

/**
 * useAddress hook
 * @returns The useAddress hook
 */
export const useAddress = () => useContext(AddressContext)
