import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import styles from "./Style";
import DropDownPicker from "react-native-dropdown-picker";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";

const Competitors = () => {
  const navigation = useNavigation();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [merchandiser, setMerchandiser] = useState("");
  const [store, setStore] = useState("");
  const [company, setCompany] = useState("");
  const [brand, setBrand] = useState("");
  const [promoDetails, setPromoDetails] = useState("");
  const [displayLocation, setDisplayLocation] = useState("");
  const [pricing, setPricing] = useState("");
  const [duration, setDuration] = useState("");
  const [impact, setImpact] = useState("");
  const [feedback, setFeedback] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [outletOptions, setOutletOptions] = useState([
    { label: "Select Branch", value: "" },
  ]);

  // Promotional type dropdown
  const [promoType, setPromoType] = useState<string | null>(null);
  const [promoItems] = useState([
    { label: "Buy One Take One", value: "Buy One Take One" },
    { label: "With Free Item", value: "With Free Item" },
    { label: "New Product", value: "New Product" },
    { label: "Price Decrease", value: "Price Decrease" },
    { label: "Sell-in Promotional", value: "Sell-in Promotional" },
    { label: "Category Management (CatMan)", value: "CatMan" },
    { label: "Checkout Counter Display or Promo Area", value: "Checkout" },
    { label: "Redemption", value: "Redemption" },
  ]);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setDate(formattedDate);
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setMerchandiser(`${user.firstName} ${user.lastName}`);
      }
    };
    fetchUserInfo();
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

  const handleClear = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setMerchandiser("");
    setSelectedOutlet("");
    setStore("");
    setCompany("");
    setBrand("");
    setPromoType(null);
    setPromoDetails("");
    setDisplayLocation("");
    setPricing("");
    setDuration("");
    setImpact("");
    setFeedback("");
  };

  // New Save function to POST data to backend
  const handleSubmit = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        Alert.alert("Error", "User email not found. Please login again.");
        return;
      }

      const formData = {
        date,
        merchandiser,
        outlet: selectedOutlet,
        store,
        company,
        brand,
        promoType,
        promoDetails,
        displayLocation,
        pricing,
        duration,
        impact,
        feedback,
        userEmail, // Added here
      };

      const response = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/competitors/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Competitor data saved successfully.");
        handleClear();
        // navigation.goBack(); // or router.replace("/someRoute");
      } else {
        Alert.alert("Error", "Failed to save data.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.pageContainer}
      contentContainerStyle={{ paddingBottom: 40 }}
      enableOnAndroid
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <View>
          <View style={styles.appBarCompetitor}>
            <Text style={styles.appBarTitleCompetitor}>COMPETITOR PROCESS</Text>
          </View>
        </View>

        <Text style={styles.labelQTT}>Date</Text>
        <TextInput
          value={date}
          editable={false}
          style={styles.pickerWrapperQTT}
        />

        <Text style={styles.labelQTT}>Merchandiser</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          editable={false}
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

        <Text style={styles.labelQTT}>Store</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          value={store}
          onChangeText={setStore}
        />

        <Text style={styles.labelQTT}>Company</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          value={company}
          onChangeText={setCompany}
        />

        <Text style={styles.labelQTT}>Brand</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          value={brand}
          onChangeText={setBrand}
        />

        <Text style={styles.labelQTT}>Promotional Type</Text>
        <View style={styles.pickerWrapperQTT}>
          <Picker
            selectedValue={promoType}
            onValueChange={(itemValue) => setPromoType(itemValue)}
            style={styles.pickerWrapperQTT}
            dropdownIconColor={"black"}
          >
            <Picker.Item
              label="Select Type"
              value={null}
              style={styles.pickerWrapperQTT}
            />
            {promoItems.map((item, index) => (
              <Picker.Item
                key={index}
                label={item.label}
                value={item.value}
                style={styles.pickerWrapperQTT}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.labelQTT}>Promotional Type Details</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          value={promoDetails}
          onChangeText={setPromoDetails}
        />

        <Text style={styles.labelQTT}>Display Location</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          value={displayLocation}
          onChangeText={setDisplayLocation}
        />

        <Text style={styles.labelQTT}>Pricing</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          value={pricing}
          onChangeText={setPricing}
        />

        <Text style={styles.labelQTT}>Duration of Promo</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          value={duration}
          onChangeText={setDuration}
        />

        <Text style={styles.labelQTT}>Impact to our Product</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          value={impact}
          onChangeText={setImpact}
        />

        <Text style={styles.labelQTT}>Customer Feedback</Text>
        <TextInput
          style={styles.pickerWrapperQTT}
          value={feedback}
          onChangeText={setFeedback}
        />

        <View style={styles.buttonRowQTT}>
          <TouchableOpacity onPress={handleClear} style={styles.iconButton}>
            <Ionicons name="trash-outline" size={24} color="gray" />
            <Text style={styles.iconLabel}>Clear</Text>
          </TouchableOpacity>

          <Button title="Submit" onPress={handleSubmit} />

          <Button
            title="Cancel"
            color="#d9534f"
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Competitors;
