import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import styles from "./Gantt.styles";
import { screen } from "../../../../../utils";
import { SearchBar, Icon } from "@rneui/themed";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";

// Initial width setup with responsive approach
const windowWidth = Dimensions.get("window").width;

function getAbbreviatedMonthName(monthNumber: any) {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Oct",
    "Nov",
    "Dic",
  ];
  return months[monthNumber];
}

const GanttHistorial = (props: any) => {
  const { datas, comentPost } = props;
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Use window dimensions hook for responsive layout
  const { width } = useWindowDimensions();
  const [numColumns, setNumColumns] = useState(getColumnCount(width));
  
  // Function to determine number of columns based on screen width
  function getColumnCount(screenWidth: number) {
    if (screenWidth > 1200) return 3;      // Large screens like MacBook (3 columns)
    else if (screenWidth > 768) return 2;  // Medium screens like tablets (2 columns)
    else return 1;                         // Small screens like phones (1 column)
  }
  
  // Update column count when window size changes
  useEffect(() => {
    const updateLayout = () => {
      setNumColumns(getColumnCount(width));
    };
    updateLayout();
  }, [width]);

  // Animation effect
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Sort data by created timestamp (newest first)
  const dataSorted = datas?.sort((a: any, b: any) => {
    return b.createdAt - a.createdAt;
  });

  useEffect(() => {
    if (searchText === "") {
      setSearchResults(dataSorted);
    } else {
      const result = data?.filter((item: any) => {
        const re = new RegExp(searchText, "ig");
        return re.test(item.title);
      });

      setSearchResults(result);
    }
  }, [searchText]);

  useEffect(() => {
    if (!data && !searchResults) {
      setData(dataSorted);
      setSearchResults(dataSorted);
    }
  }, []);
  // Format the date for display
  const formatDate = (timestampData: any) => {
    const timestampInMilliseconds =
      timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000;
    const date = new Date(timestampInMilliseconds);

    // Create the formatted string "dd MMM" (e.g., "28 Ago")
    const day = date.getDate();
    const month = getAbbreviatedMonthName(date.getMonth());
    const year = date.getFullYear();
    return {
      formattedDate: `${day} ${month}`,
      fullDate: `${day} ${month} ${year}`,
    };
  };

  // Render progress bar
  const renderProgressBar = (progress: number) => {
    const percentage = Math.max(0, Math.min(100, progress));

    return (
      <View
        style={{
          marginTop: 8,
          marginBottom: 4,
          height: 6,
          width: "100%",
          backgroundColor: "#e0e0e0",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor:
              percentage > 75
                ? "#2ecc71"
                : percentage > 40
                ? "#f1c40f"
                : "#e74c3c",
            borderRadius: 3,
          }}
        />
      </View>
    );
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <FlatList
        data={searchResults}
        numColumns={numColumns}
        key={`flatlist-${numColumns}`} // Force re-render when columns change
        columnWrapperStyle={numColumns > 1 ? { flexWrap: 'wrap', justifyContent: 'space-between' } : undefined}
        ListHeaderComponent={
          <SearchBar
            placeholder="Buscar tipo de evento"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            lightTheme={true}
            containerStyle={styles.searchContainer}
            inputContainerStyle={styles.searchInputContainer}
            round={true}
            searchIcon={<Feather name="search" size={18} color="#95a5a6" />}
            clearIcon={<Feather name="x" size={18} color="#95a5a6" />}
          />
        }
        scrollEnabled={true}
        contentContainerStyle={[
          props.listViewContainerStyle,
          numColumns > 1 ? { paddingHorizontal: 12 } : {}
        ]}
        renderItem={({ item, index }) => {
          const { formattedDate, fullDate } = formatDate(item.createdAt);

          return (
            <View style={[
              styles.cardContainer,
              { 
                width: numColumns > 1 ? `${100/numColumns - 2}%` : '100%',
                margin: numColumns > 1 ? '1%' : undefined
              }
            ]}>
              {/* Antamina badge */}
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  backgroundColor: "#2e4d8c",
                  borderRadius: 15,
                  width: 30,
                  height: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
                >
                  FH
                </Text>
              </View>

              {/* Header with title and date in Antamina style */}
              <View
                style={{
                  backgroundColor: "#2e4d8c",
                  padding: 12,
                  paddingLeft: 48,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "700",
                    fontSize: 14,
                    marginBottom: 4,
                  }}
                >
                  PM Mantto faja Pebbles 3M - PM Chute (CVB025 - STP027 -
                  STP026P)
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {item.title}
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{ color: "#f8f9fa", fontSize: 14, marginRight: 5 }}
                    >
                      {formattedDate}
                    </Text>
                    <ImageExpo
                      source={require("../../../../../assets/assetpics/userIcon.png")}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "white",
                      }}
                      cachePolicy={"memory-disk"}
                    />
                  </View>
                </View>
              </View>

              {/* Card content - styled like Antamina */}
              <View
                style={{
                  padding: 16,
                  backgroundColor: "white",
                }}
              >
                <TouchableOpacity
                  onPress={() => comentPost(item)}
                  activeOpacity={0.7}
                >
                  {/* Description text - simplified like Antamina */}
                  <Text
                    style={{
                      fontSize: 15,
                      color: "#495057",
                      lineHeight: 22,
                      marginBottom: 8,
                    }}
                  >
                    {item.description}
                  </Text>

                  {/* Tareo details in a nice grid */}
                  {item.titulo === "Tareo" && (
                    <View style={styles.staffContainer}>
                      <Text style={styles.staffHeader}>
                        Detalles de Personal
                      </Text>
                      <View style={styles.staffRow}>
                        <View style={styles.staffItem}>
                          <Text style={styles.avanceNombre}>
                            <Ionicons name="people" size={14} color="#7f8c8d" />{" "}
                            Total: {item.totalHH}
                          </Text>
                        </View>
                        <View style={styles.staffItem}>
                          <Text style={styles.avanceNombre}>
                            <Ionicons
                              name="briefcase"
                              size={14}
                              color="#7f8c8d"
                            />{" "}
                            Supervisores: {item.supervisores}
                          </Text>
                        </View>
                        <View style={styles.staffItem}>
                          <Text style={styles.avanceNombre}>
                            <Ionicons name="shield" size={14} color="#7f8c8d" />{" "}
                            HSE: {item.HSE}
                          </Text>
                        </View>
                        <View style={styles.staffItem}>
                          <Text style={styles.avanceNombre}>
                            <Ionicons
                              name="construct"
                              size={14}
                              color="#7f8c8d"
                            />{" "}
                            Líder Técnico: {item.liderTecnico}
                          </Text>
                        </View>
                        <View style={styles.staffItem}>
                          <Text style={styles.avanceNombre}>
                            <Ionicons name="flash" size={14} color="#7f8c8d" />{" "}
                            Soldador: {item.soldador}
                          </Text>
                        </View>
                        <View style={styles.staffItem}>
                          <Text style={styles.avanceNombre}>
                            <Ionicons name="build" size={14} color="#7f8c8d" />{" "}
                            Técnico: {item.tecnico}
                          </Text>
                        </View>
                        <View style={styles.staffItem}>
                          <Text style={styles.avanceNombre}>
                            <Ionicons
                              name="hand-left"
                              size={14}
                              color="#7f8c8d"
                            />{" "}
                            Ayudante: {item.ayudante}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <View style={styles.separator} />

                  {/* Metadata section - Antamina style */}
                  <View
                    style={{
                      marginTop: 16,
                      marginBottom: 16,
                      backgroundColor: "#f8f9fa",
                      borderRadius: 6,
                      padding: 16,
                    }}
                  >
                    {/* Task metadata in Antamina UI style */}
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        marginBottom: 8,
                      }}
                    >
                      {/* Status */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 16,
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#6c757d",
                            marginRight: 8,
                          }}
                        >
                          Estado:
                        </Text>
                        <View
                          style={{
                            backgroundColor:
                              item.porcentajeAvance === 100
                                ? "#28a745"
                                : "#ffc107",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 4,
                          }}
                        >
                          <Text
                            style={{
                              color:
                                item.porcentajeAvance === 100
                                  ? "white"
                                  : "#212529",
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {item.porcentajeAvance === 100
                              ? "Completado"
                              : "En Progreso"}
                          </Text>
                        </View>
                      </View>

                      {/* Priority */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#6c757d",
                            marginRight: 8,
                          }}
                        >
                          Prioridad:
                        </Text>
                        <View
                          style={{
                            backgroundColor: "#e9ecef",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 4,
                          }}
                        >
                          <Text style={{ color: "#495057", fontSize: 12 }}>
                            {item.priority || "Normal"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View style={{ marginBottom: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: "#6c757d" }}>
                          Avance:
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color:
                              item.porcentajeAvance > 75
                                ? "#2ecc71"
                                : item.porcentajeAvance > 40
                                ? "#f1c40f"
                                : "#e74c3c",
                          }}
                        >
                          {item.porcentajeAvance}%
                        </Text>
                      </View>
                      {renderProgressBar(item.porcentajeAvance)}
                    </View>

                    {/* Assignment */}
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#6c757d",
                          marginRight: 8,
                        }}
                      >
                        Responsable:
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: "#dee2e6",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 8,
                          }}
                        >
                          <Text style={{ fontSize: 12, color: "#495057" }}>
                            {item.nombrePerfil
                              ? item.nombrePerfil.charAt(0).toUpperCase()
                              : "U"}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 13, color: "#495057" }}>
                          {item.nombrePerfil || "Sin asignar"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Stage information */}
                  <View style={styles.rowavanceNombre}>
                    <Text style={styles.avanceNombre}>
                      <MaterialIcons
                        name="category"
                        size={14}
                        color="#7f8c8d"
                      />{" "}
                      Etapa:
                    </Text>
                    <Text style={styles.detail}> {item.etapa}</Text>
                  </View>

                  {/* Footer and action buttons - Antamina style */}
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: "#e9ecef",
                      marginTop: 16,
                      paddingTop: 16,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {/* Date and author section */}
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <Feather
                          name="calendar"
                          size={14}
                          color="#6c757d"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={{ fontSize: 13, color: "#6c757d" }}>
                          {item.fechaPostFormato || fullDate}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Feather
                          name="user"
                          size={14}
                          color="#6c757d"
                          style={{ marginRight: 6 }}
                        />
                        <Text style={{ fontSize: 13, color: "#6c757d" }}>
                          {item.nombrePerfil}
                        </Text>
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View style={{ flexDirection: "row" }}>
                      {/* Comments button */}
                      {/* <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#007bff",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 4,
                          marginRight: 8,
                        }}
                        onPress={() => navigate.navigate("comment", { item })}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={16}
                          color="white"
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={{
                            color: "white",
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          {item?.comments?.length || 0} Comentarios
                        </Text>
                      </TouchableOpacity> */}

                      {/* Edit button */}
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#6c757d",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 4,
                        }}
                        onPress={() => {
                          comentPost(item);
                        }}
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color="white"
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={{
                            color: "white",
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          Editar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Attachment indicator - better styled */}
                  {item?.pdfFile && (
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "#e9ecef",
                        padding: 10,
                        borderRadius: 4,
                        marginTop: 12,
                      }}
                    >
                      <Feather
                        name="paperclip"
                        size={16}
                        color="#3498db"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{ color: "#3498db", fontSize: 13 }}>
                        Ver documento adjunto
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => `${index}-${item.createdAt}`}
      />
    </Animated.View>
  );
};

export default GanttHistorial;
