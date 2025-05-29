// screens/OtpVerificationScreen.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import loginStyles from "./Style";

const OtpVerificationScreen = () => {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, purpose: "reset-password" }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Verified", "OTP is correct.");
        router.push({
          pathname: "/ResetPasswordScreen",
          params: { email },
        });
      } else {
        Alert.alert("Invalid OTP", data.message || "Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Server connection failed");
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>Verify OTP</Text>
      <TextInput
        style={loginStyles.input}
        placeholder="Enter OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
      />
      <TouchableOpacity style={loginStyles.button} onPress={handleVerifyOtp}>
        <Text style={loginStyles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OtpVerificationScreen;
