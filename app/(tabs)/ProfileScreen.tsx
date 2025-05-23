import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import styles from "./Style";

import { useAuth } from "./auth";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AttendanceScreen from "./AttendaceScreen";
import QTTScreen from "./QTTScreen";
import CompetitorsScreen from "./CompetitorsScreen";

type UserData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role: string;
};

const ProfileScreen = () => {
  const { userToken, signOut } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userToken) {
        setLoading(false);
        return;
      }

      try {
        if (userToken === "offline-token") {
          // Offline login: Load from AsyncStorage
          const storedUser = await AsyncStorage.getItem("user");
          if (!storedUser) throw new Error("No stored user data found");
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
        } else {
          // Online login: Fetch from API
          const response = await fetch(
            "https://react-rc-ugc-v2-backend.onrender.com/profile",
            {
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch profile");
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        Alert.alert("Error", (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userToken]);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        onPress: () => {
          signOut(); // Clears token
          router.replace("/");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text>Failed to load profile data</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.appBarProfile}>
        <Text style={styles.appBarProfileTitle}>PROFILE</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userData.firstName?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Role</Text>
          <TextInput
            value={userData.role}
            editable={false}
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={userData.email}
            editable={false}
            style={styles.input}
          />

          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            value={userData.contactNumber || ""}
            editable={false}
            style={styles.input}
          />

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={`${userData.firstName} ${userData.lastName}`}
            editable={false}
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
