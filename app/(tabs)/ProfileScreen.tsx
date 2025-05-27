import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import styles from "./Style";
import { useAuth } from "./auth";
import { ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    const loadProfile = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (!storedUser) throw new Error("No stored user data found");
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
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
