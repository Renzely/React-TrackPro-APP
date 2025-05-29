import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "./auth";
import loginStyles from "./Style";

const LoginScreen = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
      setConnectionType(
        state.isConnected
          ? state.type.charAt(0).toUpperCase() + state.type.slice(1)
          : "No Internet Connection"
      );
    });

    return () => unsubscribe();
  }, []);

  // Add this useEffect at the top of your LoginScreen component
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        router.replace("/(tabs)/Navigator");
      }
    };

    checkToken();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Input Error", "Please enter both email and password.");
      return;
    }

    if (!isConnected) {
      Alert.alert("No Internet", "You must be online to login.");
      return;
    }

    setLoading(true);

    try {
      // Online login only
      const response = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      const user = data.user;

      // Save user email and token for fetching filtered data later

      await AsyncStorage.setItem("userEmail", user?.email || email);
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      await signIn(data.token);
      Alert.alert("Success", "Login successful!");
      router.replace("/(tabs)/Navigator");
    } catch (error) {
      Alert.alert("Error", "Something went wrong during login.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={loginStyles.container}>
      <View style={loginStyles.logoPlaceholder}>
        <Image
          source={require("../../assets/images/TrackPro-logo.png")}
          style={loginStyles.logoImage}
          resizeMode="contain"
        />
      </View>
      <Text style={[loginStyles.title, { marginTop: 15 }]}>LOGIN</Text>

      {!isConnected && (
        <Text
          style={{
            marginVertical: 10,
            color: "red",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {connectionType}
        </Text>
      )}

      <TextInput
        style={[loginStyles.input, { marginTop: 3 }]}
        placeholder="Email"
        placeholderTextColor="black"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={{ position: "relative", width: "100%" }}>
        <TextInput
          style={[loginStyles.input, { paddingRight: 40 }]}
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((prev) => !prev)}
          style={{
            position: "absolute",
            right: 10,
            top: 15,
          }}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color="grey"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[loginStyles.button, { opacity: isConnected ? 1 : 0.5 }]}
        onPress={handleLogin}
        disabled={!isConnected}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={loginStyles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={loginStyles.signupButton}
        onPress={() => router.push("/SignUp")}
      >
        <Text style={loginStyles.signupText}>Create Account</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={loginStyles.signupButton}
        onPress={() => router.push("/ForgotPasswordScreen")}
      >
        <Text style={loginStyles.signupText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
