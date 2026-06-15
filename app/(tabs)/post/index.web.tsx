import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  useWindowDimensions,
} from "react-native";
import { SearchBar } from "@rneui/themed";
import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { saveActualServiceAIT, savePhotoUri } from "../../../redux/actions/post";
import styles from "./index.styles";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { areaLists } from "../../../utils/areaList";
import { Image as ImageExpo } from "expo-image";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { sortByCodigo } from "../../../utils/sortByCodigo";
import { getTagEquipoLabel } from "../../../utils/tagEquipoList";

const getNumColumns = (windowWidth: number) => {
  if (windowWidth >= 1400) return 4;
  if (windowWidth >= 1024) return 3;
  if (windowWidth >= 768) return 2;
  return 1;
};

const emptyimage = require("../../../assets/login/logoPandora_1024.jpg");

function PublishRaw(props: any) {
  const { width: windowWidth } = useWindowDimensions();
  const numColumns = useMemo(
    () => getNumColumns(windowWidth),
    [windowWidth]
  );

  const [equipment, setEquipment] = useState<any>(null);
  const [AIT, setAIT] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const servicesList = props.servicesData;
    if (Array.isArray(servicesList)) {
      const servicesListSorted = sortByCodigo(servicesList);
      setPosts(servicesListSorted);
    }
  }, [props.servicesData]);

  useEffect(() => {
    if (searchText === "") {
      setSearchResults(posts);
      return;
    }

    const re = new RegExp(searchText, "ig");
    const result = posts.filter((item: any) =>
      re.test(item.Codigo) ||
      re.test(item.NumeroAIT) ||
      re.test(item.NombreServicio) ||
      re.test(item.companyName) ||
      re.test(item.EmpresaMinera)
    );
    setSearchResults(result);
  }, [searchText, posts]);

  const pickImage = async () => {
    if (!equipment) {
      Toast.show({
        type: "error",
        text1: "Escoge un servicio para continuar",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (result.canceled) {
      Toast.show({
        type: "error",
        text1: "No se ha seleccionado ninguna imagen",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }

    const resizedPhoto = await manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 800 } }],
      { compress: 0.4, format: SaveFormat.JPEG, base64: true }
    );
    props.savePhotoUri(resizedPhoto.uri);
    router.push({ pathname: "/post/Information" });
    setEquipment(null);
  };

  const camera = () => {
    if (!equipment) {
      Toast.show({
        type: "error",
        text1: "Escoge un servicio para continuar",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
      return;
    }

    router.push({ pathname: "/post/Camera" });
    setEquipment(null);
    setAIT(null);
  };

  const addAIT = () => {
    router.push({ pathname: "/post/AIT" });
    setEquipment(null);
    setAIT(null);
  };

  const selectAsset = (selectedAIT: any) => {
    const area = selectedAIT.AreaServicio;
    const indexareaList = areaLists.findIndex(
      (areaItem) => areaItem.value === area
    );
    const imageSource =
      areaLists[indexareaList]?.image ||
      require("../../../assets/equipmentplant/poderosa.png");
    const imageUpdated = selectedAIT.photoServiceURL;

    if (imageUpdated) {
      setEquipment({ uri: imageUpdated });
    } else {
      setEquipment(imageSource);
    }

    setAIT(selectedAIT);
    props.saveActualServiceAIT(selectedAIT);
    setShowActionModal(true);
  };

  const listHeader = (
    <>
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Buscar por referencia o Servicio"
          value={searchText}
          onChangeText={(text: string) => setSearchText(text)}
          lightTheme
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInput}
          inputStyle={styles.searchBarText}
          round
        />
      </View>

      {props.firebase_user_name ? (
        <View style={styles.equipments2}>
          <View>
            <ImageExpo
              source={equipment ?? emptyimage}
              style={styles.roundImage}
              cachePolicy="memory-disk"
            />
            <View>
              <Text style={styles.name2}>
                {equipment ? AIT?.NombreServicio : "Escoge El Servicio"}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {props.firebase_user_name ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            onPress={pickImage}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../../assets/pictures/AddImage.png")}
              style={styles.roundImageUpload}
            />
            <Text
              style={{
                fontSize: 10,
                marginTop: 2,
                textAlign: "center",
                color: "#555",
              }}
            >
              Galería
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={camera}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../../assets/pictures/TakePhoto2.png")}
              style={styles.roundImageUpload}
            />
            <Text
              style={{
                fontSize: 10,
                marginTop: 2,
                textAlign: "center",
                color: "#555",
              }}
            >
              Cámara
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={addAIT}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../../../assets/pictures/newService7.png")}
              style={styles.roundImageUpload}
            />
            <Text
              style={{
                fontSize: 10,
                marginTop: 2,
                textAlign: "center",
                color: "#555",
              }}
            >
              Nuevo Servicio
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </>
  );

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: "#f5f5f5" }, styles.AndroidSafeArea]}
    >
      <React.Fragment key={numColumns}>
        <FlatList
          data={searchResults}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          ListHeaderComponent={listHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={{ backgroundColor: "#f5f5f5", marginTop: 10 }}
          renderItem={({ item }) => {
          const area = item.AreaServicio;
          const indexareaList = areaLists.findIndex(
            (areaItem) => areaItem.value === area
          );
          const imageSource =
            areaLists[indexareaList]?.image ||
            require("../../../assets/equipmentplant/poderosa.png");

          return (
            <TouchableOpacity
              onPress={() => selectAsset(item)}
              style={styles.cardContainer}
              activeOpacity={0.7}
            >
              <View style={styles.card}>
                <View style={styles.cardImageContainer}>
                  {item.photoServiceURL ? (
                    <ImageExpo
                      source={{ uri: item.photoServiceURL }}
                      style={styles.cardImage}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <ImageExpo
                      source={imageSource}
                      style={styles.cardImage}
                      cachePolicy="memory-disk"
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
        keyExtractor={(item, index) =>
          `${index}-${item.fechaPostFormato ?? item.idServiciosAIT ?? item.Codigo}`
        }
        />
      </React.Fragment>

      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowActionModal(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{
              backgroundColor: "#ffffff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 36,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: "#dde1e8",
                borderRadius: 2,
                alignSelf: "center",
                marginBottom: 18,
              }}
            />

            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <ImageExpo
                source={equipment ?? emptyimage}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  borderWidth: 2,
                  borderColor: "#e9ecef",
                }}
                cachePolicy="memory-disk"
              />
              <Text
                numberOfLines={1}
                style={{
                  fontWeight: "700",
                  fontSize: 16,
                  color: "#2A3B76",
                  marginTop: 10,
                  maxWidth: 280,
                  textAlign: "center",
                }}
              >
                {AIT?.NombreServicio}
              </Text>
              {AIT?.Codigo ? (
                <View
                  style={{
                    backgroundColor: "#2A3B76",
                    borderRadius: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "700" }}>
                    {AIT.Codigo}
                  </Text>
                </View>
              ) : AIT?.NumeroAIT ? (
                <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                  OC: {AIT.NumeroAIT}
                </Text>
              ) : null}
            </View>

            <Text
              style={{
                textAlign: "center",
                color: "#64748b",
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              ¿Cómo quieres adjuntar la foto?
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowActionModal(false);
                pickImage();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f0f4f8",
                borderRadius: 14,
                padding: 16,
                marginBottom: 12,
              }}
              activeOpacity={0.75}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "#e3eeff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("../../../assets/pictures/AddImage.png")}
                  style={{ width: 30, height: 30 }}
                />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ fontWeight: "600", fontSize: 15, color: "#1e293b" }}>
                  Carrete / Galería
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                  Buscar foto en tu dispositivo
                </Text>
              </View>
              <Text style={{ color: "#c0cad8", fontSize: 20 }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowActionModal(false);
                camera();
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f0f4f8",
                borderRadius: 14,
                padding: 16,
                marginBottom: 20,
              }}
              activeOpacity={0.75}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "#e0f7e9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={require("../../../assets/pictures/TakePhoto2.png")}
                  style={{ width: 30, height: 30 }}
                />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ fontWeight: "600", fontSize: 15, color: "#1e293b" }}>
                  Cámara
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>
                  Tomar una nueva foto
                </Text>
              </View>
              <Text style={{ color: "#c0cad8", fontSize: 20 }}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowActionModal(false)}
              style={{ alignItems: "center", paddingVertical: 8 }}
              activeOpacity={0.6}
            >
              <Text style={{ color: "#94a3b8", fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const mapStateToProps = (reducers: any) => ({
  firebase_user_name: reducers.profile.firebase_user_name,
  servicesData: reducers.home.servicesData,
});

const Publish = connect(mapStateToProps, {
  saveActualServiceAIT,
  savePhotoUri,
})(PublishRaw);

export default Publish;
