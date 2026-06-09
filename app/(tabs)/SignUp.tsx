import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ROLES = [
  { label: "MERCHANDISER", value: "MERCHANDISER" },
  { label: "COORDINATOR", value: "COORDINATOR" },
];

const OTP_LENGTH = 6;

const SignUp = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    role: "",
    outlet: ["Branch"],
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSignUp = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://api-trackpro.bmphrc.com/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", data.message);
        setIsOtpSent(true);
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
      }
    } catch {
      Alert.alert("Error", "Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length < OTP_LENGTH) {
      Alert.alert("Incomplete", "Please enter the full OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://api-trackpro.bmphrc.com/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: otpString }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Verified!", "Email verified successfully.");
        router.back();
      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }
    } catch {
      Alert.alert("Error", "Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);
    if (val && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const fieldStyle = (name: string) => ({
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: focusedField === name ? "#f0f8ff" : "#f7f7f7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: focusedField === name ? "#0aafeb" : "#eee",
    paddingHorizontal: 14,
    marginBottom: 12,
  });

  const inputStyle = {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#1a1a2e",
  };

  const labelStyle = {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    fontWeight: "500" as const,
  };

  const maskedEmail = form.email
    ? form.email.replace(
        /^(.)(.*)(@.*)$/,
        (_, a, b, c) => a + "*".repeat(b.length) + c,
      )
    : "";

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f8ff" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0aafeb" />

      {/* Header — pinned, never moves with keyboard */}
      <View
        style={{
          backgroundColor: "#0aafeb",
          paddingTop: 54,
          paddingBottom: isOtpSent ? 32 : 28,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={{ marginBottom: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>
          {isOtpSent ? "Verify Email" : "Create Account"}
        </Text>
        <Text
          style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 4 }}
        >
          {isOtpSent
            ? "Enter the OTP sent to your email"
            : "Fill in your details to get started"}
        </Text>

        {/* Step indicators */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          {[0, 1].map((s) => (
            <View
              key={s}
              style={{
                height: 5,
                width: s === (isOtpSent ? 1 : 0) ? 24 : 8,
                borderRadius: 3,
                backgroundColor:
                  s <= (isOtpSent ? 1 : 0)
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
          <Text
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              marginLeft: 4,
            }}
          >
            Step {isOtpSent ? 2 : 1} of 2
          </Text>
        </View>
      </View>

      {/* Only the form scrolls up when keyboard opens */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!isOtpSent ? (
            <>
              {/* Role selector */}
              <Text style={labelStyle}>Select Role</Text>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#eee",
                  marginBottom: 16,
                  overflow: "hidden",
                }}
              >
                <Picker
                  selectedValue={form.role}
                  onValueChange={(value) => handleChange("role", value)}
                  style={{ color: "#1a1a2e", fontSize: 14 }}
                  dropdownIconColor="#0aafeb"
                >
                  {ROLES.map((r) => (
                    <Picker.Item
                      key={r.value}
                      label={r.label}
                      value={r.value}
                    />
                  ))}
                </Picker>
              </View>

              {/* Name section */}
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: "#f0f0f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#aaa",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Personal Information
                </Text>

                <Text style={labelStyle}>First Name *</Text>
                <View style={fieldStyle("firstName")}>
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={focusedField === "firstName" ? "#0aafeb" : "#bbb"}
                  />
                  <TextInput
                    style={inputStyle}
                    placeholder="Enter first name"
                    placeholderTextColor="#bbb"
                    value={form.firstName}
                    onChangeText={(t) => handleChange("firstName", t)}
                    onFocus={() => setFocusedField("firstName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <Text style={labelStyle}>
                  Middle Name <Text style={{ color: "#bbb" }}>(optional)</Text>
                </Text>
                <View style={fieldStyle("middleName")}>
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={focusedField === "middleName" ? "#0aafeb" : "#bbb"}
                  />
                  <TextInput
                    style={inputStyle}
                    placeholder="Enter middle name"
                    placeholderTextColor="#bbb"
                    value={form.middleName}
                    onChangeText={(t) => handleChange("middleName", t)}
                    onFocus={() => setFocusedField("middleName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <Text style={labelStyle}>Last Name *</Text>
                <View style={[fieldStyle("lastName"), { marginBottom: 0 }]}>
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={focusedField === "lastName" ? "#0aafeb" : "#bbb"}
                  />
                  <TextInput
                    style={inputStyle}
                    placeholder="Enter last name"
                    placeholderTextColor="#bbb"
                    value={form.lastName}
                    onChangeText={(t) => handleChange("lastName", t)}
                    onFocus={() => setFocusedField("lastName")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Contact section */}
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: "#f0f0f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#aaa",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Contact Details
                </Text>

                <Text style={labelStyle}>Email Address *</Text>
                <View style={fieldStyle("email")}>
                  <Ionicons
                    name="mail-outline"
                    size={17}
                    color={focusedField === "email" ? "#0aafeb" : "#bbb"}
                  />
                  <TextInput
                    style={inputStyle}
                    placeholder="your@email.com"
                    placeholderTextColor="#bbb"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={form.email}
                    onChangeText={(t) => handleChange("email", t)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                <Text style={labelStyle}>Contact Number *</Text>
                <View style={[fieldStyle("contact"), { marginBottom: 0 }]}>
                  <Ionicons
                    name="call-outline"
                    size={17}
                    color={focusedField === "contact" ? "#0aafeb" : "#bbb"}
                  />
                  <TextInput
                    style={inputStyle}
                    placeholder="09XXXXXXXXX"
                    placeholderTextColor="#bbb"
                    keyboardType="phone-pad"
                    maxLength={11}
                    value={form.contactNumber}
                    onChangeText={(t) =>
                      handleChange(
                        "contactNumber",
                        t.replace(/[^0-9]/g, "").slice(0, 11),
                      )
                    }
                    onFocus={() => setFocusedField("contact")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Password section */}
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: "#f0f0f0",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: "#aaa",
                    letterSpacing: 0.8,
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Security
                </Text>

                <Text style={labelStyle}>Password *</Text>
                <View style={fieldStyle("password")}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={17}
                    color={focusedField === "password" ? "#0aafeb" : "#bbb"}
                  />
                  <TextInput
                    style={inputStyle}
                    placeholder="Create a password"
                    placeholderTextColor="#bbb"
                    secureTextEntry={!showPassword}
                    value={form.password}
                    onChangeText={(t) => handleChange("password", t)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#bbb"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={labelStyle}>Confirm Password *</Text>
                <View
                  style={[
                    fieldStyle("confirm"),
                    {
                      marginBottom: 0,
                      borderColor:
                        focusedField === "confirm"
                          ? passwordMismatch
                            ? "#e24b4a"
                            : "#0aafeb"
                          : "#eee",
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={17}
                    color={focusedField === "confirm" ? "#0aafeb" : "#bbb"}
                  />
                  <TextInput
                    style={inputStyle}
                    placeholder="Re-enter password"
                    placeholderTextColor="#bbb"
                    secureTextEntry={!showConfirm}
                    value={form.confirmPassword}
                    onChangeText={(t) => handleChange("confirmPassword", t)}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField(null)}
                  />
                  {form.confirmPassword.length > 0 && (
                    <Ionicons
                      name={
                        passwordsMatch ? "checkmark-circle" : "close-circle"
                      }
                      size={20}
                      color={passwordsMatch ? "#3b6d11" : "#e24b4a"}
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => setShowConfirm((p) => !p)}
                    style={{ marginLeft: 6 }}
                  >
                    <Ionicons
                      name={showConfirm ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#bbb"
                    />
                  </TouchableOpacity>
                </View>
                {passwordMismatch && (
                  <Text
                    style={{ fontSize: 11, color: "#e24b4a", marginTop: 6 }}
                  >
                    Passwords do not match
                  </Text>
                )}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#0aafeb",
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                  marginBottom: 12,
                  shadowColor: "#0aafeb",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                  >
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#e0e0e0",
                }}
                onPress={() => router.push("/")}
              >
                <Text
                  style={{ color: "#666", fontWeight: "500", fontSize: 14 }}
                >
                  Already have an account? Sign In
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            /* OTP step */
            <View style={{ alignItems: "center", paddingTop: 16 }}>
              <View
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  backgroundColor: "#e8f7fd",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Ionicons
                  name="mail-unread-outline"
                  size={32}
                  color="#0aafeb"
                />
              </View>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: 6,
                  textAlign: "center",
                }}
              >
                Check your email
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: "#888",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                We sent a 6-digit code to
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#0aafeb",
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
                      ref={(ref) => (otpRefs.current[idx] = ref)}
                      style={{
                        width: 46,
                        height: 56,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: otp[idx] ? "#0aafeb" : "#ddd",
                        backgroundColor: otp[idx] ? "#f0f8ff" : "#fff",
                        textAlign: "center",
                        fontSize: 22,
                        fontWeight: "700",
                        color: "#1a1a2e",
                      }}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[idx]}
                      onChangeText={(val) => handleOtpChange(val, idx)}
                      onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                    />
                  ))}
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#0aafeb",
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                  width: "100%",
                  marginBottom: 12,
                  shadowColor: "#0aafeb",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                  >
                    Verify & Continue
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                <Text
                  style={{ fontSize: 13, color: "#0aafeb", fontWeight: "600" }}
                >
                  ← Go back and edit details
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUp;
