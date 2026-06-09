import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, View } from "react-native";
import AttendanceScreen from "./AttendanceScreen";
import ProfileScreen from "./ProfileScreen";
import { AuthGuard } from "./auth-guard";

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
                case "AttendanceHistory":
                  iconName = "save-outline";
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
          <Tab.Screen name="Attendance" component={AttendanceScreen} />
          {/* <Tab.Screen name="AttendanceHistory" component={AttendanceHistory} /> */}
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </SafeAreaView>
    </AuthGuard>
  );
};

export default Screens;
