import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const QTTProcess = () => {
  const navigation = useNavigation();
  const [userType, setUserType] = useState("");
  const [date, setDate] = useState("");
  const [merchandiser, setMerchandiser] = useState("");
  const [shelfspace, setShelfspace] = useState("");
  const [designated, setDesignated] = useState("");
  const [firstBrandSeen, setFirstBrandSeen] = useState("");
  const [complianceDOG, setComplianceDOG] = useState("");
  const [complianceCAT, setComplianceCAT] = useState("");
  const [royalCaninSignage, setRoyalCaninSignage] = useState("");
  const [visibilityCashier, setVisibilityCashier] = useState("");
  const [endcapGondola, setEndcapGondola] = useState("");
  const [wetProductsHighlight, setWetProductsHighlight] = useState("");
  const [tacticalBin, setTacticalBin] = useState("");
  const [PSRComment, setPSRComment] = useState("");

  // Individual images for each question
  const [ShelfSpaceImage, setShelfSpaceImage] = useState<string | null>(null);
  const [DesignatedImage, setDesignatedImage] = useState<string | null>(null);
  const [firstBrandImage, setFirstBrandImage] = useState<string | null>(null);
  const [complianceDOGImage, setComplianceDOGImage] = useState<string | null>(
    null
  );
  const [complianceCATImage, setComplianceCATImage] = useState<string | null>(
    null
  );
  const [royalCaninSignageImage, setRoyalCaninSignageImage] = useState<
    string | null
  >(null);
  const [visibilityCashierImage, setVisibilityCashierImage] = useState<
    string | null
  >(null);
  const [endcapGondolaImage, setEndcapGondolaImage] = useState<string | null>(
    null
  );
  const [wetProductsHighlightImage, setWetProductsHighlightImage] = useState<
    string | null
  >(null);
  const [tacticalBinImage, setTacticalBinImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
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

  const Question = ({
    title,
    value,
    onSelect,
    onImageCapture,
    capturedImage,
    onImagePreview,
    setCapturedImage, // <-- new prop to allow clearing the image
  }: {
    title: string;
    value: string;
    onSelect: (val: string) => void;
    onImageCapture: () => void;
    capturedImage: string | null;
    onImagePreview: (uri: string) => void;
    setCapturedImage: (val: string | null) => void; // <-- also add this to the prop type
  }) => (
    <View style={{ marginVertical: 10 }}>
      <Text style={styles.questionQTT}>{title}</Text>
      <View style={styles.buttonGroupQTT}>
        <TouchableOpacity
          style={[
            styles.optionButtonQTT,
            value === "Yes" && styles.selectedButtonQTTYes,
          ]}
          onPress={() => {
            onSelect("Yes");
            onImageCapture();
          }}
        >
          <Text style={styles.optionTextQTT}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButtonQTT,
            value === "No" && styles.selectedButtonQTTNo,
          ]}
          onPress={() => {
            onSelect("No");
            setCapturedImage(null); // clear image when No is selected
          }}
        >
          <Text style={styles.optionTextQTT}>No</Text>
        </TouchableOpacity>
      </View>

      {capturedImage && (
        <Pressable onPress={() => onImagePreview(capturedImage)}>
          <View style={{ alignItems: "center", marginTop: 15 }}>
            <Ionicons name="eye" size={24} color="blue" />
          </View>
          <Text style={{ color: "blue", textAlign: "center" }}>
            Preview Image
          </Text>
        </Pressable>
      )}
    </View>
  );

  const calculateLevel = () => {
    const images = [
      visibilityCashierImage,
      endcapGondolaImage,
      wetProductsHighlightImage,
      tacticalBinImage,
    ];
    const filledInputs = images.filter((img) => img).length;

    if (filledInputs === 4) {
      return "Level 2: Execution of ALL of the Menu of Royal Canin product display";
    } else if (filledInputs === 3) {
      return "Level 1: Execution of any of the 3 Merch Secondary Displays";
    } else {
      return "Execution"; // Placeholder when no level met
    }
  };

  // In your component
  const levelTitle = calculateLevel();

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
    // Reset all images and answers when user type changes
    setFirstBrandImage(null);
    setShelfSpaceImage(null);
    setDesignatedImage(null);
    setComplianceDOGImage(null);
    setComplianceCATImage(null);
    setRoyalCaninSignageImage(null);
    setVisibilityCashierImage(null);
    setEndcapGondolaImage(null);
    setWetProductsHighlightImage(null);
    setTacticalBinImage(null);
    setPreviewImage(null);
    setIsModalVisible(false);
    setShelfspace("");
    setDesignated("");
    setFirstBrandSeen("");
    setComplianceDOG("");
    setComplianceCAT("");
    setSelectedOutlet("");
    setRoyalCaninSignage("");
    setVisibilityCashier("");
    setEndcapGondola("");
    setWetProductsHighlight("");
    setTacticalBin("");
    setSelectedOutlet("");
    setPSRComment("");
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

  const openCamera = async (questionType: string) => {
    const cameraPermissionResult =
      await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermissionResult.granted) {
      Alert.alert("Permission required", "Please allow access to camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;

      switch (questionType) {
        case "firstBrand":
          setFirstBrandImage(uri);
          break;
        case "complianceDOG":
          setComplianceDOGImage(uri);
          break;
        case "complianceCAT":
          setComplianceCATImage(uri);
          break;
        case "royalCaninSignage":
          setRoyalCaninSignageImage(uri);
          break;
        case "visibilityCashier":
          setVisibilityCashierImage(uri);
          break;
        case "endcapGondola":
          setEndcapGondolaImage(uri);
          break;
        case "wetProductsHighlight":
          setWetProductsHighlightImage(uri);
          break;
        case "tacticalBin":
          setTacticalBinImage(uri);
          break;
        case "shelfspace":
          setShelfSpaceImage(uri);
          break;
        case "designated":
          setDesignatedImage(uri);
          break;
        default:
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
    setLoading(true);
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        Alert.alert("Error", "User email not found. Please login again.");
        setLoading(false);
        return;
      }

      // Validate outlet
      if (!selectedOutlet) {
        Alert.alert("Missing Outlet", "Please Select Outlet.");
        return;
      }

      if (!PSRComment) {
        Alert.alert("Missing Comment", "Please Comment Feedback.");
        return;
      }

      // Validate required fields and images for PSR
      if (userType === "PSR") {
        if (
          !firstBrandSeen ||
          !complianceDOG ||
          !complianceCAT ||
          !royalCaninSignage ||
          !visibilityCashier ||
          !endcapGondola ||
          !wetProductsHighlight ||
          !tacticalBin
        ) {
          Alert.alert(
            "Incomplete PSR Input",
            "Please answer all required PSR questions."
          );
          return;
        }
        if (royalCaninSignage === "Yes" && !royalCaninSignageImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for 'Royal Canin Outside Signage' question."
          );
          return;
        }

        // Check if images are required for "Yes" answers
        if (firstBrandSeen === "Yes" && !firstBrandImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for 'First brand seen' question."
          );
          return;
        }

        if (complianceDOG === "Yes" && !complianceDOGImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for 'Compliance with DOG planogram' question."
          );
          return;
        }
        if (complianceCAT === "Yes" && !complianceCATImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for 'Compliance with CAT planogram' question."
          );
          return;
        }
        if (visibilityCashier === "Yes" && !visibilityCashierImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for 'Royal Canin Outside Signage' question."
          );
          return;
        }
        if (endcapGondola === "Yes" && !endcapGondolaImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for 'Royal Canin Outside Signage' question."
          );
          return;
        }
        if (wetProductsHighlight === "Yes" && !wetProductsHighlightImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for 'Royal Canin Outside Signage' question."
          );
          return;
        }
        if (tacticalBin === "Yes" && !tacticalBinImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for 'Royal Canin Outside Signage' question."
          );
          return;
        }
      }

      // Validate required fields and images for VET
      if (userType === "VET") {
        if (!shelfspace || !designated) {
          Alert.alert(
            "Incomplete VET Input",
            "Please answer all required VET questions."
          );
          return;
        }
        // Check if images are required for "Yes" answers
        if (shelfspace === "Yes" && !ShelfSpaceImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for '80% Shelf Space' question."
          );
          return;
        }
        if (designated === "Yes" && !DesignatedImage) {
          Alert.alert(
            "Missing Image",
            "Please take a photo for 'Designated Rack' question."
          );
          return;
        }
      }

      // Upload images to S3 (only if they exist)
      const imageKeys: any = {};

      if (firstBrandImage) {
        imageKeys.firstBrandKey = await uploadToS3(
          firstBrandImage,
          `firstBrand_${Date.now()}.jpg`
        );
      }
      if (complianceDOGImage) {
        imageKeys.complianceDOGKey = await uploadToS3(
          complianceDOGImage,
          `complianceDOG_${Date.now()}.jpg`
        );
      }
      if (complianceCATImage) {
        imageKeys.complianceCATKey = await uploadToS3(
          complianceCATImage,
          `complianceCAT_${Date.now()}.jpg`
        );
      }
      if (royalCaninSignageImage) {
        imageKeys.royalCaninSignageKey = await uploadToS3(
          royalCaninSignageImage,
          `royalCaninSignage_${Date.now()}.jpg`
        );
      }
      if (visibilityCashierImage) {
        imageKeys.visibilityCashierKey = await uploadToS3(
          visibilityCashierImage,
          `visibilityCashier_${Date.now()}.jpg`
        );
      }
      if (endcapGondolaImage) {
        imageKeys.endcapGondolaKey = await uploadToS3(
          endcapGondolaImage,
          `endcapGondola${Date.now()}.jpg`
        );
      }
      if (wetProductsHighlightImage) {
        imageKeys.wetProductsHighlightKey = await uploadToS3(
          wetProductsHighlightImage,
          `wetProductsHighlight${Date.now()}.jpg`
        );
      }
      if (tacticalBinImage) {
        imageKeys.tacticalBinKey = await uploadToS3(
          tacticalBinImage,
          `tacticalBin${Date.now()}.jpg`
        );
      }
      if (ShelfSpaceImage) {
        imageKeys.ShelfSpaceKey = await uploadToS3(
          ShelfSpaceImage,
          `shelfspace${Date.now()}.jpg`
        );
      }
      if (DesignatedImage) {
        imageKeys.DesignatedKey = await uploadToS3(
          DesignatedImage,
          `designated${Date.now()}.jpg`
        );
      }

      // Prepare payload
      const payload: any = {
        userType,
        date,
        merchandiser,
        outlet: selectedOutlet,
        userEmail,
        ...imageKeys,
      };

      if (userType === "PSR") {
        payload.firstBrandSeen = firstBrandSeen;
        payload.complianceDOG = complianceDOG;
        payload.complianceCAT = complianceCAT;
        payload.royalCaninSignage = royalCaninSignage;
        payload.visibilityCashier = visibilityCashier;
        payload.endcapGondola = endcapGondola;
        payload.wetProductsHighlight = wetProductsHighlight;
        payload.tacticalBin = tacticalBin;
        payload.PSRComment = PSRComment;
      } else if (userType === "VET") {
        payload.shelfSpace = shelfspace;
        payload.designatedRack = designated;
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
    } finally {
      setLoading(false);
    }
  };

  const ClearData = () => {
    setFirstBrandImage(null);
    setShelfSpaceImage(null);
    setDesignatedImage(null);
    setComplianceDOGImage(null);
    setComplianceCATImage(null);
    setRoyalCaninSignageImage(null);
    setVisibilityCashierImage(null);
    setEndcapGondolaImage(null);
    setWetProductsHighlightImage(null);
    setTacticalBinImage(null);
    setPreviewImage(null);
    setIsModalVisible(false);
    setShelfspace("");
    setDesignated("");
    setFirstBrandSeen("");
    setComplianceDOG("");
    setComplianceCAT("");
    setSelectedOutlet("");
    setRoyalCaninSignage("");
    setVisibilityCashier("");
    setEndcapGondola("");
    setWetProductsHighlight("");
    setTacticalBin("");
    setPSRComment("");
    setSelectedOutlet("");
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

            {userType === "PSR" && (
              <>
                <Question
                  title="Royal Canin Outside Signage"
                  value={royalCaninSignage}
                  onSelect={setRoyalCaninSignage}
                  onImageCapture={() => openCamera("royalCaninSignage")}
                  capturedImage={royalCaninSignageImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setRoyalCaninSignageImage}
                />
                <Question
                  title="Dedicated rack for Royal Canin products, first brand seen"
                  value={firstBrandSeen}
                  onSelect={setFirstBrandSeen}
                  onImageCapture={() => openCamera("firstBrand")}
                  capturedImage={firstBrandImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setFirstBrandImage}
                />
                <Question
                  title="Compliance with DOG planogram."
                  value={complianceDOG}
                  onSelect={setComplianceDOG}
                  onImageCapture={() => openCamera("complianceDOG")}
                  capturedImage={complianceDOGImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setComplianceDOGImage}
                />
                <Question
                  title="Compliance with CAT planogram."
                  value={complianceCAT}
                  onSelect={setComplianceCAT}
                  onImageCapture={() => openCamera("complianceCAT")}
                  capturedImage={complianceCATImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setComplianceCATImage}
                />

                <View style={styles.executionContainer}>
                  <Text style={styles.executionTitle}>{levelTitle}</Text>
                </View>

                <Question
                  title="Visibility in cashier"
                  value={visibilityCashier}
                  onSelect={setVisibilityCashier}
                  onImageCapture={() => openCamera("visibilityCashier")}
                  capturedImage={visibilityCashierImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setVisibilityCashierImage}
                />
                <Question
                  title="Endcap/Gondola"
                  value={endcapGondola}
                  onSelect={setEndcapGondola}
                  onImageCapture={() => openCamera("endcapGondola")}
                  capturedImage={endcapGondolaImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setEndcapGondolaImage}
                />
                <Question
                  title="Highlight of wet products (using wet hanger placement OR side by side to dry)"
                  value={wetProductsHighlight}
                  onSelect={setWetProductsHighlight}
                  onImageCapture={() => openCamera("wetProductsHighlight")}
                  capturedImage={wetProductsHighlightImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setWetProductsHighlightImage}
                />
                <Question
                  title="Tactical bin"
                  value={tacticalBin}
                  onSelect={setTacticalBin}
                  onImageCapture={() => openCamera("tacticalBin")}
                  capturedImage={tacticalBinImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setTacticalBinImage}
                />
                <Text style={styles.labelQTT}>Feedback</Text>
                <TextInput
                  placeholder="Enter your comment for feedback"
                  placeholderTextColor="#222021"
                  value={PSRComment} // You'll need to define this in your state
                  onChangeText={setPSRComment} // And this setter too
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                    padding: 12,
                    marginTop: 12,
                  }}
                />
              </>
            )}

            {userType === "VET" && (
              <>
                <Question
                  title="80% Shelf Space."
                  value={shelfspace}
                  onSelect={setShelfspace}
                  onImageCapture={() => openCamera("shelfspace")}
                  capturedImage={ShelfSpaceImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setShelfSpaceImage}
                />
                <Question
                  title="Designated Rack."
                  value={designated}
                  onSelect={setDesignated}
                  onImageCapture={() => openCamera("designated")}
                  capturedImage={DesignatedImage}
                  onImagePreview={openImagePreview}
                  setCapturedImage={setDesignatedImage}
                />
              </>
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
              <TouchableOpacity onPress={ClearData} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={24} color="gray" />
                <Text style={styles.iconLabel}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#999" : "#0aafeb",
                  padding: 10,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Submit
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                  backgroundColor: "#d9534f",
                  padding: 10,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default QTTProcess;
