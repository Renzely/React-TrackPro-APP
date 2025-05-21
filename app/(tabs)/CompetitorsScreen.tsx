import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import styles from "./Style";

type RootStackParamList = {
  Navigator: undefined;
  Competitors: undefined;
  CompetitorProcess: undefined;
};

type CompetitorsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Competitors"
>;

type CompetitorData = {
  _id: string;
  date: string;
  merchandiser: string;
  outlet: string;
  store?: string;
  company?: string;
  brand?: string;
  promoType?: string | null;
  promoDetails?: string;
  displayLocation?: string;
  pricing?: string;
  duration?: string;
  impact?: string;
  feedback?: string;
};

const CompetitorsScreen = () => {
  const navigation = useNavigation<CompetitorsScreenNavigationProp>();
  const isFocused = useIsFocused(); // <-- Track screen focus
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Load userEmail once on mount
    const getUserEmail = async () => {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      setUserEmail(storedEmail);
    };
    getUserEmail();
  }, []);

  useEffect(() => {
    // Re-fetch data when screen is focused and userEmail is available
    if (userEmail && isFocused) {
      fetchCompetitors(userEmail);
    }
  }, [userEmail, isFocused]);

  const fetchCompetitors = async (email: string) => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://192.168.50.55:3001/competitors/history?email=${encodeURIComponent(
          email
        )}`
      );
      if (!response.ok) throw new Error("Failed to fetch competitors");

      const data = await response.json();

      setCompetitors(data);
    } catch (error) {
      console.error("Fetch error:", error);
      setCompetitors([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.pageContainer}>
      <ScrollView contentContainerStyle={styles.containerQTTHistory}>
        <Text style={styles.titleQTT}>Competitor History</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4caf50" />
        ) : competitors.length === 0 ? (
          <Text style={styles.noHistoryText}>No history found.</Text>
        ) : (
          competitors.map((item, index) => (
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
                  <Text>Store: {item.store || "N/A"}</Text>
                  <Text>Company: {item.company || "N/A"}</Text>
                  <Text>Brand: {item.brand || "N/A"}</Text>
                  <Text>Promo Type: {item.promoType || "N/A"}</Text>
                  <Text>Promo Details: {item.promoDetails || "N/A"}</Text>
                  <Text>Display Location: {item.displayLocation || "N/A"}</Text>
                  <Text>Pricing: {item.pricing || "N/A"}</Text>
                  <Text>Duration: {item.duration || "N/A"}</Text>
                  <Text>Impact: {item.impact || "N/A"}</Text>
                  <Text>Feedback: {item.feedback || "N/A"}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabQTT}
        onPress={() => navigation.navigate("CompetitorProcess")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default CompetitorsScreen;
