// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Button,
// } from "react-native";
// import styles from "./Item.styles";
// import { collection, onSnapshot, query, where } from "firebase/firestore";
// import { db } from "@/firebaseConfig";
// import { screen } from "../../../utils";
// import { connect } from "react-redux";
// import { saveActualServiceAIT } from "../../../redux/actions/post";
// import { EquipmentListUpper } from "../../../redux/actions/home";
// import { areaLists } from "../../../utils/areaList";
// import CircularProgress from "./Item.circularProgress";
// import GanttHistorial from "./components/Gantt/Gantt";
// import { LoadingSpinner } from "../../../components/LoadingSpinner";
// import Toast from "react-native-toast-message";
// import { rootReducers } from "@/redux/reducers";
// import { useLocalSearchParams } from "expo-router";
// import { useRouter } from "expo-router";
// import * as Progress from "react-native-progress";
// import Svg, { Rect, Circle, Polygon, G } from "react-native-svg";

// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
//   withTiming,
//   runOnJS,
// } from "react-native-reanimated";

// import {
//   GestureHandlerRootView,
//   PinchGestureHandler,
//   PanGestureHandler,
//   Gesture,
//   GestureDetector,
//   PinchGestureHandlerGestureEvent,
//   PanGestureHandlerGestureEvent,
//   GestureStateManager,
// } from "react-native-gesture-handler";

// function GraphnoRedux(props: any) {
//   const [selectedGrid, setSelectedGrid] = useState<any[]>([]);
//   const [polygons, setPolygons] = useState<any[]>([
//     // Center (approximated as a small polygon)
//     { id: 1, points: "150,150 160,140 170,150 160,160", fill: "lightgray" },
//     // Spokes (approximated as thin polygons)
//     { id: 2, points: "150,150 155,50 165,50 160,150", fill: "gray" },
//     { id: 3, points: "150,150 250,100 255,110 160,150", fill: "gray" },
//     { id: 4, points: "150,150 250,200 255,190 160,150", fill: "gray" },
//     { id: 5, points: "150,150 160,250 150,255 140,160", fill: "gray" },
//     { id: 6, points: "150,150 50,200 45,190 140,150", fill: "gray" },
//     { id: 7, points: "150,150 50,100 45,110 140,150", fill: "gray" },
//     { id: 8, points: "150,150 100,50 110,45 150,140", fill: "gray" },

//     // Outer Circle (approximated as a series of polygons)
//     {
//       id: 9,
//       points: "155,50 250,100 250,110 165,50",
//       fill: "none",
//       stroke: "black",
//       strokeWidth: 1,
//     },
//     {
//       id: 10,
//       points: "250,100 250,200 255,200 255,110",
//       fill: "none",
//       stroke: "black",
//       strokeWidth: 1,
//     },
//     {
//       id: 11,
//       points: "250,200 160,250 150,255 255,190",
//       fill: "none",
//       stroke: "black",
//       strokeWidth: 1,
//     },
//     {
//       id: 12,
//       points: "160,250 50,200 45,190 150,255",
//       fill: "none",
//       stroke: "black",
//       strokeWidth: 1,
//     },
//     {
//       id: 13,
//       points: "50,200 50,100 45,110 45,190",
//       fill: "none",
//       stroke: "black",
//       strokeWidth: 1,
//     },
//     {
//       id: 14,
//       points: "50,100 100,50 110,45 45,110",
//       fill: "none",
//       stroke: "black",
//       strokeWidth: 1,
//     },
//     {
//       id: 15,
//       points: "100,50 155,50 165,50 110,45",
//       fill: "none",
//       stroke: "black",
//       strokeWidth: 1,
//     },

//     // Internal Segments (approximated as thin polygons)
//     { id: 16, points: "160,140 170,150 200,120 190,110", fill: "lightgray" },
//     { id: 17, points: "170,150 160,160 200,180 210,170", fill: "lightgray" },
//     { id: 18, points: "160,160 150,160 180,200 170,210", fill: "lightgray" },
//     { id: 19, points: "150,160 140,150 120,180 110,170", fill: "lightgray" },
//     { id: 20, points: "140,150 150,140 120,120 130,110", fill: "lightgray" },
//     { id: 21, points: "150,140 160,140 180,110 170,100", fill: "lightgray" },
//   ]);

//   // Maximum allowed panning distance
//   const MAX_PAN_DISTANCE = 1000;

//   // Create shared values for scale and translation
//   const scale = useSharedValue(1);
//   const translateX = useSharedValue(0);
//   const translateY = useSharedValue(0);
//   const lastScale = useSharedValue(1);
//   const lastTranslateX = useSharedValue(0);
//   const lastTranslateY = useSharedValue(0);

//   // Create a shared value to track if we're currently panning/zooming
//   const isTransforming = useSharedValue(false);

//   // Function to check if a point is inside a polygon
//   const isPointInPolygon = (point, polygonPoints) => {
//     // Parse polygon points from string format "x1,y1 x2,y2 x3,y3 ..."
//     const vertices = polygonPoints.split(" ").map((coord) => {
//       const [x, y] = coord.split(",").map(Number);
//       return { x, y };
//     });

