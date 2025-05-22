// screens/ResetPasswordScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import loginStyles from "./Style";
import Ionicons from "react-native-vector-icons/Ionicons";

const ResetPasswordScreen = () => {
  const { email } = useLocalSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword: password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Password reset successful!");
        router.replace("/");
      } else {
        Alert.alert("Error", data.message || "Failed to reset password.");
      }
    } catch (error) {
      Alert.alert("Error", "Server connection failed");
    }
  };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.title}>Reset Password</Text>

      {/* New Password Field */}
      <View style={{ position: "relative", width: "100%" }}>
        <TextInput
          style={[loginStyles.input, { paddingRight: 40 }]}
          placeholder="New Password"
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

      {/* Confirm Password Field */}
      <View style={{ position: "relative", width: "100%", marginTop: 10 }}>
        <TextInput
          style={[loginStyles.input, { paddingRight: 40 }]}
          placeholder="Confirm Password"
          placeholderTextColor="black"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword((prev) => !prev)}
          style={{
            position: "absolute",
            right: 10,
            top: 15,
          }}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off" : "eye"}
            size={24}
            color="grey"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={loginStyles.button} onPress={handleReset}>
        <Text style={loginStyles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;
