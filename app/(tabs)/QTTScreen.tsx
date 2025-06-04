import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
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

type QTTData = {
  _id: string;
  userType: "PSR" | "VET";
  date: string;
  userEmail: string;
  merchandiser: string;
  outlet: string;

  // Optional images
  firstBrandImage?: string;
  complianceDOGImage?: string;
  complianceCATImage?: string;
  royalCaninSignageImage?: string;
  visibilityCashierImage?: string;
  endcapGondolaImage?: string;
  wetProductsHighlightImage?: string;
  tacticalBinImage?: string;
  shelfSpaceImage?: string;
  designatedRackImage?: string;

  // For PSR
  firstBrandSeen?: string;
  complianceDOG?: string;
  complianceCAT?: string;
  royalCaninSignage?: string;
  visibilityCashier?: string;
  endcapGondola?: string;
  wetProductsHighlight?: string;
  tacticalBin?: string;
  PSRComment?: string;

  // For VET
  shelfSpace?: string;
  designatedRack?: string;
};

const QTTScreen = () => {
  const navigation = useNavigation<QTTScreenNavigationProp>();
  const router = useRouter();
  const isFocused = useIsFocused();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<QTTData[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user email when component mounts
  useEffect(() => {
    const getUserEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      setUserEmail(email);
    };
    getUserEmail();
  }, []);

  // Fetch QTT data when email or screen focus changes
  useEffect(() => {
    if (userEmail && isFocused) {
      fetchQTTHistory(userEmail);
    }
  }, [userEmail, isFocused]);

  const fetchQTTHistory = async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://react-rc-ugc-v2-backend.onrender.com/QTThistory?email=${encodeURIComponent(
          email
        )}`
      );
      if (!response.ok) throw new Error("Failed to fetch QTT data");

      const data = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching QTT history:", error);
      setHistoryData([]);
      Alert.alert("Error", "Failed to load history data.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
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
              </View>
              <Text style={styles.cardDate}>
                {new Date(item.date).toDateString()}
              </Text>

              {expandedIndex === index && (
                <View style={styles.cardContent}>
                  <Text>Merchandiser: {item.merchandiser || "N/A"}</Text>
                  <Text>User Type: {item.userType || "N/A"}</Text>

                  {item.userType === "PSR" ? (
                    <>
                      <Text style={{ marginTop: 8 }}>
                        Royal Canin Signage: {item.royalCaninSignage || "N/A"}
                      </Text>
                      {item.royalCaninSignageImage && (
                        <>
                          <Text>Royal Canin Signage Image:</Text>
                          <Image
                            source={{ uri: item.royalCaninSignageImage }}
                            style={styles.image}
                          />
                        </>
                      )}
                      <Text style={{ marginTop: 8 }}>
                        First Brand Seen: {item.firstBrandSeen || "N/A"}
                      </Text>
                      {item.firstBrandImage && (
                        <>
                          <Text>First Brand Image:</Text>
                          <Image
                            source={{ uri: item.firstBrandImage }}
                            style={styles.image}
                          />
                        </>
                      )}
                      <Text style={{ marginTop: 8 }}>
                        Compliance DOG: {item.complianceDOG || "N/A"}
                      </Text>
                      {item.complianceDOGImage && (
                        <>
                          <Text>Compliance DOG Image:</Text>
                          <Image
                            source={{ uri: item.complianceDOGImage }}
                            style={styles.image}
                          />
                        </>
                      )}
                      <Text style={{ marginTop: 8 }}>
                        Compliance CAT: {item.complianceCAT || "N/A"}
                      </Text>
                      {item.complianceCATImage && (
                        <>
                          <Text>Compliance CAT Image:</Text>
                          <Image
                            source={{ uri: item.complianceCATImage }}
                            style={styles.image}
                          />
                        </>
                      )}

                      <Text style={{ marginTop: 8 }}>
                        Visibility Cashier: {item.visibilityCashier || "N/A"}
                      </Text>
                      {item.visibilityCashierImage && (
                        <>
                          <Text>Visibility Cashier Image:</Text>
                          <Image
                            source={{ uri: item.visibilityCashierImage }}
                            style={styles.image}
                          />
                        </>
                      )}

                      <Text style={{ marginTop: 8 }}>
                        Endcap Gondola: {item.endcapGondola || "N/A"}
                      </Text>

                      {item.endcapGondolaImage && (
                        <>
                          <Text>Endcap Gondola Image:</Text>
                          <Image
                            source={{ uri: item.endcapGondolaImage }}
                            style={styles.image}
                          />
                        </>
                      )}
                      <Text style={{ marginTop: 8 }}>
                        Wet Products Highlight:{" "}
                        {item.wetProductsHighlight || "N/A"}
                      </Text>
                      {item.wetProductsHighlightImage && (
                        <>
                          <Text>Wet Products Highlight Image:</Text>
                          <Image
                            source={{ uri: item.wetProductsHighlightImage }}
                            style={styles.image}
                          />
                        </>
                      )}
                      <Text style={{ marginTop: 8 }}>
                        Tactical Bin: {item.tacticalBin || "N/A"}
                      </Text>

                      {item.tacticalBinImage && (
                        <>
                          <Text>Tactical Bin Image:</Text>
                          <Image
                            source={{ uri: item.tacticalBinImage }}
                            style={styles.image}
                          />
                        </>
                      )}
                      <Text style={{ marginTop: 11 }}>
                        PSR Comment: {item.PSRComment || "No comment"}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text>Shelf Space: {item.shelfSpace || "N/A"}</Text>
                      {item.shelfSpaceImage && (
                        <>
                          <Text>Shelf Space Image:</Text>
                          <Image
                            source={{ uri: item.shelfSpaceImage }}
                            style={styles.image}
                          />
                        </>
                      )}
                      <Text>
                        Designated Rack: {item.designatedRack || "N/A"}
                      </Text>
                      {item.designatedRackImage && (
                        <>
                          <Text>Designated Rack Image:</Text>
                          <Image
                            source={{ uri: item.designatedRackImage }}
                            style={styles.image}
                          />
                        </>
                      )}
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
