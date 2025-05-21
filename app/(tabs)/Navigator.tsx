import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AttendanceScreen from "./AttendaceScreen";
import QTTScreen from "./QTTScreen";
import CompetitorsScreen from "./CompetitorsScreen";
import ProfileScreen from "./ProfileScreen";

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const Screens = () => {
  return (
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
        <Tab.Screen name="QTT" component={QTTScreen} />
        <Tab.Screen name="Competitors" component={CompetitorsScreen} />
        <Tab.Screen name="Attendance" component={AttendanceScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

export default Screens;
