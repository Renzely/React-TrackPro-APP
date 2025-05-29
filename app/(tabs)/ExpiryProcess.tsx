import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import styles from "./Style";

type ExpiryEntry = {
  month: string;
  sku: string;
  expiration: string;
};

const Expiry = () => {
  const navigation = useNavigation();
  const router = useRouter();

  const [date, setDate] = useState("");
  const [merchandiser, setMerchandiser] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [expiryEntries, setExpiryEntries] = useState<ExpiryEntry[]>([
    { month: "", sku: "", expiration: "" },
  ]);
  const [outletOptions, setOutletOptions] = useState([
    { label: "Select Branch", value: "" },
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

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = expiryEntries.filter((_, i) => i !== index);
    setExpiryEntries(updatedEntries);
  };

  const getFutureMonths = () => {
    const now = new Date();
    const months = [];
    for (let i = now.getMonth() + 1; i < 12; i++) {
      const monthName = new Date(0, i).toLocaleString("default", {
        month: "long",
      });
      months.push({ label: monthName, value: monthName });
    }
    return months;
  };

  const handleAddEntry = () => {
    setExpiryEntries([
      ...expiryEntries,
      { month: "", sku: "", expiration: "" },
    ]);
  };

  const handleChangeEntry = (
    index: number,
    field: "month" | "sku" | "expiration",
    value: string
  ) => {
    const updatedEntries = [...expiryEntries];
    updatedEntries[index][field] = value;
    setExpiryEntries(updatedEntries);
  };

  // New Save function to POST data to backend
  const handleSubmit = async () => {
    try {
      if (!selectedOutlet) {
        Alert.alert("Validation Error", "Please select an outlet.");
        return;
      }

      const hasEmptyFields = expiryEntries.some(
        (entry) => !entry.month || !entry.sku.trim() || !entry.expiration.trim()
      );

      if (hasEmptyFields) {
        Alert.alert("Validation Error", "Please fill in all expiry fields.");
        return;
      }

      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        Alert.alert("Error", "User email not found. Please login again.");
        return;
      }

      const formData = {
        date,
        merchandiser,
        outlet: selectedOutlet,
        expiryEntries,
        userEmail,
      };

      const response = await fetch(
        "https://react-rc-ugc-v2-backend.onrender.com/expiry/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Expiry data saved successfully.");
        // navigation.goBack();
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
            <Text style={styles.appBarTitleCompetitor}>EXPIRY PROCESS</Text>
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

        {expiryEntries.map((entry, index) => (
          <View key={index} style={{ marginBottom: 15 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={[
                  styles.labelQTT,
                  { fontWeight: "bold", fontSize: 16, marginTop: 10 },
                ]}
              >
                No. Expiry {index + 1}
              </Text>
              {expiryEntries.length > 1 && (
                <TouchableOpacity onPress={() => handleRemoveEntry(index)}>
                  <Ionicons name="trash" size={24} color="red" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.labelQTT}>Month</Text>
            <View style={styles.pickerWrapperQTT}>
              <Picker
                selectedValue={entry.month}
                onValueChange={(value) =>
                  handleChangeEntry(index, "month", value)
                }
                dropdownIconColor={"black"}
                style={styles.pickerWrapperQTT}
              >
                <Picker.Item label="Select Month" value="" />
                {getFutureMonths().map((month, idx) => (
                  <Picker.Item
                    key={idx}
                    label={month.label}
                    value={month.value}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.labelQTT}>SKU</Text>
            <TextInput
              style={styles.pickerWrapperQTT}
              value={entry.sku}
              onChangeText={(text) => handleChangeEntry(index, "sku", text)}
              placeholder="Enter SKU"
            />

            <Text style={styles.labelQTT}>Expiration</Text>
            <TextInput
              style={styles.pickerWrapperQTT}
              value={entry.expiration}
              onChangeText={(text) =>
                handleChangeEntry(index, "expiration", text)
              }
              placeholder="Enter Expiration Date"
            />
          </View>
        ))}

        <View style={styles.buttonRowQTT}>
          <Button title="Submit" onPress={handleSubmit} />
          <Button title="Add" onPress={handleAddEntry} />
          <Button
            title="Cancel"
            color="#d9534f"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Expiry;
