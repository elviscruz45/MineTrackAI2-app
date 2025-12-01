import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import styles from "./index.styles";
import { SearchBar, Icon } from "@rneui/themed";
import { screen } from "../../../utils";
import { Image as ImageExpo } from "expo-image";
import { connect } from "react-redux";
import { EquipmentListUpper } from "../../../redux/actions/home";
import { areaLists } from "../../../utils/areaList";
import { useRouter } from "expo-router";

const windowWidth = Dimensions.get("window").width;
const numColumns = windowWidth > 1000 ? 3 : 1;
function SearchAssetRaw(props: any) {
  let AITServiceList;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  // const navigation = useNavigation();

  //Data about the company belong this event
  function capitalizeFirstLetter(str: string) {
    return str?.charAt(0).toUpperCase() + str?.slice(1);
  }
  const regex = /@(.+?)\./i;
  const companyName =
    capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo";

  // if (!data && !searchResults) {
  //   setData(props.servicesData);
  //   setSearchResults(props.servicesData);
  // }

  //This is used to retrieve the the services we are filtering and sorting
  useEffect(() => {
    AITServiceList = props.servicesData;
    if (Array.isArray(AITServiceList)) {
      let AITServiceListSorted = AITServiceList.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });
      setData(AITServiceListSorted);
      setSearchResults(AITServiceListSorted);
    }
  }, [props.servicesData]);

  useEffect(() => {
    if (searchText === "") {
      setSearchResults(data);
    } else {
      const result = data?.filter((item: any) => {
        const re = new RegExp(searchText, "ig");
        return (
          re.test(item.NombreServicio) ||
          re.test(item.NumeroAIT) ||
          re.test(item.NumeroCotizacion) ||
          re.test(item.TipoServicio) ||
          re.test(item.companyName) ||
          re.test(item.EmpresaMinera)
        );
      });

      setSearchResults(result);
    }
  }, [searchText]);
  //to initialize the data in null

  useEffect(() => {
    if (!data && !searchResults) {
      setData(props.servicesData);
      setSearchResults(props.servicesData);
    }
  }, []);

  //this method is used to go to a screen to see the status of the item
  const selectAsset = (idServiciosAIT: any) => {
    router.push({
      pathname: "/search/Item",
      params: { Item: idServiciosAIT },
    });
  };

  if (props.servicesData?.length === 0 || !props.email || !data) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 50,
            // fontFamily: "Arial",
            color: "#2A3B76",
          }}
        >
          Bienvenido
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[{ backgroundColor: "white", flex: 1 }, styles.AndroidSafeArea]}
    >
      <FlatList
        data={searchResults}
        ListHeaderComponent={
          <SearchBar
            placeholder="Buscar por referencia o Servicio"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            lightTheme={true}
            inputContainerStyle={{ backgroundColor: "white" }}
          />
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        renderItem={({ item, index }) => {
          //the algoritm to retrieve the image source to render the icon

          const area = item.AreaServicio;
          const indexareaList = areaLists.findIndex(
            (item) => item.value === area
          );
          const imageSource =
            areaLists[indexareaList]?.image ||
            require("../../../assets/equipmentplant/ImageIcons/confipetrolLogos.png");
          // the algorithm to retrieve the amount with format
          const formattedAmount = new Intl.NumberFormat("en-US", {
            style: "decimal",
            useGrouping: true,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(item.Monto);

          return (
            <TouchableOpacity
              onPress={() => selectAsset(item.idServiciosAIT)}
              style={{ backgroundColor: "white" }} // Add backgroundColor here
            >
              <View style={styles.equipments}>
                {item.photoServiceURL ? (
                  <ImageExpo
                    source={{ uri: item.photoServiceURL }}
                    style={styles.image}
                    cachePolicy={"memory-disk"}
                  />
                ) : (
                  <ImageExpo
                    source={
                      imageSource ||
                      require("../../../assets/equipmentplant/ImageIcons/confipetrolLogos.png")
                    }
                    style={styles.image}
                    cachePolicy={"memory-disk"}
                  />
                )}

                <View style={{ marginLeft: 20 }}>
                  <Text style={styles.name}>{item.NombreServicio}</Text>
                  <Text style={styles.info}>
                    {"Codigo Servicio: "}
                    {item.NumeroAIT}
                  </Text>
                  <Text style={styles.info}>
                    {"Tipo: "}
                    {item.TipoServicio}
                  </Text>
                  <Text style={styles.info}>
                    {"Empresa Minera: "}
                    {item.EmpresaMinera}
                  </Text>
                  {/* {companyName !== item.companyName && (
                    <Text style={styles.info}>
                      {"Empresa: "}
                      {item.companyName}
                    </Text>
                  )} */}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => `${index}-${item.fechaPostFormato}`}
      />
    </SafeAreaView>
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    servicesData: reducers.home.servicesData,
    email: reducers.profile.email,
    // user_photo: reducers.profile.user_photo,
  };
};
const SearchAsset = connect(mapStateToProps, { EquipmentListUpper })(
  SearchAssetRaw
);

export default SearchAsset;
