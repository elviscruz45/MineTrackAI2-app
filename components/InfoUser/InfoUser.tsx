import React, { useState } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Avatar, Text, Icon } from "@rneui/themed";
import * as ImagePicker from "expo-image-picker";
import { getAuth, updateProfile } from "firebase/auth";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import styles from "./InfoUser.styles";
import { Modal } from "../Modal/Modal";
import { connect } from "react-redux";
import {
  update_firebasePhoto,
  update_firebaseEmail,
  update_firebaseProfile,
  update_firebaseUid,
} from "@/redux/actions/profile";
import ChangeManPower from "@/app/(tabs)/profile/components/ManPowerForm/ChangeManPower";
import { userTypeList } from "@/utils/userTypeList";
import { useRouter } from "expo-router";

interface InfoUserProps {
  imageUrl: string;
}

function InfoUser(props: any) {
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const router = useRouter();

  const changeAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 4],
    });

    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: any) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const storage = getStorage();
    const storageRef = ref(storage, `avatar/${props.uid}`);

    uploadBytesResumable(storageRef, blob).then((snapshot) => {
      updatePhotoUrl(snapshot.metadata.fullPath);
    });
  };

  const updatePhotoUrl = async (imagePath: any) => {
    const storage = getStorage();
    const imageRef = ref(storage, imagePath);

    const imageUrl = await getDownloadURL(imageRef);

    const auth: any = getAuth();
    updateProfile(auth?.currentUser, { photoURL: imageUrl });

    props.update_firebasePhoto(imageUrl);
  };

  const goToApprovalScreen = () => {
    // navigation.navigate(screen.profile.tab, {
    //   screen: screen.profile.approvals,
    // });
    router.push({
      pathname: "/profile/Approval",
    });
  };

  const updateManpower = () => {
    setRenderComponent(<ChangeManPower onClose={onCloseOpenModal} />);
    setShowModal(true);
  };
  const onCloseOpenModal = () => setShowModal((prevState) => !prevState);

  let approvalListPending = props.approvalListNew?.filter((item: any) => {
    return !(
      item.ApprovalPerformed?.includes(props.email) ||
      item.RejectionPerformed?.includes(props.email)
    );
  });

  return (
    <View
      style={{
        flex: 1,
        alignContent: "center",
        alignSelf: "center",
        alignItems: "center",
      }}
    >
      <Text> </Text>
      <Avatar
        size="large"
        rounded
        containerStyle={styles.avatar}
        source={
          props.user_photo
            ? { uri: props.user_photo }
            : require("../../assets/pictures/splash.png")
        }
      >
        <Avatar.Accessory
          testID="avatar-accessory"
          size={24}
          onPress={() => changeAvatar()}
        />
      </Avatar>
      <View style={styles.content}>
        <View>
          {props.profile?.displayNameform && (
            <Text style={styles.displayName}>
              {props.profile.displayNameform}
            </Text>
          )}

          <Text>{props.email}</Text>

          {props.profile?.cargo && <Text>{props.profile.cargo}</Text>}
          {props.profile?.descripcion && (
            <Text>{props.profile.descripcion}</Text>
          )}
        </View>
        <Text> </Text>
        <Text> </Text>
        <Text> </Text>

        {(props.profile?.userType === userTypeList.managerContratista ||
          props.profile?.userType === userTypeList.plannerContratista ||
          props.profile?.userType === "SuperUsuario") && (
          <TouchableOpacity
            // style={styles.btnContainer4}
            onPress={() => updateManpower()}
          >
            <Image
              source={require("../../assets/pictures/manpower2.png")}
              style={styles.roundImageUpload2}
            />
          </TouchableOpacity>
        )}

        <Text> </Text>
        <TouchableOpacity
          // style={styles.btnContainer4}
          onPress={() => goToApprovalScreen()}
        >
          <Image
            testID="change-manpower-component"
            source={require("../../assets/pictures/bell1.png")}
            style={styles.roundImageUpload}
          />
        </TouchableOpacity>

        {approvalListPending && (
          <Text style={styles.bellNomber}>{approvalListPending.length}</Text>
        )}
      </View>
      <Text> </Text>
      {/* <Text> </Text>
      <Text> </Text> */}

      <Modal testID="modal" show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>
    </View>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    profile: reducers.profile.profile,
    user_photo: reducers.profile.user_photo,
    email: reducers.profile.email,
    uid: reducers.profile.uid,
    approvalListNew: reducers.search.approvalListNew,
  };
};

const ConnectedInfoUser = connect(mapStateToProps, {
  update_firebasePhoto,
  update_firebaseEmail,
  update_firebaseProfile,
  update_firebaseUid,
})(InfoUser);

export default ConnectedInfoUser;
