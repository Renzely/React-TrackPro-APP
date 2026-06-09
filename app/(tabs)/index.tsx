import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "./auth";

const LoginScreen = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [connectionType, setConnectionType] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
      setConnectionType(
        state.isConnected
          ? state.type.charAt(0).toUpperCase() + state.type.slice(1)
          : "No Internet Connection",
      );
    });
    return () => unsubscribe();
  }, []);

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
      const response = await fetch("https://api-trackpro.bmphrc.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      const user = data.user;

      // ── Block inactive accounts ──
      if (user?.isVerified === false || user?.isVerified === 0) {
        Alert.alert(
          "Account Inactive",
          "Your account is currently inactive.\n\nPlease contact your Account Supervisor to activate your account.",
          [{ text: "OK", style: "default" }],
        );
        setLoading(false);
        return;
      }

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
    <View style={{ flex: 1, backgroundColor: "#f0f8ff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f8ff" />

      {/* Blue wave — always behind everything */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 220,
          backgroundColor: "#0aafeb",
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      />

      {/* Logo + title — fixed, never moves with keyboard */}
      <View style={{ alignItems: "center", paddingTop: 60, marginBottom: 20 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
            shadowColor: "#0aafeb",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
            overflow: "hidden",
          }}
        >
          <Image
            source={require("../../assets/images/TrackPro-logo-notxt1.png")}
            style={{ width: 80, height: 80 }}
            resizeMode="cover"
          />
        </View>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            color: "#fff",
            letterSpacing: 1,
          }}
        >
          TrackPro
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.8)",
            marginTop: 2,
          }}
        >
          Attendance Management
        </Text>
      </View>

      {/* Only the card adjusts when the keyboard appears */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#1a1a2e",
                marginBottom: 4,
              }}
            >
              Welcome back
            </Text>
            <Text style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
              Sign in to continue
            </Text>

            {/* Connection badge */}
            {!isConnected ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff0f0",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 16,
                  gap: 8,
                }}
              >
                <Ionicons name="wifi-outline" size={16} color="#e24b4a" />
                <Text
                  style={{ fontSize: 12, color: "#e24b4a", fontWeight: "500" }}
                >
                  {connectionType}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#eaf3de",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 16,
                  gap: 8,
                }}
              >
                <Ionicons name="wifi" size={16} color="#3b6d11" />
                <Text
                  style={{ fontSize: 12, color: "#3b6d11", fontWeight: "500" }}
                >
                  {connectionType || "Connected"}
                </Text>
              </View>
            )}

            {/* Email field */}
            <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
              Email address
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: emailFocused ? "#f0f8ff" : "#f7f7f7",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: emailFocused ? "#0aafeb" : "#eee",
                paddingHorizontal: 14,
                marginBottom: 14,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={emailFocused ? "#0aafeb" : "#aaa"}
              />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  paddingHorizontal: 10,
                  fontSize: 14,
                  color: "#1a1a2e",
                }}
                placeholder="Enter your email"
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password field */}
            <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
              Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: passwordFocused ? "#f0f8ff" : "#f7f7f7",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: passwordFocused ? "#0aafeb" : "#eee",
                paddingHorizontal: 14,
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={passwordFocused ? "#0aafeb" : "#aaa"}
              />
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  paddingHorizontal: 10,
                  fontSize: 14,
                  color: "#1a1a2e",
                }}
                placeholder="Enter your password"
                placeholderTextColor="#bbb"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => router.push("/ForgotPasswordScreen")}
              style={{ alignSelf: "flex-end", marginBottom: 20 }}
            >
              <Text
                style={{ fontSize: 12, color: "#0aafeb", fontWeight: "500" }}
              >
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={{
                backgroundColor: isConnected ? "#0aafeb" : "#ccc",
                borderRadius: 12,
                paddingVertical: 15,
                alignItems: "center",
                marginBottom: 14,
              }}
              onPress={handleLogin}
              disabled={!isConnected || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: "#eee" }} />
              <Text
                style={{ marginHorizontal: 10, fontSize: 12, color: "#bbb" }}
              >
                or
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: "#eee" }} />
            </View>

            {/* Create account */}
            <TouchableOpacity
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e0e0e0",
                paddingVertical: 14,
                alignItems: "center",
              }}
              onPress={() => router.push("/SignUp")}
            >
              <Text
                style={{ color: "#1a1a2e", fontWeight: "500", fontSize: 14 }}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;
