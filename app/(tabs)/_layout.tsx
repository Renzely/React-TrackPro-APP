import { Stack } from "expo-router";
import { AuthProvider } from "./auth"; // ✅ make sure this path is correct

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
