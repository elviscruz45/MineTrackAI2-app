import {
  View,
  Text,
  Pressable,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, Tabs } from "expo-router";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import { update_firebasePhoto } from "../../../redux/actions/profile";
import { update_firebaseUserName } from "../../../redux/actions/profile";
import { update_firebaseEmail } from "../../../redux/actions/profile";
import { update_firebaseUid } from "../../../redux/actions/profile";
import { saveActualAITServicesFirebaseGlobalState } from "../../../redux/actions/post";
import { getAuth } from "firebase/auth";
import { db } from "@/firebaseConfig";

function _layoutRaw(props: any) {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "home",
          headerShown: false,
          headerTitleAlign: "center", // Center the title
        }}
      />
      <Stack.Screen
        name="comment"
        options={{
          title: "Comentarios",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
        }}
      />
      <Stack.Screen
        name="EditEvent"
        options={{
          title: "Editar Evento",
          headerShown: true,
          headerTitleAlign: "center", // Center the title
        }}
      />
    </Stack>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    user_photo: reducers.profile.user_photo,
    profile: reducers.profile.profile,
  };
};

const _layout = connect(mapStateToProps, {
  update_firebasePhoto,
  update_firebaseUserName,
  update_firebaseEmail,
  update_firebaseUid,
  saveActualAITServicesFirebaseGlobalState,
})(_layoutRaw);

export default _layout;
