// context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { JSX } from "react/jsx-runtime";

interface AuthContextType {
  userToken: string | null;
  isLoading: boolean; // ← add this so AuthGuard can wait
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ← start true, wait for AsyncStorage

  // ── On mount: restore token from AsyncStorage ────────────────────────────
  // Without this, every app resume starts with userToken = null
  // which causes AuthGuard to briefly see "no token" and remount screens
  useEffect(() => {
    const restoreToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) setUserToken(token);
      } catch (error) {
        console.error("Failed to restore token", error);
      } finally {
        setIsLoading(false);
      }
    };
    restoreToken();
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const signIn = async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem("token", token);
      setUserToken(token);
    } catch (error) {
      console.error("Failed to save token", error);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("token");
      setUserToken(null);
    } catch (error) {
      console.error("Failed to remove token", error);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
