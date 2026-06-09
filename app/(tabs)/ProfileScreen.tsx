import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "./auth";

type UserData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role: string;
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: "#f0f0f0",
      gap: 14,
    }}
  >
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#e8f7fd",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name={icon as any} size={18} color="#0aafeb" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 14, color: "#1a1a2e", fontWeight: "500" }}>
        {value}
      </Text>
    </View>
  </View>
);

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) throw new Error("No stored user data found");
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        Alert.alert("Error", (error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#0aafeb" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#888" }}>Failed to load profile data</Text>
      </View>
    );
  }

  const initials =
    (userData.firstName?.charAt(0) || "") +
    (userData.lastName?.charAt(0) || "");

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f8ff" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0aafeb" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#0aafeb",
          paddingTop: 54,
          paddingBottom: 48,
          alignItems: "center",
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: "#fff",
            letterSpacing: 1,
            marginBottom: 20,
          }}
        >
          PROFILE
        </Text>
        {/* Avatar */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#0aafeb" }}>
            {initials.toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>
          {userData.firstName} {userData.lastName}
        </Text>
        <View
          style={{
            marginTop: 6,
            backgroundColor: "rgba(255,255,255,0.2)",
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Text style={{ fontSize: 12, color: "#fff", fontWeight: "500" }}>
            {userData.role}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#aaa",
              fontWeight: "600",
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            ACCOUNT DETAILS
          </Text>

          <InfoRow
            icon="shield-checkmark-outline"
            label="Role"
            value={userData.role}
          />
          <InfoRow icon="mail-outline" label="Email" value={userData.email} />
          <InfoRow
            icon="person-outline"
            label="Full name"
            value={`${userData.firstName}${
              userData.middleName ? " " + userData.middleName : ""
            } ${userData.lastName}`}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              gap: 14,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "#e8f7fd",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="call-outline" size={18} color="#0aafeb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>
                Contact number
              </Text>
              <Text
                style={{ fontSize: 14, color: "#1a1a2e", fontWeight: "500" }}
              >
                {userData.contactNumber || "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: "#fff",
            borderRadius: 14,
            paddingVertical: 15,
            borderWidth: 1,
            borderColor: "#fcd0d0",
          }}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#e24b4a" />
          <Text style={{ color: "#e24b4a", fontWeight: "600", fontSize: 15 }}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
