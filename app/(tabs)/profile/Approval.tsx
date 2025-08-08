import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Linking, FlatList, Text } from "react-native";
import { Button, Icon } from "@rneui/themed";
import { getAuth, signOut } from "firebase/auth";
import styles from "./Approval.styles";
import { connect } from "react-redux";
import { Modal } from "@/components/Modal/Modal";
import { update_firebaseProfile } from "../../../redux/actions/profile";
import {
  collection,
  query,
  where,
  orderBy,
  doc,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Image as ImageExpo } from "expo-image";
import { screen } from "../../../utils";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { areaLists } from "../../../utils/areaList";
import { update_approvalQuantity } from "../../../redux/actions/profile";
import { useRouter } from "expo-router";

function ApprovalScreenBare(props: any) {
  const router = useRouter();

  //create the algoritm to have the date format of the post
  const formatDate = (dateInput: any) => {
    const { seconds, nanoseconds } = dateInput || {
      seconds: 0,
      nanoseconds: 0,
    };
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    const date = new Date(milliseconds);
    const monthNames = [
      "ene.",
      "feb.",
      "mar.",
      "abr.",
      "may.",
      "jun.",
      "jul.",
      "ago.",
      "sep.",
      "oct.",
      "nov.",
      "dic.",
    ];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const formattedDate = `${day} ${month} ${year}  ${hour}:${minute} Hrs`;
    return formattedDate;
  };

  const goToApprove = async (item: any) => {
    router.push({
      pathname: "/search/DocstoApprove",
      params: { idServiciosAIT: item },
    });
  };

  let approvalListPending = props.approvalListNew?.filter((item: any) => {
    return !(
      item.ApprovalPerformed?.includes(props.email) ||
      item.RejectionPerformed?.includes(props.email)
    );
  });

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: "white" }} // Add backgroundColor here
    >
      <Text></Text>

      <FlatList
        data={approvalListPending}
        scrollEnabled={false}
        renderItem={({ item, index }) => {
          //the algoritm to retrieve the image source to render the icon
          const area = item.AreaServicio;
          const indexareaList = areaLists.findIndex(
            (item) => item.value === area
          );
          const imageSource = areaLists[indexareaList]?.image;
          return (
            <TouchableOpacity onPress={() => goToApprove(item.IdAITService)}>
              <View />
              <View>
                <View style={styles.equipments2}>
                  <Icon
                    name="unarchive"
                    type="material"
                    color="skyblue"
                    size={40}
                    style={styles.icon}
                  />
                  <View>
                    <Text style={styles.info2}>{item.NombreServicio}</Text>

                    <Text style={styles.info2}>{item.solicitud}</Text>

                    <Text style={styles.info2}>{formatDate(item.date)}</Text>
                  </View>
                </View>
              </View>
              <Text> </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => `${index}-${item.date}`} // Provide a unique key for each item
      />
    </KeyboardAwareScrollView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    profile: reducers.profile.firebase_user_name,
    email: reducers.profile.email,
    approvalListNew: reducers.search.approvalListNew,
    ActualPostFirebase: reducers.post.ActualPostFirebase,
    approvalList: reducers.home.approvalList,
    totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST,
  };
};

const ApprovalScreen = connect(mapStateToProps, {
  update_firebaseProfile,
  update_approvalQuantity,
})(ApprovalScreenBare);

export default ApprovalScreen;
