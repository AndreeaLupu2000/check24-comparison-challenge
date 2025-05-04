import React, { createContext, useState, useContext } from 'react';

interface AuthContextType {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  email: '',
  setEmail: () => {},
  password: '',
  setPassword: () => {}
});

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState(() => localStorage.getItem('email') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('password') || '');

  // Wrap setCode to also update localStorage
  const setEmailWithStorage = (newEmail: string) => {
    localStorage.setItem('email', newEmail);
    setEmail(newEmail);
  };

  // Wrap setUserId to also update localStorage
  const setPasswordWithStorage = (newPassword: string) => {
    localStorage.setItem('password', newPassword);
    setPassword(newPassword);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        email, 
        setEmail: setEmailWithStorage,
        password,
        setPassword: setPasswordWithStorage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
