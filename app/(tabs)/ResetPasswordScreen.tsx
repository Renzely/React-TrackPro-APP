import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const getStrength = (pw: string) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "", color: "#eee" },
    { label: "Weak", color: "#e24b4a" },
    { label: "Fair", color: "#ef9f27" },
    { label: "Good", color: "#0aafeb" },
    { label: "Strong", color: "#3b6d11" },
  ];
  return { score, ...levels[score] };
};

const ResetPasswordScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const router = useRouter();

  const strength = getStrength(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;

  const handleReset = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    if (strength.score < 2) {
      Alert.alert("Weak Password", "Please choose a stronger password.");
      return;
    }
    try {
      const res = await fetch(
        "https://api-trackpro.bmphrc.com/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword: password }),
        },
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
          New Password
        </Text>
        <Text
          style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}
        >
          Create a strong, unique password
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
              width: s === 3 ? 24 : 8,
              borderRadius: 3,
              backgroundColor: "#0aafeb",
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
        Step 3 of 3
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
            marginBottom: 20,
            alignSelf: "center",
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={30} color="#0aafeb" />
        </View>

        {/* New password */}
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          New password
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: pwFocused ? "#f0f8ff" : "#f7f7f7",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: pwFocused ? "#0aafeb" : "#eee",
            paddingHorizontal: 14,
            marginBottom: 8,
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={pwFocused ? "#0aafeb" : "#aaa"}
          />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 13,
              paddingHorizontal: 10,
              fontSize: 14,
              color: "#1a1a2e",
            }}
            placeholder="Enter new password"
            placeholderTextColor="#bbb"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPwFocused(true)}
            onBlur={() => setPwFocused(false)}
          />
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        {/* Strength bars */}
        {password.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
              {[1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor:
                      i <= strength.score ? strength.color : "#eee",
                  }}
                />
              ))}
            </View>
            <Text
              style={{ fontSize: 11, color: strength.color, fontWeight: "500" }}
            >
              {strength.label}
            </Text>
          </View>
        )}

        {/* Confirm password */}
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          Confirm password
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: confirmFocused ? "#f0f8ff" : "#f7f7f7",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: confirmFocused
              ? confirmPassword && !passwordsMatch
                ? "#e24b4a"
                : "#0aafeb"
              : "#eee",
            paddingHorizontal: 14,
            marginBottom: 6,
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={confirmFocused ? "#0aafeb" : "#aaa"}
          />
          <TextInput
            style={{
              flex: 1,
              paddingVertical: 13,
              paddingHorizontal: 10,
              fontSize: 14,
              color: "#1a1a2e",
            }}
            placeholder="Confirm your password"
            placeholderTextColor="#bbb"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
          />
          {confirmPassword.length > 0 && (
            <Ionicons
              name={passwordsMatch ? "checkmark-circle" : "close-circle"}
              size={20}
              color={passwordsMatch ? "#3b6d11" : "#e24b4a"}
            />
          )}
        </View>
        {confirmPassword.length > 0 && !passwordsMatch && (
          <Text style={{ fontSize: 11, color: "#e24b4a", marginBottom: 12 }}>
            Passwords do not match
          </Text>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: "#0aafeb",
            borderRadius: 12,
            paddingVertical: 15,
            alignItems: "center",
            marginTop: 16,
          }}
          onPress={handleReset}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 15 }}>
            Reset Password
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ResetPasswordScreen;
