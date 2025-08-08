import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Button,
  Platform,
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
import Svg, { Rect, Polygon } from "react-native-svg";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
  Gesture,
  GestureDetector,
  PinchGestureHandlerGestureEvent,
  PanGestureHandlerGestureEvent,
  GestureStateManager,
} from "react-native-gesture-handler";

function GraphnoRedux(props: any) {
  const [selectedGrid, setSelectedGrid] = useState<any[]>([]);

  const [polygons, setPolygons] = useState<any[]>([
    {
      id: 4,
      points: "163.147,44.8402 180.465,11.6339 224.735,41.5848 191.996,64.8275",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 5,
      points: "130.33,37.6164 132.969,2.59789 176.308,10.9786 161.58,43.6735",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 6,
      points: "94.3246,44.5963 83.6876,11.1675 129.034,2.60973 127.04,38.4362",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 7,
      points: "64.6909,65.4614 41.9403,38.7586 80.4362,13.3107 92.4696,47.1146",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 8,
      points: "45.3003,94.4155 12.9046,80.9562 35.646,40.802 61.718,65.4547",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 9,
      points: "41.0389,126.534 4.31722,129.363 10.1869,83.641 43.6583,96.6154",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 10,
      points: "51.9685,155.865 20.789,175.469 4.69149,132.274 40.354,128.169",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 11,
      points: "74.3855,181.14 53.7946,211.677 21.6068,178.679 52.5644,160.505",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 12,
      points: "107.632,195.335 100.003,231.367 57.7855,212.855 79.6631,184.394",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 13,
      points: "144.194,195.637 151.735,231.687 105.638,231.762 114.188,196.897",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 14,
      points: "176.524,183.979 198.854,213.263 155.892,230.8 150.057,195.306",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 15,
      points: "202.352,161.248 234.347,179.482 201.649,212.408 182.412,182.013",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 16,
      points: "216.376,130.373 253.03,133.926 236.659,177.346 206.674,157.477",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 17,
      points: "213.765,95.9867 250.558,87.1208 254.44,126.905 213.276,120.393",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 18,
      points: "192.17,65.6425 226.04,42.0404 252.698,83.6754 209.24,93.9297",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 19,
      points: "208.047,93.8918 252.566,84.1073 257.93,130.917 211.454,124.557",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 20,
      points: "192.17,65.6425 226.04,42.0404 252.698,83.6754 209.24,93.9297",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 21,
      points: "152.759,99.8797 190.824,67.0184 206.917,94.333 158.372,109.161",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 22,
      points: "160.362,120.534 210.814,124.942 199.243,157.726 157.585,129.79",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 23,
      points: "157.037,132.124 196.244,158.099 177.569,179.169 151.154,137.101",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 24,
      points: "147.616,140.614 174.756,179.31 148.159,192.49 138.571,144.307",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 25,
      points: "135.542,145.99 142.655,192.717 112.972,192.702 125.798,145.278",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 26,
      points: "120.149,144.659 109.951,190.811 82.2662,180.105 111.315,140.485",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 27,
      points: "110.396,137.985 81.1384,175.107 60.8668,153.424 104.257,130.384",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 28,
      points: "100.634,131.277 58.8627,153.394 49.0928,125.364 98.0945,121.842",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 29,
      points: "96.7718,119.183 49.6832,123.269 51.6117,93.6484 98.1104,109.505",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 30,
      points: "99.592,109.688 55.7265,92.0854 70.8136,66.5222 105.154,101.655",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 31,
      points: "106.937,99.0421 73.7647,65.3723 97.8127,47.9713 115.246,93.9023",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 32,
      points: "115.799,92.013 100.66,47.2377 129.893,42.0845 125.519,91.0175",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 33,
      points: "128.628,88.6745 133.168,41.6275 161.945,48.9066 137.902,91.7495",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 34,
      points: "142.475,91.9484 163.756,49.7449 187.939,66.9583 150.004,98.1753",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
    {
      id: 35,
      points: "159.543,109.876 207.065,96.146 209.94,123.461 159.543,120.033",
      fill: "lightgray",
      stroke: "black",
      strokeWidth: 1,
    },
  ]);

  // Maximum allowed panning distance
  const MAX_PAN_DISTANCE = 1000;

  // Create shared values for scale and translation
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const lastScale = useSharedValue(1);
  const lastTranslateX = useSharedValue(0);
  const lastTranslateY = useSharedValue(0);

  // Create gesture handlers using the newer Gesture API
  const panGesture = Gesture.Pan()
    .onStart(() => {
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Apply translation based on current scale factor
      translateX.value = lastTranslateX.value + event.translationX;
      translateY.value = lastTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      lastTranslateX.value = translateX.value;
      lastTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      lastScale.value = scale.value;
    })
    .onUpdate((event) => {
      // Update scale while preserving the focal point
      scale.value = lastScale.value * event.scale;
    })
    .onEnd(() => {
      // Don't reset scale on end - keep the zoom level
      lastScale.value = scale.value;
    });

  // Combine pan and pinch gestures
  const combinedGestures = Gesture.Simultaneous(pinchGesture, panGesture);

  // Create animated style for transformations
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Function to toggle polygon fill color
  const togglePolygon = (id: number) => {
    setPolygons((prev) =>
      prev.map((polygon) =>
        polygon.id === id
          ? {
              ...polygon,
              fill:
                polygon.fill === "lightgray"
                  ? "blue"
                  : polygon.fill === "blue"
                  ? "green"
                  : "lightgray",
            }
          : polygon
      )
    );
  };

  // Reset function for UI controls
  const resetTransform = () => {
    scale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    lastScale.value = 1;
    lastTranslateX.value = 0;
    lastTranslateY.value = 0;
  };
  // const toggleGrid = (rowIndex: number, colIndex: number) => {
  //   const key = `${rowIndex}-${colIndex}`;
  //   setSelectedGrid((prev: any) =>
  //     prev.includes(key)
  //       ? prev.filter((item: any) => item !== key)
  //       : [...prev, key]
  //   );
  // };

  const toggleGrid = (rowIndex: number, colIndex: number) => {
    const key = `${rowIndex}-${colIndex}`;
    setSelectedGrid((prev: any) => {
      const existingItem = prev.find((item: any) => item.key === key);
      if (existingItem) {
        return prev.map((item: any) =>
          item.key === key
            ? {
                ...item,
                fill:
                  item.fill === "lightgray"
                    ? "blue"
                    : item.fill === "blue"
                    ? "green"
                    : "lightgray",
              }
            : item
        );
      } else {
        return [...prev, { key, fill: "blue" }];
      }
    });
  };

  // Inside your component:
  const getPolygonProps = (id: any) => {
    const commonProps = {
      key: id,
      fill: polygons.find((p) => p.id === id)?.fill || "lightgray",
      stroke: "black",
      strokeWidth: "1",
      pointerEvents: "auto",
    };

    // Add platform-specific handlers
    if (Platform.OS === "web") {
      return {
        ...commonProps,
        onClick: () => togglePolygon(id),
        style: { cursor: "pointer" },
      };
    } else {
      return {
        ...commonProps,
        onPressIn: () => togglePolygon(id),
      };
    }
  };

  const getRectProps = (rowIndex: any, colIndex: any) => {
    const key = `${rowIndex}-${colIndex}`;
    const commonProps = {
      key,
      x: colIndex * 120,
      y: rowIndex * 80,
      width: 110,
      height: 70,
      fill: selectedGrid.find((item) => item.key === key)?.fill || "lightgray",
      stroke: "black",
      strokeWidth: "3",
    };

    if (Platform.OS === "web") {
      return {
        ...commonProps,
        onClick: () => toggleGrid(rowIndex, colIndex),
        style: { cursor: "pointer" },
      };
    } else {
      return {
        ...commonProps,
        onPressIn: () => toggleGrid(rowIndex, colIndex),
      };
    }
  };
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "white" }}>
      {/* <View style={{ padding: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
          SVG with Zoom and Pan
        </Text>
        // <Button title="Reset View" onPress={resetTransform} />
      </View> */}
      {/* <Button title="Reestablecer Vista" onPress={resetTransform} /> */}
      <View style={{ zIndex: 10, backgroundColor: "white" }}>
        <Text style={{}}> </Text>
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Cambio de Liners
        </Text>
        <Text style={{}}> </Text>
        <View
          style={{
            marginLeft: 10,
            flexDirection: "row",
            // flex: 1,
            // justifyContent: "space-around",
            marginBottom: 5,
          }}
        >
          <Text
            style={{
              backgroundColor: "lightgray",
              borderRadius: 10,
              width: 20,
            }}
          >
            {" "}
          </Text>
          <Text
            style={{
              borderRadius: 10,
              width: 100,
            }}
          >
            {" "}
            No Cambiado
          </Text>
        </View>
        <View
          style={{
            marginLeft: 10,
            flexDirection: "row",
            marginBottom: 5,

            // flex: 1,
            // justifyContent: "space-around",
            // marginBottom: 10,
          }}
        >
          <Text
            style={{
              backgroundColor: "blue",
              borderRadius: 10,
              width: 20,
            }}
          >
            {" "}
          </Text>
          <Text
            style={{
              borderRadius: 10,
              width: 120,
            }}
          >
            {" "}
            Removido
          </Text>
        </View>
        <View
          style={{
            marginLeft: 10,
            flexDirection: "row",
            // flex: 1,
            // justifyContent: "space-around",
            // marginBottom: 10,
          }}
        >
          <Text
            style={{
              backgroundColor: "green",
              borderRadius: 10,
              width: 20,
            }}
          >
            {" "}
          </Text>
          <Text
            style={{
              borderRadius: 10,
              width: 120,
            }}
          >
            {" "}
            Cambiado
          </Text>
        </View>
      </View>
      <Text> </Text>
      <GestureDetector gesture={combinedGestures}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <View style={{ flexDirection: "column", alignItems: "center" }}>
              <Svg height="800" width="800" viewBox="-120 0 500 500">
                {polygons.map((polygon: any) => (
                  <Polygon
                    points={polygon.points}
                    // {...getPolygonProps(polygon.id)}
                    key={polygon.id}
                    fill={polygon.fill}
                    stroke="black"
                    strokeWidth="1"
                    {...(Platform.OS === "web"
                      ? {
                          onPress: () => togglePolygon(polygon.id),
                          style: { cursor: "pointer" },
                        }
                      : { onPressIn: () => togglePolygon(polygon.id) })}
                    pointerEvents="auto"
                  />
                ))}
              </Svg>
            </View>
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                marginTop: -350,
              }}
            >
              <Svg height="600" width="500" viewBox="0 0 500 900">
                {[...Array(6)].map((_, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    <Text style={{ marginBottom: -312, marginLeft: 10 }}>
                      Fila {rowIndex + 1}
                    </Text>
                    {[...Array(5)].map((_, colIndex) => {
                      const key = `${rowIndex}-${colIndex}`;
                      const gridItem = selectedGrid.find(
                        (item) => item.key === key
                      );

                      return (
                        <Rect
                          key={key}
                          x={colIndex * 120}
                          y={rowIndex * 80}
                          width={110}
                          height={70}
                          fill={gridItem ? gridItem.fill : "lightgray"}
                          stroke="black"
                          strokeWidth="3"
                          onPressIn={() => toggleGrid(rowIndex, colIndex)}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </Svg>
            </View>
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                marginTop: -200,
              }}
            >
              <Svg height="800" width="800" viewBox="-120 0 500 500">
                {polygons.map((polygon) => (
                  <Polygon
                    points={polygon.points}
                    key={polygon.id}
                    fill={polygon.fill}
                    stroke="black"
                    strokeWidth="1"
                    {...(Platform.OS === "web"
                      ? {
                          onPress: () => togglePolygon(polygon.id),
                          style: { cursor: "pointer" },
                        }
                      : { onPressIn: () => togglePolygon(polygon.id) })}
                    pointerEvents="auto"
                  />
                ))}
              </Svg>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
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
