import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import React, { useRef, useState } from "react";
import { useFormik } from "formik";
import {
  Camera,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import styles2 from "./Camera.styles";
import { Ionicons } from "@expo/vector-icons";
import { connect } from "react-redux";
import { savePhotoUri } from "../../../redux/actions/post";
import { screen } from "../../../utils";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";

function CameraScreen(props: any) {
  const router = useRouter();
  const [type, setType] = useState<CameraType>("back");
  const [capturedImage, setCapturedImage] = useState(null);

  // const [type, setType] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }
  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles2.container}>
        <Text style={{ textAlign: "center" }}>
          Necesitamos tu permiso para usar la camara
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function snapPhoto() {
    if (cameraRef.current) {
      const options = { quality: 1, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);

      const resizedPhoto = await ImageManipulator.manipulateAsync(
        data.uri,
        [{ resize: { width: 800 } }],
        {
          compress: 0.4,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      props.savePhotoUri(resizedPhoto.uri);
      router.push({
        pathname: "/post/Information",
        // params: { item: item },
      });
      // navigation.navigate(screen.post.form);
    }
  }

  function toggleCameraType() {
    // setType((current) =>
    //   // current === CameraType.back ? CameraType.front : CameraType.back
    //   current === "back" ? "front" : "back"
    // );

    setType((current) => {
      const newType = current === "back" ? "front" : "back";
      return newType;
    });
  }

  return (
    <View style={styles2.container}>
      {Platform.OS === "web" ? (
        <CameraView
          style={styles2.camera}
          type={type}
          ref={cameraRef}
          autofocus={true}
        >
          <View style={styles2.buttonContainer}>
            <TouchableOpacity style={styles2.button} onPress={toggleCameraType}>
              <Ionicons name="camera-reverse-sharp" size={35} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles2.cameraButton}
              onPress={() => snapPhoto()}
            >
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: 30,
                  borderColor: "white",
                  height: 50,
                  width: 50,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    borderWidth: 2,
                    borderRadius: 30,
                    borderColor: "white",
                    height: 40,
                    width: 40,
                    backgroundColor: "white",
                  }}
                ></View>
              </View>
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <CameraView style={styles2.camera} type={type} ref={cameraRef}>
          <View style={styles2.buttonContainer}>
            <TouchableOpacity style={styles2.button} onPress={toggleCameraType}>
              <Ionicons name="camera-reverse-sharp" size={35} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles2.cameraButton}
              onPress={() => snapPhoto()}
            >
              <View
                style={{
                  borderWidth: 2,
                  borderRadius: 30,
                  borderColor: "white",
                  height: 50,
                  width: 50,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    borderWidth: 2,
                    borderRadius: 30,
                    borderColor: "white",
                    height: 40,
                    width: 40,
                    backgroundColor: "white",
                  }}
                ></View>
              </View>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const mapStateToProps = (reducers: any) => {
  return reducers.post;
};

const ConnectedCameraScreen = connect(mapStateToProps, {
  savePhotoUri,
})(CameraScreen);

export default ConnectedCameraScreen;
