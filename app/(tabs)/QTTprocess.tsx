import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Ionicons from "react-native-vector-icons/Ionicons";
import styles from "./Style";

const Question = ({
  title,
  value,
  onSelect,
}: {
  title: string;
  value: string;
  onSelect: (val: string) => void;
}) => (
  <View style={{ marginVertical: 10 }}>
    <Text style={styles.questionQTT}>{title}</Text>
    <View style={styles.buttonGroupQTT}>
      <TouchableOpacity
        style={[
          styles.optionButtonQTT,
          value === "Yes" && styles.selectedButtonQTTYes,
        ]}
        onPress={() => onSelect("Yes")}
      >
        <Text style={styles.optionTextQTT}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.optionButtonQTT,
          value === "No" && styles.selectedButtonQTTNo,
        ]}
        onPress={() => onSelect("No")}
      >
        <Text style={styles.optionTextQTT}>No</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const QTTProcess = () => {
  const [userType, setUserType] = useState("");
  const [date, setDate] = useState("");
  const [merchandiser, setMerchandiser] = useState("");
  const [firstBrandSeen, setFirstBrandSeen] = useState("");
  const [complianceDOG, setComplianceDOG] = useState("");
  const [complianceCAT, setComplianceCAT] = useState("");
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [outlet, setOutlet] = useState("");
  const [outletOptions, setOutletOptions] = useState([
    { label: "Select Branch", value: "" },
  ]);

  const openImagePreview = (uri: string) => {
    setPreviewImage(uri);
    setIsModalVisible(true);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setMerchandiser(`${user.firstName} ${user.lastName}`);
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    setBeforeImage(null);
    setAfterImage(null);
    setPreviewImage(null);
    setIsModalVisible(false);
    setFirstBrandSeen("");
    setComplianceDOG("");
    setComplianceCAT("");
    setSelectedOutlet("");
  }, [userType]);

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

          setOutletOptions([{ label: "Select Branch", value: "" }, ...options]);
        } else {
          console.error("Failed to fetch outlets:", await response.text());
        }
      } catch (error) {
        console.error("Failed to load outlets", error);
      }
    };

    loadOutlets();
  }, []);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setDate(formattedDate);
  }, []);

  const openGallery = async (type: "before" | "after") => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Please allow access to gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      if (type === "before") {
        setBeforeImage(uri);
      } else {
        setAfterImage(uri);
      }
    }
  };

  const uploadToS3 = async (uri: string, fileName: string) => {
    try {
      const res = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/get-qtt-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        }
      );

      const rawText = await res.text();

      if (!res.ok) {
        console.error("get-qtt-url failed:", rawText);
        throw new Error("Failed to get pre-signed URL");
      }

      let urlData;
      try {
        urlData = JSON.parse(rawText);
      } catch (e) {
        console.error("Failed to parse JSON:", rawText);
        throw new Error("Invalid JSON response from server");
      }

      const { url, key } = urlData;

      const imageBlob = await (await fetch(uri)).blob();

      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: imageBlob,
      });

      if (!uploadRes.ok) {
        throw new Error("S3 Upload Failed");
      }

      return key;
    } catch (err) {
      console.error("Upload to S3 error:", err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        Alert.alert("Error", "User email not found. Please login again.");
        return;
      }

      // Validate image selection
      if (!beforeImage || !afterImage) {
        Alert.alert(
          "Missing Image",
          "Please select both before and after images."
        );
        return;
      }

      // Validate outlet
      if (!selectedOutlet) {
        console.log("Selected outlet:", selectedOutlet);

        Alert.alert("Missing Fields", "Please Select Outlet.");
        return;
      }

      // Validate required fields for PSR
      if (userType === "PSR") {
        if (!firstBrandSeen || !complianceDOG || !complianceCAT) {
          Alert.alert(
            "Incomplete PSR Input",
            "Please answer all required PSR questions."
          );
          return;
        }
      }

      // Validate required fields for VET
      if (userType === "VET") {
        if (!firstBrandSeen || !complianceDOG) {
          Alert.alert(
            "Incomplete VET Input",
            "Please answer all required VET questions."
          );
          return;
        }
      }

      // Upload images to S3
      const beforeKey = await uploadToS3(
        beforeImage,
        `before_${Date.now()}.jpg`
      );
      const afterKey = await uploadToS3(afterImage, `after_${Date.now()}.jpg`);

      // Prepare payload
      const payload: any = {
        userType,
        date,
        merchandiser,
        outlet: selectedOutlet,
        beforeImageKey: beforeKey,
        afterImageKey: afterKey,
        userEmail, // Added here
      };

      if (userType === "PSR") {
        payload.firstBrandSeen = firstBrandSeen;
        payload.complianceDOG = complianceDOG;
        payload.complianceCAT = complianceCAT;
      } else if (userType === "VET") {
        payload.shelfSpace = firstBrandSeen;
        payload.designatedRack = complianceDOG;
      }

      // Submit to backend
      const response = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/QTTsubmit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Server error:", result);
        Alert.alert("Error", result.error || "Failed to submit.");
        return;
      }

      Alert.alert("Success", result.message);
    } catch (err) {
      console.error("QTT Submit Error:", err);
      Alert.alert("Error", "Failed to submit QTT. Please try again.");
    }
  };

  const handleCancel = () => {
    setBeforeImage(null);
    setAfterImage(null);
    setPreviewImage(null);
    setIsModalVisible(false);
    setFirstBrandSeen("");
    setComplianceDOG("");
    setComplianceCAT("");
    setOutlet("");
  };

  return (
    <KeyboardAwareScrollView
      style={styles.pageContainer}
      contentContainerStyle={{ paddingBottom: 40 }}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <View style={styles.appBarCompetitor}>
          <Text style={styles.appBarTitleCompetitor}>QTT PROCESS</Text>
        </View>

        <Text style={styles.labelQTT}>Select Type</Text>
        <View style={styles.pickerWrapperQTT}>
          <Picker
            selectedValue={userType}
            onValueChange={(itemValue) => setUserType(itemValue)}
            style={styles.pickerWrapperQTT}
            dropdownIconColor={"black"}
          >
            <Picker.Item
              style={styles.pickerWrapperQTT}
              label="Select"
              value=""
            />
            <Picker.Item
              style={styles.pickerWrapperQTT}
              label="PSR"
              value="PSR"
            />
            <Picker.Item
              style={styles.pickerWrapperQTT}
              label="VET"
              value="VET"
            />
          </Picker>
        </View>

        {(userType === "PSR" || userType === "VET") && (
          <>
            <Text style={styles.labelQTT}>Date</Text>
            <TextInput
              value={date}
              editable={false}
              style={styles.pickerWrapperQTT}
            />
            <Text style={styles.labelQTT}>Merchandiser</Text>
            <TextInput
              editable={false}
              style={styles.pickerWrapperQTT}
              value={merchandiser}
              onChangeText={setMerchandiser}
            />
            <Text style={styles.labelQTT}>Select Outlet</Text>
            <View style={styles.pickerQTT}>
              <DropDownPicker
                open={open}
                value={selectedOutlet}
                items={outletOptions}
                setOpen={setOpen}
                setValue={setSelectedOutlet}
                setItems={setOutletOptions}
                searchable
                placeholder="Select Branch"
                style={{ width: 407 }}
                dropDownContainerStyle={{ width: 407 }}
                listMode="SCROLLVIEW"
              />
            </View>
            <TouchableOpacity
              style={styles.gallerybutton}
              onPress={() => openGallery("before")}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>
                Access Gallery (Before)
              </Text>
            </TouchableOpacity>

            {beforeImage && (
              <Pressable onPress={() => openImagePreview(beforeImage)}>
                <View style={{ alignItems: "center", marginTop: 15 }}>
                  <Ionicons name="eye" size={24} color="blue" />
                </View>
                <Text style={{ color: "blue", textAlign: "center" }}>
                  Preview (Before)
                </Text>
              </Pressable>
            )}

            {userType === "PSR" && (
              <>
                <Question
                  title="First brand seen inside with main shelf and headers."
                  value={firstBrandSeen}
                  onSelect={setFirstBrandSeen}
                />
                <Question
                  title="Compliance with DOG planogram."
                  value={complianceDOG}
                  onSelect={setComplianceDOG}
                />
                <Question
                  title="Compliance with CAT planogram."
                  value={complianceCAT}
                  onSelect={setComplianceCAT}
                />
              </>
            )}

            {userType === "VET" && (
              <>
                <Question
                  title="80% Shelf Space."
                  value={firstBrandSeen}
                  onSelect={setFirstBrandSeen}
                />
                <Question
                  title="Designated Rack."
                  value={complianceDOG}
                  onSelect={setComplianceDOG}
                />
              </>
            )}

            <TouchableOpacity
              style={styles.gallerybutton}
              onPress={() => openGallery("after")}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>
                Access Gallery (After)
              </Text>
            </TouchableOpacity>

            {afterImage && (
              <Pressable onPress={() => openImagePreview(afterImage)}>
                <View style={{ alignItems: "center", marginTop: 15 }}>
                  <Ionicons name="eye" size={24} color="blue" />
                </View>
                <Text style={{ color: "blue", textAlign: "center" }}>
                  Preview (After)
                </Text>
              </Pressable>
            )}

            <Modal visible={isModalVisible} transparent={true}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  style={{ position: "absolute", top: 40, right: 20 }}
                >
                  <Ionicons name="close-circle" size={36} color="white" />
                </Pressable>
                {previewImage && (
                  <Image
                    source={{ uri: previewImage }}
                    style={{ width: "90%", height: "70%", borderRadius: 12 }}
                    resizeMode="contain"
                  />
                )}
              </View>
            </Modal>

            <View style={styles.buttonRowQTT}>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.iconButton}
              >
                <Ionicons name="trash-outline" size={24} color="gray" />
                <Text style={styles.iconLabel}>Clear</Text>
              </TouchableOpacity>

              <Button title="Submit" onPress={handleSubmit} />
              <Button
                title="Cancel"
                color="#d9534f"
                onPress={() => router.replace("/Navigator")}
              />
            </View>
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default QTTProcess;
