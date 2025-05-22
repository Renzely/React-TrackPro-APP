// screens/ForgotPasswordScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import loginStyles from "./Style";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Input Error", "Please enter your email.");
      return;
    }

    try {
      const res = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "OTP sent to your email.");
        router.push({
          pathname: "/OtpVerificationScreen",
          params: { email },
        });
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Server connection failed");
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>Forgot Password</Text>
      <TextInput
        style={loginStyles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={loginStyles.button} onPress={handleSendOtp}>
        <Text style={loginStyles.buttonText}>Send OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;
