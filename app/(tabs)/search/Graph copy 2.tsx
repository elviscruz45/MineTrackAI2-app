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

function GraphnoRedux(props: any) {
  const [selectedGrid, setSelectedGrid] = useState<any[]>([]);

  const toggleGrid = (rowIndex: number, colIndex: number) => {
    const key = `${rowIndex}-${colIndex}`;
    setSelectedGrid((prev: any) =>
      prev.includes(key)
        ? prev.filter((item: any) => item !== key)
        : [...prev, key]
    );
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 10,
        }}
      ></View>
      <Svg height="400" width="400" viewBox="0 0 400 400">
        {/* Grid of squares (6x5) */}
        {[...Array(6)].map((_, rowIndex) =>
          [...Array(5)].map((_, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            return (
              <Rect
                key={key}
                x={colIndex * 60}
                y={rowIndex * 60}
                width={70}
                height={70}
                fill={selectedGrid.includes(key) ? "blue" : "lightgray"}
                stroke="black"
                strokeWidth="1"
                onPress={() => toggleGrid(rowIndex, colIndex)}
              />
            );
          })
        )}
      </Svg>
    </View>
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
