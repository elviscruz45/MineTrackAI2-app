import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Image as ImageExpo } from "expo-image";
import styles from "./Gantt.styles";
import { screen } from "../../../../../utils";
import { SearchBar, Icon } from "@rneui/themed";

const windowWidth = Dimensions.get("window").width;
const numColumns = windowWidth > 1000 ? 3 : 1;
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
  // const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  // const { datas } = props;

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
  return (
    <FlatList
      // data={dataSorted}
      data={searchResults}
      numColumns={numColumns}
      ListHeaderComponent={
        <SearchBar
          placeholder="Buscar tipo de evento"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
          lightTheme={true}
          inputContainerStyle={{ backgroundColor: "white" }}
        />
      }
      scrollEnabled={true}
      contentContainerStyle={props.listViewContainerStyle}
      renderItem={({ item, index }) => {
        const timestampData = item.createdAt;
        const timestampInMilliseconds =
          timestampData.seconds * 1000 + timestampData.nanoseconds / 1000000;
        const date = new Date(timestampInMilliseconds); // Function to get the abbreviated month name

        // Create the formatted string "dd MMM" (e.g., "28 Ago")
        const day = date.getDate();
        const month = getAbbreviatedMonthName(date.getMonth());
        const formattedDate = `${day} ${month}`;

        //get the company name from the userEmail
        const regex = /@(.+?)\./i;
        // const matches = item?.emailPerfil.match(regex);

        return (
          <View
            style={{
              // marginLeft: 15,
              borderColor: "gray",
              // paddingVertical: 10,
              borderWidth: 1,
              borderRadius: 20,
              marginBottom: 2,
              marginTop: 5,
              marginHorizontal: windowWidth > 1000 ? 53 : 2,
            }}
          >
            <Text> </Text>
            <Text> </Text>

            <View style={[styles.rowContainer]}>
              <View style={styles.timeWrapper}>
                <View style={[styles.timeContainer, styles.timeContainerStyle]}>
                  <Text
                    style={[
                      styles.time,
                      styles.timeStyle,
                      { textAlign: "center", marginTop: 15, marginLeft: 1 },
                    ]}
                    allowFontScaling={true}
                  >
                    {formattedDate}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.circle]}>
              <ImageExpo
                // source={require("../../../../assets/smcv2.jpeg")}
                // source={require("../../../../../assets/assetpics/userIcon.png")}
                source={item.icon}
                style={{ width: 20, height: 20 }}
                cachePolicy={"memory-disk"}
              />
            </View>
            <View style={styles.details}>
              <TouchableOpacity onPress={() => comentPost(item)}>
                <Text style={styles.titledetails}>{item.title}</Text>

                <View style={styles.row}>
                  <ImageExpo
                    // source={{ uri: item.imageUrl }}
                    source={require("../../../../../assets/assetpics/userIcon.png")}
                    cachePolicy={"memory-disk"}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginLeft: 5,
                    }}
                  />
                  <View>
                    <Text style={styles.textdetail}>{item.description}</Text>
                    <Text> </Text>
                    {item.titulo === "Tareo" && (
                      <>
                        <Text style={styles.avanceNombre}>
                          {" "}
                          Total personal: {item.totalHH}{" "}
                        </Text>
                        <Text> </Text>
                        <Text style={styles.avanceNombre}>
                          {" "}
                          Cantidad supervisores : {item.supervisores}{" "}
                        </Text>
                        <Text style={styles.avanceNombre}>
                          {" "}
                          Cantidad HSE : {item.HSE}{" "}
                        </Text>
                        <Text style={styles.avanceNombre}>
                          {" "}
                          Cantidad Lider Tecnico : {item.liderTecnico}{" "}
                        </Text>
                        <Text style={styles.avanceNombre}>
                          {" "}
                          Cantidad Soldador : {item.soldador}{" "}
                        </Text>
                        <Text style={styles.avanceNombre}>
                          {" "}
                          Cantidad Tecnico : {item.tecnico}{" "}
                        </Text>
                        <Text style={styles.avanceNombre}>
                          {" "}
                          Cantidad Ayudante : {item.ayudante}{" "}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <Text> </Text>
                <View style={styles.rowavanceNombre}>
                  <Text style={styles.avanceNombre}> Etapa: </Text>

                  <Text style={styles.detail}> {item.etapa}</Text>
                </View>
                <View style={styles.rowavanceNombre}>
                  <Text style={styles.avanceNombre}> Avance Ejecucion: </Text>

                  <Text style={styles.detail}> {item.porcentajeAvance}%</Text>
                </View>
                <View style={styles.rowavanceNombre}>
                  <Text style={styles.avanceNombre}> Autor: </Text>
                  <Text style={styles.detail}> {item.nombrePerfil}</Text>
                </View>
                <View style={styles.rowavanceNombre}>
                  <Text style={styles.avanceNombre}> Fecha: </Text>

                  <Text style={styles.detail}> {item.fechaPostFormato}</Text>
                </View>
                {item?.pdfFile && (
                  <View style={styles.rowavanceNombre}>
                    <Icon type="material-community" name="paperclip" />
                  </View>
                )}
                <Text> </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
      keyExtractor={(item, index) => `${index}-${item.createdAt}`}
    />
  );
};
export default GanttHistorial;
