// auth-guard.tsx
import { useRouter } from "expo-router";
import React, { ReactNode, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "./auth";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { userToken, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !userToken) {
      router.replace("/"); // redirect to login only after we know there's no token
    }
  }, [isLoading, userToken]);

  // Show spinner while restoring token — prevents flash unmount of screens
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0aafeb" />
      </View>
    );
  }

  if (!userToken) return null;

  return <>{children}</>;
};
