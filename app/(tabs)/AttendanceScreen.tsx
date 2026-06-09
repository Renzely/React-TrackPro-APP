import { authenticatedFetch } from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useAuth } from "./auth";

type TimeLog = {
  outlet: string;
  timeIn: string;
  timeOut?: string | null;
  addressTimeIn?: string | null;
  addressTimeOut?: string | null;
  timeInSelfieUri?: string | null;
  timeOutSelfieUri?: string | null;
};

type AttendanceRecord = {
  date: string;
  timeLogs: TimeLog[];
};

const BASE_URL = "https://api-trackpro.bmphrc.com";
const STATUS_POLL_INTERVAL = 30000;

const EMPTY_ATTENDANCE = {
  hasTimedIn: false,
  hasTimedOut: false,
  timeInTimestamp: null,
  timeOutTimestamp: null,
  addressTimeIn: null,
  addressTimeOut: null,
  timeInSelfieUri: null,
  timeOutSelfieUri: null,
};

const AttendanceScreen = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emailRef = useRef<string>("");
  const selectedOutletRef = useRef<string>("");

  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [outletOptions, setOutletOptions] = useState([
    { label: "Select Branch", value: "" },
  ]);
  const [email, setEmail] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSelfieUri, setSelectedSelfieUri] = useState<string | null>(
    null,
  );
  const [isLoadingTimeIn, setIsLoadingTimeIn] = useState(false);
  const [isLoadingTimeOut, setIsLoadingTimeOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<{
    hasTimedIn: boolean;
    hasTimedOut: boolean;
    timeInTimestamp: string | null;
    timeOutTimestamp: string | null;
    addressTimeIn: string | null;
    addressTimeOut: string | null;
    timeInSelfieUri: string | null;
    timeOutSelfieUri: string | null;
  }>(EMPTY_ATTENDANCE);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ── Fetch attendance status by outlet — always uses refs, never stale ────
  const fetchAttendanceStatus = async (
    outlet: string,
    emailOverride?: string,
  ) => {
    const currentEmail = emailOverride || emailRef.current || email;
    if (!outlet || !currentEmail) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `${BASE_URL}/attendance/status?email=${encodeURIComponent(currentEmail)}&outlet=${encodeURIComponent(outlet)}&date=${today}`,
      );
      if (res.ok) {
        const data = await res.json();
        setAttendanceData({
          hasTimedIn: data.hasTimedIn || false,
          hasTimedOut: data.hasTimedOut || false,
          timeInTimestamp: data.timeInTimestamp || null,
          timeOutTimestamp: data.timeOutTimestamp || null,
          addressTimeIn: data.addressTimeIn || null,
          addressTimeOut: data.addressTimeOut || null,
          timeInSelfieUri: data.timeInSelfieUri || null,
          timeOutSelfieUri: data.timeOutSelfieUri || null,
        });
      } else {
        setAttendanceData(EMPTY_ATTENDANCE);
      }
    } catch (error) {
      console.error("Failed to fetch attendance status:", error);
    } finally {
      setLoading(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  // ── Auto-logout when account is deactivated ──────────────────────────────
  const checkAccountStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${BASE_URL}/auth`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const user = await response.json();
      if (user?.isVerified === false || user?.isVerified === 0) {
        if (pollRef.current) clearInterval(pollRef.current);
        Alert.alert(
          "Account Deactivated",
          "Your account has been deactivated by your Account Supervisor. You will be logged out.",
          [
            {
              text: "OK",
              onPress: async () => {
                await AsyncStorage.multiRemove([
                  "token",
                  "user",
                  "userEmail",
                  "outlet",
                ]);
                await signOut();
                router.replace("/");
              },
            },
          ],
          { cancelable: false },
        );
      }
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  useEffect(() => {
    checkAccountStatus();
    pollRef.current = setInterval(checkAccountStatus, STATUS_POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  // Clock
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-PH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const hours = now.getHours() % 12 || 12;
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      setCurrentDate(formattedDate);
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

  // ── Single consolidated useFocusEffect ───────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const initScreen = async () => {
        try {
          const [storedEmailEntry, tokenEntry, savedOutletEntry] =
            await AsyncStorage.multiGet(["userEmail", "token", "outlet"]);

          const resolvedEmail = storedEmailEntry[1] ?? "";
          const resolvedToken = tokenEntry[1] ?? "";
          const rawSavedOutlet = savedOutletEntry[1] ?? "";

          if (!resolvedToken) return;

          if (resolvedEmail) {
            setEmail(resolvedEmail);
            emailRef.current = resolvedEmail;
          }

          const response = await authenticatedFetch(`${BASE_URL}/user/outlets`);
          if (!response.ok) return;

          const outlets = await response.json();
          const dropdownOptions: { label: string; value: string }[] = [];
          outlets.forEach((outlet: string) => {
            // Skip "Others" type outlets entirely
            if (!outlet.startsWith("Others:")) {
              dropdownOptions.push({ label: outlet, value: outlet });
            }
          });
          const seen = new Set();
          const unique = dropdownOptions.filter((item) => {
            if (seen.has(item.value)) return false;
            seen.add(item.value);
            return true;
          });
          setOutletOptions([{ label: "Select Branch", value: "" }, ...unique]);

          // Restore saved outlet — skip if it was an "Others" type
          let resolvedOutlet = "";
          if (rawSavedOutlet && !rawSavedOutlet.startsWith("Others")) {
            setSelectedOutlet(rawSavedOutlet);
            selectedOutletRef.current = rawSavedOutlet;
            resolvedOutlet = rawSavedOutlet;
          }

          if (resolvedOutlet && resolvedEmail) {
            await fetchAttendanceStatus(resolvedOutlet, resolvedEmail);
          }
        } catch (error) {
          console.error("Init screen error:", error);
        }
      };

      initScreen();
    }, []),
  );
  // ─────────────────────────────────────────────────────────────────────────

  const getAddressFromCoords = async (
    lat: number,
    lon: number,
  ): Promise<string | null> => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });
      if (address) {
        return `${address.street || ""}, ${address.city || address.district || ""}, ${address.region || ""}`;
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    }
    return null;
  };

  const handleTimeIn = async () => {
    setIsLoadingTimeIn(true);
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Camera access is required to take a selfie.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        cameraType: ImagePicker.CameraType.front,
      });
      if (result.canceled || !result.assets?.length) {
        Alert.alert("Selfie is required to Time In.");
        return;
      }
      const uri = result.assets[0].uri;
      const currentEmail = emailRef.current || email;
      const currentOutlet = selectedOutletRef.current || selectedOutlet;
      const timestamp = Date.now();
      const fileName = `Time_In_${currentEmail}_${timestamp}.jpg`;
      const presignRes = await fetch(`${BASE_URL}/save-attendance-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { url } = await presignRes.json();
      const imageBlob = await fetch(uri).then((r) => r.blob());
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: imageBlob,
      });
      if (!uploadRes.ok)
        throw new Error(`Upload failed: ${await uploadRes.text()}`);
      const selfieUrl = url.split("?")[0];
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const timeIn = now.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      const resolvedAddress = location
        ? await getAddressFromCoords(location.latitude, location.longitude)
        : null;
      const saveRes = await fetch(`${BASE_URL}/attendance/time-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentEmail,
          date,
          outlet: currentOutlet,
          timeIn,
          selfieUrl,
          location,
          timeInLocation: resolvedAddress,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save time-in data");
      // ✅ Use refs directly — no stale state issue
      await fetchAttendanceStatus(currentOutlet, currentEmail);
      Alert.alert("Success", "Time In recorded!");
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsLoadingTimeIn(false);
    }
  };

  const handleTimeOut = async () => {
    setIsLoadingTimeOut(true);
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Camera access is required to take a selfie.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        cameraType: ImagePicker.CameraType.front,
      });
      if (result.canceled || !result.assets?.length) {
        Alert.alert("Selfie is required to Time Out.");
        return;
      }
      const uri = result.assets[0].uri;
      const currentEmail = emailRef.current || email;
      const currentOutlet = selectedOutletRef.current || selectedOutlet;
      const timestamp = Date.now();
      const fileName = `Time_Out_${currentEmail}_${timestamp}.jpg`;
      const presignRes = await fetch(`${BASE_URL}/save-attendance-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });
      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { url } = await presignRes.json();
      const imageBlob = await fetch(uri).then((r) => r.blob());
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: imageBlob,
      });
      if (!uploadRes.ok)
        throw new Error(`Upload failed: ${await uploadRes.text()}`);
      const timeOutSelfieUrl = url.split("?")[0];
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const timeOut = now.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      const resolvedAddress = location
        ? await getAddressFromCoords(location.latitude, location.longitude)
        : null;
      const saveRes = await fetch(`${BASE_URL}/attendance/time-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentEmail,
          date,
          outlet: currentOutlet,
          timeOut,
          timeOutSelfieUrl,
          location,
          timeOutLocation: resolvedAddress,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save time-out data");
      // ✅ Use refs directly — no stale state issue
      await fetchAttendanceStatus(currentOutlet, currentEmail);
      Alert.alert("Success", "Time Out recorded!");
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsLoadingTimeOut(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    const currentEmail = emailRef.current || email;
    const currentOutlet = selectedOutletRef.current || selectedOutlet;
    if (!currentEmail || !currentOutlet) {
      Alert.alert("Please select a branch first.");
      return;
    }
    setHistoryLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/attendance/history?email=${encodeURIComponent(currentEmail)}&outlet=${encodeURIComponent(currentOutlet)}`,
      );
      if (!response.ok) throw new Error("Failed to fetch attendance history");
      const data = await response.json();
      setAttendanceHistory(data);
      setHistoryModalVisible(true);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to fetch history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-PH", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const StatusCard = ({
    type,
    hasRecorded,
    timestamp,
    address,
    selfieUri: cardSelfieUri,
  }: {
    type: "in" | "out";
    hasRecorded: boolean;
    timestamp: string | null;
    address: string | null;
    selfieUri: string | null;
  }) => (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: hasRecorded
          ? type === "in"
            ? "#0aafeb"
            : "#eb3b5a"
          : "#e0e0e0",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: hasRecorded
                ? type === "in"
                  ? "#e8f7fd"
                  : "#fde8ec"
                : "#f5f5f5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={type === "in" ? "log-in-outline" : "log-out-outline"}
              size={18}
              color={
                hasRecorded ? (type === "in" ? "#0aafeb" : "#eb3b5a") : "#ccc"
              }
            />
          </View>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1a1a2e" }}>
            Time {type === "in" ? "In" : "Out"}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 20,
            backgroundColor: hasRecorded
              ? type === "in"
                ? "#e8f7fd"
                : "#fde8ec"
              : "#f5f5f5",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "500",
              color: hasRecorded
                ? type === "in"
                  ? "#0aafeb"
                  : "#eb3b5a"
                : "#aaa",
            }}
          >
            {hasRecorded ? "Recorded" : "Pending"}
          </Text>
        </View>
      </View>

      {hasRecorded && timestamp ? (
        <>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: 4,
            }}
          >
            {formatTimestamp(timestamp)}
          </Text>
          {address && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 4,
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="location-outline"
                size={13}
                color="#aaa"
                style={{ marginTop: 1 }}
              />
              <Text style={{ fontSize: 12, color: "#888", flex: 1 }}>
                {address}
              </Text>
            </View>
          )}
          {cardSelfieUri && (
            <TouchableOpacity
              onPress={() => {
                setSelectedSelfieUri(cardSelfieUri);
                setModalVisible(true);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <Ionicons name="camera-outline" size={15} color="#0aafeb" />
              <Text
                style={{ fontSize: 12, color: "#0aafeb", fontWeight: "500" }}
              >
                View selfie
              </Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={{ fontSize: 13, color: "#bbb" }}>
          Not yet recorded for today
        </Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f0f8ff" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0aafeb" />

      {/* App bar */}
      <View
        style={{
          backgroundColor: "#0aafeb",
          paddingTop: 54,
          paddingBottom: 20,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: "600",
            color: "#fff",
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          ATTENDANCE
        </Text>
        <View style={{ alignItems: "center", marginTop: 12 }}>
          <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            {currentDate}
          </Text>
          <Text
            style={{
              fontSize: 40,
              fontWeight: "700",
              color: "#fff",
              lineHeight: 50,
            }}
          >
            {currentTime}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Branch dropdown */}
        <Text style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
          Branch
        </Text>
        <DropDownPicker
          open={open}
          value={selectedOutlet}
          items={outletOptions}
          setOpen={setOpen}
          setValue={setSelectedOutlet}
          setItems={setOutletOptions}
          searchable={true}
          placeholder="Select Branch"
          disabled={attendanceData.hasTimedIn && !attendanceData.hasTimedOut}
          onChangeValue={(value) => {
            if (value !== null && value !== "") {
              AsyncStorage.setItem("outlet", value);
              selectedOutletRef.current = value;
              setAttendanceData(EMPTY_ATTENDANCE);
              fetchAttendanceStatus(value, emailRef.current || email);
            }
          }}
          listMode="MODAL" // ← changed from SCROLLVIEW
          modalProps={{ animationType: "slide" }}
          modalContentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          style={{
            borderRadius: 12,
            borderColor: "#eee",
            borderWidth: 1,
            backgroundColor: "#fff",
            marginBottom: 14,
            minHeight: 48,
          }}
          dropDownContainerStyle={{ borderRadius: 12, borderColor: "#eee" }}
          placeholderStyle={{ color: "#bbb", fontSize: 14 }}
          textStyle={{ fontSize: 14, color: "#1a1a2e" }}
        />

        {/* Status cards */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0aafeb"
            style={{ marginVertical: 20 }}
          />
        ) : (
          <>
            <StatusCard
              type="in"
              hasRecorded={attendanceData.hasTimedIn}
              timestamp={attendanceData.timeInTimestamp}
              address={attendanceData.addressTimeIn}
              selfieUri={attendanceData.timeInSelfieUri}
            />
            <StatusCard
              type="out"
              hasRecorded={attendanceData.hasTimedOut}
              timestamp={attendanceData.timeOutTimestamp}
              address={attendanceData.addressTimeOut}
              selfieUri={attendanceData.timeOutSelfieUri}
            />
          </>
        )}

        {/* Action buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginTop: 4,
            marginBottom: 14,
          }}
        >
          <TouchableOpacity
            onPress={handleTimeIn}
            disabled={attendanceData.hasTimedIn || isLoadingTimeIn}
            style={{
              flex: 1,
              backgroundColor: attendanceData.hasTimedIn
                ? "#e0e0e0"
                : "#0aafeb",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isLoadingTimeIn ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
                >
                  Time In
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleTimeOut}
            disabled={
              !attendanceData.hasTimedIn ||
              attendanceData.hasTimedOut ||
              isLoadingTimeOut
            }
            style={{
              flex: 1,
              backgroundColor:
                !attendanceData.hasTimedIn || attendanceData.hasTimedOut
                  ? "#e0e0e0"
                  : "#eb3b5a",
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isLoadingTimeOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
                >
                  Time Out
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* History button */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: "#fff",
            borderRadius: 14,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: "#e0e0e0",
          }}
          onPress={fetchAttendanceHistory}
          disabled={historyLoading}
        >
          <Ionicons name="time-outline" size={18} color="#357EC7" />
          <Text style={{ color: "#357EC7", fontWeight: "600", fontSize: 14 }}>
            {historyLoading ? "Loading..." : "View Attendance History"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Selfie Modal */}
      {selectedSelfieUri && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.85)",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <Image
              source={{ uri: selectedSelfieUri }}
              style={{ width: "100%", height: 400, borderRadius: 16 }}
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 20,
                backgroundColor: "#fff",
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 24,
              }}
            >
              <Text style={{ color: "#1a1a2e", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* History Modal */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#f0f8ff" }}>
          <View
            style={{
              backgroundColor: "#0aafeb",
              paddingTop: 54,
              paddingBottom: 20,
              paddingHorizontal: 20,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#fff",
                letterSpacing: 0.5,
              }}
            >
              Attendance History
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {attendanceHistory.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                <Text style={{ color: "#bbb", marginTop: 12, fontSize: 14 }}>
                  No attendance records found
                </Text>
              </View>
            ) : (
              attendanceHistory.map(
                (record: AttendanceRecord, index: number) => {
                  const dateObj = new Date(record.date);
                  const formattedDate = dateObj.toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  const formatHistoryTimestamp = (
                    timestamp?: string | null,
                  ) => {
                    if (!timestamp) return "N/A";
                    return new Date(timestamp).toLocaleString("en-PH", {
                      timeZone: "Asia/Manila",
                      weekday: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });
                  };
                  return (
                    <View
                      key={index}
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 14,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 12,
                          paddingBottom: 10,
                          borderBottomWidth: 0.5,
                          borderBottomColor: "#f0f0f0",
                        }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color="#0aafeb"
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#1a1a2e",
                          }}
                        >
                          {formattedDate}
                        </Text>
                      </View>

                      {record.timeLogs.map((log: TimeLog, idx: number) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: "#f8fbff",
                            borderRadius: 10,
                            padding: 12,
                            marginBottom:
                              idx < record.timeLogs.length - 1 ? 10 : 0,
                            borderLeftWidth: 3,
                            borderLeftColor: "#0aafeb",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#0aafeb",
                              marginBottom: 10,
                            }}
                          >
                            {log.outlet}
                          </Text>
                          <View style={{ flexDirection: "row", gap: 10 }}>
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: "#e8f7fd",
                                borderRadius: 8,
                                padding: 10,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: "#0aafeb",
                                  fontWeight: "600",
                                  marginBottom: 4,
                                }}
                              >
                                TIME IN
                              </Text>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#1a1a2e",
                                  fontWeight: "500",
                                }}
                              >
                                {formatHistoryTimestamp(log.timeIn)}
                              </Text>
                              {log.addressTimeIn && (
                                <Text
                                  style={{
                                    fontSize: 11,
                                    color: "#888",
                                    marginTop: 2,
                                  }}
                                >
                                  {log.addressTimeIn}
                                </Text>
                              )}
                              {log.timeInSelfieUri && (
                                <TouchableOpacity
                                  onPress={() => {
                                    setSelectedSelfieUri(log.timeInSelfieUri!);
                                    setModalVisible(true);
                                  }}
                                  style={{ marginTop: 6 }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      color: "#0aafeb",
                                      fontWeight: "500",
                                    }}
                                  >
                                    View selfie
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                            <View
                              style={{
                                flex: 1,
                                backgroundColor: "#fde8ec",
                                borderRadius: 8,
                                padding: 10,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 10,
                                  color: "#eb3b5a",
                                  fontWeight: "600",
                                  marginBottom: 4,
                                }}
                              >
                                TIME OUT
                              </Text>
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "#1a1a2e",
                                  fontWeight: "500",
                                }}
                              >
                                {formatHistoryTimestamp(log.timeOut)}
                              </Text>
                              {log.addressTimeOut && (
                                <Text
                                  style={{
                                    fontSize: 11,
                                    color: "#888",
                                    marginTop: 2,
                                  }}
                                >
                                  {log.addressTimeOut}
                                </Text>
                              )}
                              {log.timeOutSelfieUri && (
                                <TouchableOpacity
                                  onPress={() => {
                                    setSelectedSelfieUri(log.timeOutSelfieUri!);
                                    setModalVisible(true);
                                  }}
                                  style={{ marginTop: 6 }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      color: "#eb3b5a",
                                      fontWeight: "500",
                                    }}
                                  >
                                    View selfie
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  );
                },
              )
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default AttendanceScreen;
