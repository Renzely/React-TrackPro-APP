import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Input Error", "Please enter your email.");
      return;
    }
    try {
      const res = await fetch(
        "https://api-trackpro.bmphrc.com/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "OTP sent to your email.");
        router.push({ pathname: "/OtpVerificationScreen", params: { email } });
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Server connection failed");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f8ff" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f8ff" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#0aafeb",
          paddingTop: 54,
          paddingBottom: 32,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>
          Forgot Password
        </Text>
        <Text
          style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}
        >
          We'll send a verification code to your email
        </Text>
      </View>

      {/* Step indicators */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={{
              height: 6,
              width: s === 1 ? 24 : 8,
              borderRadius: 3,
              backgroundColor: s === 1 ? "#0aafeb" : "#cce8f7",
            }}
          />
        ))}
      </View>
      <Text
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "#aaa",
          marginBottom: 24,
        }}
      >
        Step 1 of 3
      </Text>

      <View style={{ paddingHorizontal: 24 }}>
        {/* Icon */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#e8f7fd",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            alignSelf: "center",
          }}
        >
          <Ionicons name="lock-open-outline" size={30} color="#0aafeb" />
        </View>

        <Text
          style={{
            fontSize: 16,
            color: "#555",
            textAlign: "center",
            marginBottom: 28,
            lineHeight: 22,
          }}
        >
          Enter your registered email address and we'll send you a one-time
          verification code.
        </Text>

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
            marginBottom: 24,
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
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#0aafeb",
            borderRadius: 12,
            paddingVertical: 15,
            alignItems: "center",
          }}
          onPress={handleSendOtp}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
            Send OTP
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;
