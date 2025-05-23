import React, { useEffect, useState } from "react";
import { SafeAreaView, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AttendanceScreen from "./AttendaceScreen";
import QTTScreen from "./QTTScreen";
import CompetitorsScreen from "./CompetitorsScreen";
import ProfileScreen from "./ProfileScreen";
import ExpiryScreen from "./ExpiryScreen";
import { AuthGuard } from "./auth-guard";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

const Screens = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setRole(user.role);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, []);

  if (loading) {
    // Show a loading indicator while fetching role
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0aafeb" />
      </View>
    );
  }

  return (
    <AuthGuard>
      <SafeAreaView style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              switch (route.name) {
                case "Attendance":
                  iconName = "save-outline";
                  break;
                case "QTT":
                  iconName = "document-text-outline";
                  break;
                case "Competitors":
                  iconName = "documents-outline";
                  break;
                case "Expiry":
                  iconName = "today-outline";
                  break;
                case "Profile":
                  iconName = "person-outline";
                  break;
                default:
                  iconName = "help-circle-outline";
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#0aafeb",
            tabBarInactiveTintColor: "gray",
            headerShown: false,
          })}
        >
          {role === "RC" && (
            <>
              <Tab.Screen name="QTT" component={QTTScreen} />
              <Tab.Screen name="Competitors" component={CompetitorsScreen} />
              <Tab.Screen name="Expiry" component={ExpiryScreen} />
            </>
          )}
          <Tab.Screen name="Attendance" component={AttendanceScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </SafeAreaView>
    </AuthGuard>
  );
};

export default Screens;
