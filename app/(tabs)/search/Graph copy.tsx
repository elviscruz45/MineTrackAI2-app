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
  const [shapes, setShapes] = useState<any[]>([]);
  const [selectedShape, setSelectedShape] = useState<string>("rect");
  const [selectedGrid, setSelectedGrid] = useState<any[]>([]);

  const addShape = () => {
    const newShape = {
      type: selectedShape,
      id: shapes.length,
      x: 50,
      y: 50,
      size: 50,
      fill: "gray",
    };
    setShapes([...shapes, newShape]);
  };

  const toggleShape = (id: any) => {
    setShapes((prev: any) =>
      prev.map((shape: any) =>
        shape.id === id
          ? { ...shape, fill: shape.fill === "gray" ? "red" : "gray" }
          : shape
      )
    );
  };

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
      >
        <Button
          title="Add Rectangle"
          onPress={() => setSelectedShape("rect")}
        />
        <Button title="Add Circle" onPress={() => setSelectedShape("circle")} />
        <Button
          title="Add Polygon"
          onPress={() => setSelectedShape("polygon")}
        />
        <Button title="Create Shape" onPress={addShape} />
      </View>
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
                width={50}
                height={50}
                fill={selectedGrid.includes(key) ? "blue" : "lightgray"}
                stroke="black"
                strokeWidth="1"
                onPress={() => toggleGrid(rowIndex, colIndex)}
              />
            );
          })
        )}
        {shapes.map((shape: any) => {
          switch (shape.type) {
            case "rect":
              return (
                <Rect
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.size}
                  height={shape.size}
                  fill={shape.fill}
                  stroke="black"
                  strokeWidth="2"
                  onPress={() => toggleShape(shape.id)}
                />
              );
            case "circle":
              return (
                <Circle
                  key={shape.id}
                  cx={shape.x + shape.size / 2}
                  cy={shape.y + shape.size / 2}
                  r={shape.size / 2}
                  fill={shape.fill}
                  stroke="black"
                  strokeWidth="2"
                  onPress={() => toggleShape(shape.id)}
                />
              );
            case "polygon":
              return (
                <Polygon
                  key={shape.id}
                  points={`${shape.x},${shape.y} ${shape.x + shape.size},${
                    shape.y
                  } ${shape.x + shape.size / 2},${shape.y - shape.size}`}
                  fill={shape.fill}
                  stroke="black"
                  strokeWidth="2"
                  onPress={() => toggleShape(shape.id)}
                />
              );
            default:
              return null;
          }
        })}
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
