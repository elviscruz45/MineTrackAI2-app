import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import styles from "./index.styles";
import { SearchBar, Icon } from "@rneui/themed";
import { screen } from "../../../utils";
import { Image as ImageExpo } from "expo-image";
import { connect } from "react-redux";
import { EquipmentListUpper } from "../../../redux/actions/home";
import { areaLists } from "../../../utils/areaList";
import { sortByCodigo } from "../../../utils/sortByCodigo";
import { getTagEquipoLabel } from "../../../utils/tagEquipoList";
import { useRouter } from "expo-router";
import EquipmentBrowser from "../operations/EquipmentBrowser";
import { createHomeWebStyles } from "../home/homeWebStyles";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

const windowWidth = Dimensions.get("window").width;

// Función para calcular el número de columnas basado en el ancho de pantalla
const getNumColumns = () => {
  if (windowWidth >= 1400) return 4;
  if (windowWidth >= 1024) return 3;
  if (windowWidth >= 768) return 2;
  return 1;
};

const numColumns = getNumColumns();
function SearchAssetRaw(props: any) {
  let AITServiceList;
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { styles: uiStyles } = useMemo(
    () => createHomeWebStyles(windowWidth),
    [windowWidth],
  );

  const [data, setData] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);

  const hasProjectData =
    Array.isArray(props.servicesData) && props.servicesData.length > 0;

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
      const AITServiceListSorted = sortByCodigo(AITServiceList);
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
          re.test(item.Codigo) ||
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

  if (!hasProjectData) {
    return (
      <SafeAreaView style={[uiStyles.safeArea, styles.AndroidSafeArea]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {props.email && props.user_photo ? (
            <View style={uiStyles.page}>
              <View style={uiStyles.pageHeader}>
                <Text style={uiStyles.pageTitle}>Catálogo de equipos</Text>
                <Text style={uiStyles.pageSubtitle}>
                  Selecciona un equipo para ver historial de eventos,
                  mantenimientos y gestionar el seguimiento como supervisor o
                  planificador.
                </Text>
              </View>
              <EquipmentBrowser embedded selectionMode="browse" nestedScroll />
            </View>
          ) : (
            <View style={uiStyles.loadingWrap}>
              <LoadingSpinner />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!props.email || !data) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[{ backgroundColor: "#f5f5f5", flex: 1 }, styles.AndroidSafeArea]}
    >
      <FlatList
        data={searchResults}
        key={numColumns}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        ListHeaderComponent={
          <View style={styles.searchContainer}>
            <SearchBar
              placeholder="Buscar por referencia o Servicio"
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
              lightTheme={true}
              containerStyle={styles.searchBarContainer}
              inputContainerStyle={styles.searchBarInput}
              inputStyle={styles.searchBarText}
              round
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={styles.listContent}
        style={{ backgroundColor: "#f5f5f5" }}
        renderItem={({ item, index }) => {
          //the algoritm to retrieve the image source to render the icon

          const area = item.AreaServicio;
          const indexareaList = areaLists.findIndex(
            (item) => item.value === area
          );
          const imageSource =
            areaLists[indexareaList]?.image ||
            require("../../../assets/equipmentplant/poderosa.png");

          // require("../../../assets/equipmentplant/ImageIcons/confipetrolLogos.png");
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
              style={styles.cardContainer}
              activeOpacity={0.7}
            >
              <View style={styles.card}>
                <View style={styles.cardImageContainer}>
                  {item.photoServiceURL ? (
                    <ImageExpo
                      source={{ uri: item.photoServiceURL }}
                      style={styles.cardImage}
                      cachePolicy={"memory-disk"}
                    />
                  ) : (
                    <ImageExpo
                      source={
                        imageSource ||
                        require("../../../assets/equipmentplant/logoMetso4.png")
                      }
                      style={styles.cardImage}
                      cachePolicy={"memory-disk"}
                    />
                  )}
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    {item.Codigo ? (
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeBadgeText}>{item.Codigo}</Text>
                      </View>
                    ) : null}
                    {item.TipoServicio ? (
                      <Text style={styles.tipoChip} numberOfLines={1}>
                        {item.TipoServicio}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.NombreServicio}
                  </Text>

                  <View style={styles.cardInfo}>
                    {getTagEquipoLabel(item.TagEquipo) ? (
                      <View style={styles.tagBadge}>
                        <Text style={styles.tagBadgeText} numberOfLines={1}>
                          {getTagEquipoLabel(item.TagEquipo)}
                        </Text>
                      </View>
                    ) : null}

                    {item.EmpresaMinera ? (
                      <Text style={styles.infoText} numberOfLines={1}>
                        <Text style={styles.infoLabel}>Minera: </Text>
                        <Text style={styles.infoValue}>{item.EmpresaMinera}</Text>
                      </Text>
                    ) : null}

                    {item.NumeroAIT ? (
                      <Text style={styles.infoText} numberOfLines={1}>
                        <Text style={styles.infoLabel}>OC: </Text>
                        <Text style={styles.infoValue}>{item.NumeroAIT}</Text>
                      </Text>
                    ) : null}
                  </View>
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
    user_photo: reducers.profile.user_photo,
  };
};
const SearchAsset = connect(mapStateToProps, { EquipmentListUpper })(
  SearchAssetRaw
);

export default SearchAsset;
