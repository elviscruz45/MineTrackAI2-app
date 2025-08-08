import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import styles from "./index.styles";
import { SearchBar, Icon } from "@rneui/themed";
import { screen } from "@/utils";
import { Image as ImageExpo } from "expo-image";
import { connect } from "react-redux";
import { EquipmentListUpper } from "@/redux/actions/home";
import { areaLists } from "@/utils/areaList";
import { useRouter } from "expo-router";
import { titulo_proyecto } from "@/redux/actions/auth";
import { Ionicons } from "@expo/vector-icons";

const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 60%, 50%)`;
};
const getRandomDate = () => {
  const start = new Date(2025, 0, 1);
  const end = new Date();
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toLocaleDateString();
};
function tituloProyectoRaw(props: any) {
  // let AITServiceList;
  // const router = useRouter();

  // const [data, setData] = useState<any>(null);
  // const [searchText, setSearchText] = useState("");
  // const [searchResults, setSearchResults] = useState<any>(null);
  // // const navigation = useNavigation();

  // //Data about the company belong this event
  // function capitalizeFirstLetter(str: string) {
  //   return str?.charAt(0).toUpperCase() + str?.slice(1);
  // }
  // const regex = /@(.+?)\./i;
  // const companyName =
  //   capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo";

  // // if (!data && !searchResults) {
  // //   setData(props.servicesData);
  // //   setSearchResults(props.servicesData);
  // // }

  // //This is used to retrieve the the services we are filtering and sorting
  // useEffect(() => {
  //   AITServiceList = props.servicesData;
  //   if (Array.isArray(AITServiceList)) {
  //     let AITServiceListSorted = AITServiceList.sort((a, b) => {
  //       return b.createdAt - a.createdAt;
  //     });
  //     setData(AITServiceListSorted);
  //     setSearchResults(AITServiceListSorted);
  //   }
  // }, [props.servicesData]);

  // useEffect(() => {
  //   if (searchText === "") {
  //     setSearchResults(data);
  //   } else {
  //     const result = data?.filter((item: any) => {
  //       const re = new RegExp(searchText, "ig");
  //       return (
  //         re.test(item.NombreServicio) ||
  //         re.test(item.NumeroAIT) ||
  //         re.test(item.NumeroCotizacion) ||
  //         re.test(item.TipoServicio) ||
  //         re.test(item.companyName) ||
  //         re.test(item.EmpresaMinera)
  //       );
  //     });

  //     setSearchResults(result);
  //   }
  // }, [searchText]);
  // //to initialize the data in null

  // useEffect(() => {
  //   if (!data && !searchResults) {
  //     setData(props.servicesData);
  //     setSearchResults(props.servicesData);
  //   }
  // }, []);

  // //this method is used to go to a screen to see the status of the item
  // const selectAsset = (idServiciosAIT: any) => {
  //   router.push({
  //     pathname: "/search/Item",
  //     params: { Item: idServiciosAIT },
  //   });
  // };

  // if (props.servicesData?.length === 0 || !props.email || !data) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         backgroundColor: "white",
  //         justifyContent: "center",
  //         alignItems: "center",
  //       }}
  //     >
  //       <Text
  //         style={{
  //           fontSize: 50,
  //           // fontFamily: "Arial",
  //           color: "#2A3B76",
  //         }}
  //       >
  //         Bienvenido
  //       </Text>
  //     </View>
  //   );
  // }

  const data = [
    "PARADA DE PLANTA JULIO 2025",
    "CAMBIO DE MOLINO DE BOLAS ML002",
    "CAMBIO DE MOLINO DE BOLAS ML001",
    "PARADA DE LINEA ABRIL 2025",
    "PARADA DE PLANTA ABRIL 2025",
    "CAMBIO DE MOLINO DE BOLAS ML002",
    "CAMBIO DE MOLINO DE BOLAS ML001",
    "PARADA DE LINEA FEBRERO 2025",
    "PARADA DE PLANTA JULIO 2025",
    "CAMBIO DE MOLINO DE BOLAS ML002",
    "CAMBIO DE MOLINO DE BOLAS ML001",
    "PARADA DE LINEA AGOSTO 2025",
    "PARADA DE PLANTA AGOSTO 2025",
    "CAMBIO DE MOLINO DE BOLAS ML002",
    "CAMBIO DE MOLINO DE BOLAS ML001",
    "PARADA DE LINEA DICIEMBRE 2025",
  ];

  return (
    <SafeAreaView
      style={[{ backgroundColor: "white", flex: 1 }, styles.AndroidSafeArea]}
    >
      <Text> </Text>
      <FlatList
        data={data}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        renderItem={({ item, index }) => {
          const backgroundColor = getRandomPastelColor();
          const randomDate = getRandomDate();

          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor }]}
              activeOpacity={0.5}
              onPress={() => {
                // navigation.navigate(screen.search.Item, { Item: item })
                props.titulo_proyecto(item);
              }}
            >
              <View style={styles.cardContent}>
                <Ionicons
                  name={
                    index % 5 === 0
                      ? "star"
                      : index % 4 === 0
                      ? "flame"
                      : index % 3 === 0
                      ? "bulb"
                      : index % 2 === 0
                      ? "flower"
                      : "sparkles"
                  }
                  size={24}
                  color="#FFF"
                  style={styles.icon}
                />
                <Text style={styles.cardText}>{item}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>Fecha: {randomDate}</Text>
                <Ionicons name="chevron-forward" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => `${index}`}
      />
    </SafeAreaView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    servicesData: reducers.home.servicesData,
    email: reducers.profile.email,
    tituloProyecto: reducers.auth.tituloProyecto,

    // user_photo: reducers.profile.user_photo,
  };
};
const TituloProyecto = connect(mapStateToProps, {
  EquipmentListUpper,
  titulo_proyecto,
})(tituloProyectoRaw);

export default TituloProyecto;
