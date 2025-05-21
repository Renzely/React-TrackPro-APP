import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import styles from "./Style";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

const SignUp = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    role: "RC",
    outlet: ["Branch"],
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSignUp = async () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://192.168.50.55:3001/signup", {
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
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await fetch("http://192.168.50.55:3001/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Email verified successfully");
        setIsVerified(true);
        router.back();
      } else {
        Alert.alert("Error", data.message || "Invalid OTP");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to the server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {!isOtpSent ? (
        <>
          <Text style={styles.label}>Select Role</Text>
          <Picker
            selectedValue={form.role}
            onValueChange={(value) => handleChange("role", value)}
            style={{
              width: "100%",
              height: 50,
              backgroundColor: "#68d6f2",
              borderRadius: 8,
              paddingHorizontal: 15,
              color: "black",
              marginBottom: 20,
            }}
          >
            <Picker.Item label="RC" value="RC" />
            <Picker.Item label="UGC" value="UGC" />
            <Picker.Item label="BMP" value="BMP" />
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="black"
            value={form.firstName}
            onChangeText={(text) => handleChange("firstName", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Middle Name (Optional)"
            placeholderTextColor="black"
            value={form.middleName}
            onChangeText={(text) => handleChange("middleName", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="black"
            value={form.lastName}
            onChangeText={(text) => handleChange("lastName", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="black"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            placeholderTextColor="black"
            keyboardType="phone-pad"
            value={form.contactNumber}
            maxLength={11}
            onChangeText={(text) => {
              const numeric = text.replace(/[^0-9]/g, ""); // remove non-numeric
              handleChange("contactNumber", numeric.slice(0, 11)); // keep max 11 digits
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="black"
            secureTextEntry={!showPassword}
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="black"
            secureTextEntry={!showPassword}
            value={form.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={{ alignSelf: "flex-start", marginBottom: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={34}
              color="#0aafeb"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            placeholderTextColor="black"
            keyboardType="number-pad"
            value={otp}
            onChangeText={(text) => setOtp(text)}
          />

          <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.signupButton}
        onPress={() => router.push("/")}
      >
        <Text style={styles.signupText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SignUp;
