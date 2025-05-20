import React, { createContext, useState, useContext } from 'react'
import { UserDto } from '../types/UserDto'

// Exclude password from context
type AuthUser = Omit<UserDto, 'password'>

/**
 * AuthContextType interface
 * @param user - The user to display
 * @param setUser - The function to call when the user is set
 * @param clearUser - The function to call when the user is cleared
 */
interface AuthContextType {
  user: AuthUser
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

/**
 * Default user
 * @param id - The id of the user
 * @param email - The email of the user
 */
const defaultUser: AuthUser = {
  id: '',
  email: ''
}

/**
 * AuthContext
 * @param user - The user to display
 * @param setUser - The function to call when the user is set
 * @param clearUser - The function to call when the user is cleared
 */
const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  setUser: () => {},
  clearUser: () => {}
})

/**
 * AuthContextProvider component
 * @param children - The children to display
 * @returns The AuthContextProvider component
 */
export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // State for the user
  const [user, setUserState] = useState<AuthUser>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : defaultUser
  })

  // Set the user
  const setUser = (user: AuthUser) => {
    localStorage.setItem('user', JSON.stringify(user))
    setUserState(user)
  }

  // Clear the user
  const clearUser = () => {
    localStorage.removeItem('user')
    setUserState(defaultUser)
  }

  // Return the AuthContextProvider component
  return (
    <AuthContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth hook
 * @returns The useAuth hook
 */
export const useAuth = () => useContext(AuthContext)
