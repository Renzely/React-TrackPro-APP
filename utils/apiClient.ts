// utils/apiClient.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

type LogoutFn = () => Promise<void>;

let _logout: LogoutFn | null = null;

export const setLogoutHandler = (fn: LogoutFn) => {
  _logout = fn;
};

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = await AsyncStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  // Save the refreshed token if backend sent one
  const refreshedToken = response.headers.get("x-refreshed-token");
  if (refreshedToken) {
    await AsyncStorage.setItem("token", refreshedToken);
  }

  if (response.status === 401) {
    await AsyncStorage.multiRemove([
      "token",
      "user",
      "userEmail",
      "outlet",
      "otherOutletName",
    ]);
    if (_logout) await _logout();
  }

  return response;
};
