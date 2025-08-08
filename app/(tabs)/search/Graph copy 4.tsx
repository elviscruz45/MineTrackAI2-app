import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Button,
} from "react-native";
import styles from "./Item.styles";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { screen } from "../../../utils";
import { connect } from "react-redux";
import { saveActualServiceAIT } from "../../../redux/actions/post";
import { EquipmentListUpper } from "../../../redux/actions/home";
import { areaLists } from "../../../utils/areaList";
import CircularProgress from "./Item.circularProgress";
import GanttHistorial from "./components/Gantt/Gantt";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import Toast from "react-native-toast-message";
import { rootReducers } from "@/redux/reducers";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import * as Progress from "react-native-progress";
import Svg, { Rect, Circle, Polygon } from "react-native-svg";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler";

function GraphnoRedux(props: any) {
  const [selectedGrid, setSelectedGrid] = useState<any[]>([]);
  const [polygons, setPolygons] = useState<any[]>([
    // Center (approximated as a small polygon)
    { id: 1, points: "150,150 160,140 170,150 160,160", fill: "lightgray" },
    // Spokes (approximated as thin polygons)
    { id: 2, points: "150,150 155,50 165,50 160,150", fill: "gray" },
    { id: 3, points: "150,150 250,100 255,110 160,150", fill: "gray" },
    { id: 4, points: "150,150 250,200 255,190 160,150", fill: "gray" },
    { id: 5, points: "150,150 160,250 150,255 140,160", fill: "gray" },
    { id: 6, points: "150,150 50,200 45,190 140,150", fill: "gray" },
    { id: 7, points: "150,150 50,100 45,110 140,150", fill: "gray" },
    { id: 8, points: "150,150 100,50 110,45 150,140", fill: "gray" },

    // Outer Circle (approximated as a series of polygons)
    {
      id: 9,
      points: "155,50 250,100 250,110 165,50",
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 10,
      points: "250,100 250,200 255,200 255,110",
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 11,
      points: "250,200 160,250 150,255 255,190",
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 12,
      points: "160,250 50,200 45,190 150,255",
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 13,
      points: "50,200 50,100 45,110 45,190",
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 14,
      points: "50,100 100,50 110,45 45,110",
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 15,
      points: "100,50 155,50 165,50 110,45",
      fill: "none",
      stroke: "black",
      strokeWidth: 1,
    },

    // Internal Segments (approximated as thin polygons)
    { id: 16, points: "160,140 170,150 200,120 190,110", fill: "lightgray" },
    { id: 17, points: "170,150 160,160 200,180 210,170", fill: "lightgray" },
    { id: 18, points: "160,160 150,160 180,200 170,210", fill: "lightgray" },
    { id: 19, points: "150,160 140,150 120,180 110,170", fill: "lightgray" },
    { id: 20, points: "140,150 150,140 120,120 130,110", fill: "lightgray" },
    { id: 21, points: "150,140 160,140 180,110 170,100", fill: "lightgray" },
  ]);
  // Create shared values for scale, position X and Y
  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Handle pinch gesture
  const onPinchGestureEvent = (event: PinchGestureHandlerGestureEvent) => {
    scale.value = event.nativeEvent.scale;
    focalX.value = event.nativeEvent.focalX;
    focalY.value = event.nativeEvent.focalY;
  };

  // Reset scale when gesture ends
  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === 4) {
      // State.ACTIVE
      scale.value = withSpring(1);
    }
  };

  // Create animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: focalX.value },
        { translateY: focalY.value },
        { scale: scale.value },
        { translateX: -focalX.value },
        { translateY: -focalY.value },
      ],
    };
  });

  const togglePolygon = (id: number) => {
    setPolygons((prev) =>
      prev.map((polygon) =>
        polygon.id === id
          ? {
              ...polygon,
              fill: polygon.fill === "lightgray" ? "blue" : "lightgray",
            }
          : polygon
      )
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PinchGestureHandler
        onGestureEvent={onPinchGestureEvent}
        onHandlerStateChange={onPinchHandlerStateChange}
      >
        <Animated.View style={[styles.container, animatedStyle]}>
          <Text>SVG with Zoom Functionality</Text>
          <Svg height="400" width="400" viewBox="0 0 400 400">
            {polygons.map((polygon) => (
              <Polygon
                key={polygon.id}
                points={polygon.points}
                fill={polygon.fill}
                stroke="black"
                strokeWidth="1"
                onPress={() => togglePolygon(polygon.id)}
              />
            ))}
          </Svg>
        </Animated.View>
      </PinchGestureHandler>
    </GestureHandlerRootView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    servicesData: reducers.home.servicesData,
    email: reducers.profile.email,
    // servicesData: reducers.home.servicesData,
    // totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST
  };
};

const Graph = connect(mapStateToProps, {
  saveActualServiceAIT,
  EquipmentListUpper,
})(GraphnoRedux);

export default Graph;
