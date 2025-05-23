import { Redirect } from "expo-router";
import { useAuth } from "./auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { userToken } = useAuth();

  if (!userToken) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}
