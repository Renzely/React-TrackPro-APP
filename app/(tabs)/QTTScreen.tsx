import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import styles from "./Style";

type RootStackParamList = {
  Navigator: undefined;
  QTTprocess: undefined;
  QTTScreen: undefined;
};

type QTTScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "QTTprocess"
>;

const QTTScreen = () => {
  const navigation = useNavigation<QTTScreenNavigationProp>();
  const router = useRouter();
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const email = await AsyncStorage.getItem("userEmail"); // <-- correct key here
        if (!email) {
          Alert.alert("Error", "User email not found. Please login again.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://react-rc-ugc-v2-backend.onrender.com/QTThistory?email=${encodeURIComponent(
            email
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }

        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error("Error fetching QTT history:", error);
        Alert.alert("Error", "Failed to load history data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.pageContainer,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <View style={styles.appBarAttendance}>
        <Text style={styles.appBarTitleAttendance}>QTT HISTORY</Text>
      </View>

      <ScrollView contentContainerStyle={styles.containerQTTHistory}>
        {historyData.length === 0 ? (
          <Text style={styles.noHistoryText}>No history found.</Text>
        ) : (
          historyData.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => toggleExpand(index)}
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
                  <Text>User Type: {item.userType}</Text>

                  {item.userType === "PSR" ? (
                    <>
                      <Text>First Brand Seen: {item.firstBrandSeen}</Text>
                      <Text>Compliance DOG: {item.complianceDOG}</Text>
                      <Text>Compliance CAT: {item.complianceCAT}</Text>
                    </>
                  ) : (
                    <>
                      <Text>Shelf Space: {item.shelfSpace}</Text>
                      <Text>Designated Rack: {item.designatedRack}</Text>
                    </>
                  )}

                  {item.beforeImage && (
                    <>
                      <Text style={{ marginTop: 8 }}>Before Image:</Text>
                      <Image
                        source={{ uri: item.beforeImage }}
                        style={styles.image}
                      />
                    </>
                  )}

                  {item.afterImage && (
                    <>
                      <Text>After Image:</Text>
                      <Image
                        source={{ uri: item.afterImage }}
                        style={styles.image}
                      />
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fabQTT}
        onPress={() => navigation.navigate("QTTprocess")}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default QTTScreen;
