// context/AuthContext.tsx
import React, { useContext, createContext, useState, ReactNode } from "react";
import { JSX } from "react/jsx-runtime";

// Define the shape of the context
interface AuthContextType {
  userToken: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
}

// Create the context with a default value (undefined until wrapped in a provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [userToken, setUserToken] = useState<string | null>(null);

  const signIn = (token: string): void => setUserToken(token);
  const signOut = (): void => setUserToken(null);

  return (
    <AuthContext.Provider value={{ userToken, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
