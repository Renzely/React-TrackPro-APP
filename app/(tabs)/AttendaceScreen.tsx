import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Modal,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Button,
} from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import styles from "./Style";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AttendanceScreen = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [outletOptions, setOutletOptions] = useState([
    { label: "Select Branch", value: "" },
  ]);
  const [email, setEmail] = useState("");
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSelfieUri, setSelectedSelfieUri] = useState<string | null>(
    null
  );
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
  }>({
    hasTimedIn: false,
    hasTimedOut: false,
    timeInTimestamp: null,
    timeOutTimestamp: null,
    addressTimeIn: null,
    addressTimeOut: null,
    timeInSelfieUri: null,
    timeOutSelfieUri: null,
  });

  // TIME and DAY STAMP
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        year: "numeric" as const,
        month: "long" as const,
        day: "numeric" as const,
      };
      const formattedDate = now.toLocaleDateString(undefined, options);
      const hours = now.getHours() % 12 || 12;
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      const formattedTime = `${hours}:${minutes} ${ampm}`;

      setCurrentDate(formattedDate);
      setCurrentTime(formattedTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  //TIME AND DAY FOR TIME STAMP

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      weekday: "long", // e.g., "Friday"
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Use 12-hour format with AM/PM
    });
  };

  const viewSelfie = (uri: string) => {
    setSelectedSelfieUri(uri);
    setModalVisible(true);
  };

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const getAddressFromCoords = async (
    lat: number,
    lon: number
  ): Promise<string | null> => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lon,
      });
      if (address) {
        return `${address.street || ""}, ${
          address.city || address.district || ""
        }, ${address.region || ""}`;
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    }
    return null;
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    const loadOutlets = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("No auth token found");
          return;
        }

        const response = await fetch(
          "https://react-rc-ugc-v2-backend.onrender.com/user/outlets",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const outlets = await response.json();
          const options = outlets.map((outlet: string) => ({
            label: outlet,
            value: outlet,
          }));

          // Load saved outlet
          const savedOutlet = await AsyncStorage.getItem("outlet");

          setOutletOptions([{ label: "Select Branch", value: "" }, ...options]);

          if (savedOutlet) {
            setSelectedOutlet(savedOutlet);
          }
        } else {
          console.error("Failed to fetch outlets:", await response.text());
        }
      } catch (error) {
        console.error("Failed to load outlets", error);
      }
    };

    loadOutlets();
  }, []);

  const fetchEmail = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("userEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        Alert.alert("Error", "User email not found. Please log in again.");
      }
    } catch (error) {
      console.error("Failed to fetch email from storage:", error);
      Alert.alert("Error", "Failed to fetch user email.");
    }
  };

  useEffect(() => {
    fetchEmail();
  }, []);

  const fetchAttendanceData = async (outlet: string) => {
    if (!outlet || !email) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `https://react-rc-ugc-v2-backend.onrender.com/attendance/status?email=${email}&outlet=${outlet}&date=${today}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
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
        // Reset if no data found
        setAttendanceData({
          hasTimedIn: false,
          hasTimedOut: false,
          timeInTimestamp: null,
          timeOutTimestamp: null,
          addressTimeIn: null,
          addressTimeOut: null,
          timeInSelfieUri: null,
          timeOutSelfieUri: null,
        });
      }
    } catch (error) {
      console.error("Failed to fetch attendance data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedOutlet);
  }, [selectedOutlet, email]);

  const handleTimeIn = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
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

    try {
      const uri = result.assets[0].uri;
      setSelfieUri(uri);
      const timestamp = Date.now();
      const fileName = `Time_In_${email}_${timestamp}.jpg`;
      const presignRes = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/save-attendance-images",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        }
      );

      if (!presignRes.ok) throw new Error("Failed to get upload URL");
      const { url } = await presignRes.json();

      const imageBlob = await fetch(uri).then((r) => r.blob());
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: imageBlob,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const selfieUrl = url.split("?")[0];
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const timeIn = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      let resolvedAddress: string | null = null;
      if (location) {
        resolvedAddress = await getAddressFromCoords(
          location.latitude,
          location.longitude
        );
      }

      // Save attendance to backend
      const saveRes = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/attendance/time-in",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            date,
            outlet: selectedOutlet,
            timeIn,
            selfieUrl,
            location,
            timeInLocation: resolvedAddress,
          }),
        }
      );

      if (!saveRes.ok) {
        const errorText = await saveRes.text(); // Read actual error
        console.error("Time-in backend response:", errorText);
        throw new Error("Failed to save time-in data");
      }

      // Refresh attendance data after successful time-in
      await fetchAttendanceData(selectedOutlet);
      Alert.alert("Time In recorded!");
    } catch (error: unknown) {
      console.error(error);
      Alert.alert(
        "Failed to upload or save time-in.",
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  const handleTimeOut = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
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

    try {
      const uri = result.assets[0].uri;
      const timestamp = Date.now();
      const fileName = `Time_Out_${email}_${timestamp}.jpg`;

      const presignRes = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/save-attendance-images",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        }
      );

      if (!presignRes.ok) throw new Error("Failed to get upload URL");

      const { url } = await presignRes.json();

      const imageBlob = await fetch(uri).then((r) => r.blob());
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: imageBlob,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const timeOutSelfieUrl = url.split("?")[0];
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const timeOut = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      let resolvedAddress: string | null = null;
      if (location) {
        resolvedAddress = await getAddressFromCoords(
          location.latitude,
          location.longitude
        );
      }

      // Save to backend
      const saveRes = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/attendance/time-out",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            date,
            outlet: selectedOutlet,
            timeOut,
            timeOutSelfieUrl,
            location,
            timeOutLocation: resolvedAddress,
          }),
        }
      );

      if (!saveRes.ok) throw new Error("Failed to save time-out data");

      // Refresh attendance data after successful time-out
      await fetchAttendanceData(selectedOutlet);
      Alert.alert("Time Out recorded!");
    } catch (error: unknown) {
      console.error(error);
      Alert.alert(
        "Failed to upload or save time-out.",
        error instanceof Error ? error.message : String(error)
      );
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.appBarAttendance}>
        <Text style={styles.appBarTitleAttendance}>ATTENDANCE</Text>
      </View>

      {loading && <ActivityIndicator size="large" color="#0aafeb" />}

      {/* DATE & TIME */}
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        <Text style={{ fontSize: 22, fontWeight: "500", color: "#333" }}>
          {currentDate}
        </Text>
        <Text
          style={{
            fontSize: 48,
            fontWeight: "bold",
            color: "#0aafeb",
            marginTop: 5,
          }}
        >
          {currentTime}
        </Text>
      </View>

      {/* BRANCH DROPDOWN */}
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
          if (value) {
            AsyncStorage.setItem("outlet", value);
          }
        }}
        style={{
          marginBottom: 30,
          borderRadius: 10,
          borderColor: "#ccc",
          width: "100%",
        }}
        dropDownContainerStyle={{ borderRadius: 10, width: "100%" }}
      />

      {/* TIME IN SECTION */}
      <Text style={styles.sectionLabel}>TIME IN</Text>

      <TouchableOpacity
        onPress={handleTimeIn}
        disabled={attendanceData.hasTimedIn}
        style={[
          styles.customButton,
          {
            backgroundColor: attendanceData.hasTimedIn ? "#ccc" : "#0aafeb",
          },
        ]}
      >
        <Text style={styles.buttonText}>TIME IN</Text>
      </TouchableOpacity>
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        {attendanceData.timeInSelfieUri && (
          <TouchableOpacity
            onPress={() => viewSelfie(attendanceData.timeInSelfieUri!)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="eye" size={24} color="#0aafeb" />
              <Text style={styles.viewText}>View Time In Selfie</Text>
            </View>
          </TouchableOpacity>
        )}

        {attendanceData.timeInTimestamp && (
          <Text style={styles.timestamp}>
            {formatTimestamp(attendanceData.timeInTimestamp)}
          </Text>
        )}

        {attendanceData.addressTimeIn && (
          <Text style={styles.timestamp}>{attendanceData.addressTimeIn}</Text>
        )}
      </View>
      {/* TIME OUT SECTION */}
      <Text style={[styles.sectionLabel, { marginTop: 30 }]}>TIME OUT</Text>

      <TouchableOpacity
        onPress={handleTimeOut}
        disabled={!attendanceData.hasTimedIn || attendanceData.hasTimedOut}
        style={[
          styles.customButton,
          {
            backgroundColor:
              !attendanceData.hasTimedIn || attendanceData.hasTimedOut
                ? "#ccc"
                : "#eb3b5a",
          },
        ]}
      >
        <Text style={styles.buttonText}>TIME OUT</Text>
      </TouchableOpacity>
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        {attendanceData.timeOutSelfieUri && (
          <TouchableOpacity
            onPress={() => viewSelfie(attendanceData.timeOutSelfieUri!)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="eye" size={24} color="#0aafeb" />
              <Text style={styles.viewText}>View Time Out Selfie</Text>
            </View>
          </TouchableOpacity>
        )}

        {attendanceData.timeOutTimestamp && (
          <Text style={styles.timestamp}>
            {formatTimestamp(attendanceData.timeOutTimestamp)}
          </Text>
        )}

        {attendanceData.addressTimeOut && (
          <Text style={styles.timestamp}>{attendanceData.addressTimeOut}</Text>
        )}
      </View>
      {/* SELFIE MODAL */}
      {selectedSelfieUri && (
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selectedSelfieUri }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={{ color: "#fff" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default AttendanceScreen;
