import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import styles from "./Style";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";

type ExpiryData = {
  _id: string;
  date: string;
  merchandiser: string;
  outlet: string;
  userEmail: string;
  expiryEntries: {
    month: string;
    sku: string;
    expiration: string;
  }[];
};

type RootStackParamList = {
  Navigator: undefined;
  ExpiryProcess: undefined;
  ExpiryScreen: undefined;
};

type ExpiryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ExpiryProcess"
>;

const ExpiryScreen = () => {
  const router = useRouter();
  const navigation = useNavigation<ExpiryScreenNavigationProp>();
  const isFocused = useIsFocused();
  const [expiryData, setExpiryData] = useState<ExpiryData[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUserEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      setUserEmail(email);
    };
    getUserEmail();
  }, []);

  useEffect(() => {
    if (userEmail && isFocused) {
      fetchExpiryHistory(userEmail);
    }
  }, [userEmail, isFocused]);

  const fetchExpiryHistory = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://react-rc-ugc-v2-backend.onrender.com/expiry/history?email=${encodeURIComponent(
          email
        )}`
      );
      if (!response.ok) throw new Error("Failed to fetch expiry data");

      const data = await response.json();
      setExpiryData(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setExpiryData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.appBarExpiry}>
        <Text style={styles.appBarTitleExpiry}>EXPIRY HISTORY</Text>
      </View>
      <ScrollView contentContainerStyle={styles.containerQTTHistory}>
        {loading ? (
          <ActivityIndicator size="large" color="#4caf50" />
        ) : expiryData.length === 0 ? (
          <Text style={styles.noHistoryText}>No history found.</Text>
        ) : (
          expiryData.map((item, index) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => toggleExpand(index)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {item.outlet || "No Outlet"}
                </Text>
                <Text style={styles.cardDate}>
                  {new Date(item.date).toDateString()}
                </Text>
              </View>

              {expandedIndex === index && (
                <View style={styles.cardContent}>
                  <Text>Merchandiser: {item.merchandiser}</Text>
                  <Text>Outlet: {item.outlet || "N/A"}</Text>
                  {item.expiryEntries.map((entry, i) => (
                    <View key={i} style={{ marginVertical: 4 }}>
                      <Text>• SKU: {entry.sku}</Text>
                      <Text>Month: {entry.month}</Text>
                      <Text>Expiration: {entry.expiration}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabQTT}
        onPress={() => navigation.navigate("ExpiryProcess")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default ExpiryScreen;
