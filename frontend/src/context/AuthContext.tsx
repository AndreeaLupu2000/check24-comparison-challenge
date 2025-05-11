import React, { createContext, useState, useContext } from 'react'
import { UserDto } from '../types/UserDto'

// Exclude password from context
type AuthUser = Omit<UserDto, 'password'>

interface AuthContextType {
  user: AuthUser
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

const defaultUser: AuthUser = {
  id: '',
  email: ''
}

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  setUser: () => {},
  clearUser: () => {}
})

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<AuthUser>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : defaultUser
  })

  const setUser = (user: AuthUser) => {
    localStorage.setItem('user', JSON.stringify(user))
    setUserState(user)
  }

  const clearUser = () => {
    localStorage.removeItem('user')
    setUserState(defaultUser)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