//     // Ray casting algorithm for point-in-polygon detection
//     let inside = false;
//     for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
//       const xi = vertices[i].x,
//         yi = vertices[i].y;
//       const xj = vertices[j].x,
//         yj = vertices[j].y;

//       const intersect =
//         yi > point.y !== yj > point.y &&
//         point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
//       if (intersect) inside = !inside;
//     }

//     return inside;
//   };

//   // Function to find polygon at a tap point
//   const findPolygonAtPoint = (x, y) => {
//     // Apply inverse transformation to get the coordinates in SVG space
//     const svgX = (x - translateX.value) / scale.value;
//     const svgY = (y - translateY.value) / scale.value;

//     // Check each polygon
//     for (let i = polygons.length - 1; i >= 0; i--) {
//       const polygon = polygons[i];
//       if (
//         polygon.fill !== "none" &&
//         isPointInPolygon({ x: svgX, y: svgY }, polygon.points)
//       ) {
//         return polygon.id;
//       }
//     }
//     return null;
//   };

//   // Create gesture handlers using the newer Gesture API
//   const panGesture = Gesture.Pan()
//     .onStart(() => {
//       lastTranslateX.value = translateX.value;
//       lastTranslateY.value = translateY.value;
//       isTransforming.value = true;
//     })
//     .onUpdate((event) => {
//       // Apply translation based on current scale factor
//       translateX.value = lastTranslateX.value + event.translationX;
//       translateY.value = lastTranslateY.value + event.translationY;
//     })
//     .onEnd(() => {
//       lastTranslateX.value = translateX.value;
//       lastTranslateY.value = translateY.value;
//       // Small delay before allowing taps again
//       setTimeout(() => {
//         isTransforming.value = false;
//       }, 100);
//     });

//   const pinchGesture = Gesture.Pinch()
//     .onStart(() => {
//       lastScale.value = scale.value;
//       isTransforming.value = true;
//     })
//     .onUpdate((event) => {
//       // Update scale while preserving the focal point
//       scale.value = lastScale.value * event.scale;
//     })
//     .onEnd(() => {
//       // Don't reset scale on end - keep the zoom level
//       lastScale.value = scale.value;
//       // Small delay before allowing taps again
//       setTimeout(() => {
//         isTransforming.value = false;
//       }, 100);
//     });

//   // Add a tap gesture to handle polygon selection
//   const tapGesture = Gesture.Tap().onStart((event) => {
//     if (!isTransforming.value) {
//       const polygonId = findPolygonAtPoint(event.x, event.y);
//       if (polygonId !== null) {
//         runOnJS(togglePolygon)(polygonId);
//       }
//     }
//   });

//   // Combine pan, pinch, and tap gestures
//   const combinedGestures = Gesture.Exclusive(
//     Gesture.Simultaneous(pinchGesture, panGesture),
//     tapGesture
//   );

//   // Create animated style for transformations
//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [
//         { translateX: translateX.value },
//         { translateY: translateY.value },
//         { scale: scale.value },
//       ],
//     };
//   });

//   // Function to toggle polygon fill color
//   const togglePolygon = (id: number) => {
//     setPolygons((prev) =>
//       prev.map((polygon) =>
//         polygon.id === id
//           ? {
//               ...polygon,
//               fill: polygon.fill === "lightgray" ? "blue" : "lightgray",
//             }
//           : polygon
//       )
//     );
//   };

//   // Reset function for UI controls
//   const resetTransform = () => {
//     scale.value = withTiming(1);
//     translateX.value = withTiming(0);
//     translateY.value = withTiming(0);
//     lastScale.value = 1;
//     lastTranslateX.value = 0;
//     lastTranslateY.value = 0;
//   };

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       {/* <View style={{ padding: 8 }}>
//         <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>
//           SVG with Zoom and Pan
//         </Text>
//         <Button title="Reset View" onPress={resetTransform} />
//       </View> */}

//       <GestureDetector gesture={combinedGestures}>
//         <Animated.View style={[styles.container, animatedStyle]}>
//           <Svg height="400" width="400" viewBox="0 0 400 400">
//             <G>
//               {polygons.map((polygon) => (
//                 <Polygon
//                   key={polygon.id}
//                   points={polygon.points}
//                   fill={polygon.fill}
//                   stroke="black"
//                   strokeWidth="1"
//                 />
//               ))}
//             </G>
//           </Svg>
//         </Animated.View>
//       </GestureDetector>
//     </GestureHandlerRootView>
//   );
// }

// const mapStateToProps = (reducers: any) => {
//   return {
//     servicesData: reducers.home.servicesData,
//     email: reducers.profile.email,
//     // servicesData: reducers.home.servicesData,
//     // totalEventServiceAITLIST: reducers.home.totalEventServiceAITLIST
//   };
// };

// const Graph = connect(mapStateToProps, {
//   saveActualServiceAIT,
//   EquipmentListUpper,
// })(GraphnoRedux);

// export default Graph;
