import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import { Pressable } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Lista artykułów",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="newspaper-variant-outline"
              size={24}
              color={color}
            />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    style={{
                      marginRight: 15,
                      opacity: pressed ? 0.5 : 1,
                      color: Colors.text,
                    }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="add-feed"
        options={{
          title: "Dodaj Feed",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="plus-box-outline"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Ulubione",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="heart-o" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
