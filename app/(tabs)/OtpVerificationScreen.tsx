import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const OTP_LENGTH = 6;

const OtpVerificationScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (countdown === 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const maskedEmail = email
    ? email.replace(
        /^(.)(.*)(@.*)$/,
        (_, a, b, c) => a + "*".repeat(b.length) + c,
      )
    : "";

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length < OTP_LENGTH) {
      Alert.alert("Incomplete", "Please enter the full 6-digit OTP.");
      return;
    }
    try {
      const res = await fetch("https://api-trackpro.bmphrc.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: otpString,
          purpose: "reset-password",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Verified", "OTP is correct.");
        router.push({ pathname: "/ResetPasswordScreen", params: { email } });
      } else {
        Alert.alert("Invalid OTP", data.message || "Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Server connection failed");
    }
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setCountdown(60);
    setCanResend(false);
    // Call your resend API here
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
          Verify OTP
        </Text>
        <Text
          style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}
        >
          Enter the code sent to your email
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
              width: s === 2 ? 24 : 8,
              borderRadius: 3,
              backgroundColor: s <= 2 ? "#0aafeb" : "#cce8f7",
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
        Step 2 of 3
      </Text>

      <View style={{ paddingHorizontal: 24, alignItems: "center" }}>
        {/* Icon */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#e8f7fd",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={30}
            color="#0aafeb"
          />
        </View>

        <Text
          style={{
            fontSize: 14,
            color: "#555",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          We sent a 6-digit code to
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#1a1a2e",
            marginBottom: 28,
          }}
        >
          {maskedEmail}
        </Text>

        {/* OTP boxes */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
          {Array(OTP_LENGTH)
            .fill(0)
            .map((_, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => (inputRefs.current[idx] = ref)}
                style={{
                  width: 46,
                  height: 54,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: otp[idx] ? "#0aafeb" : "#ddd",
                  backgroundColor: otp[idx] ? "#f0f8ff" : "#fff",
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: "600",
                  color: "#1a1a2e",
                }}
                keyboardType="number-pad"
                maxLength={1}
                value={otp[idx]}
                onChangeText={(val) => handleChange(val, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
              />
            ))}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#0aafeb",
            borderRadius: 12,
            paddingVertical: 15,
            alignItems: "center",
            width: "100%",
            marginBottom: 16,
          }}
          onPress={handleVerifyOtp}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
            Verify Code
          </Text>
        </TouchableOpacity>

        {/* Resend */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ fontSize: 13, color: "#888" }}>
            Didn't receive it?
          </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text
                style={{ fontSize: 13, color: "#0aafeb", fontWeight: "600" }}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ fontSize: 13, color: "#0aafeb", fontWeight: "600" }}>
              Resend in 0:{countdown.toString().padStart(2, "0")}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default OtpVerificationScreen;
