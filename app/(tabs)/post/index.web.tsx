import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  useWindowDimensions,
  Pressable,
} from "react-native";
import { SearchBar } from "@rneui/themed";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { connect } from "react-redux";
import { saveActualServiceAIT, savePhotoUri } from "../../../redux/actions/post";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { areaLists } from "../../../utils/areaList";
import { Image as ImageExpo } from "expo-image";
import Toast from "react-native-toast-message";
import { useRouter, useLocalSearchParams } from "expo-router";
import { sortByCodigo } from "../../../utils/sortByCodigo";
import {
  getTagEquipoLabel,
  getTagEquipoImage,
  getTagEquipoNombre,
  buildStandaloneEquipmentContext,
  type TagEquipoItem,
} from "../../../utils/tagEquipoList";
import EquipmentBrowser from "../operations/EquipmentBrowser";
import { SafeAreaView } from "react-native-safe-area-context";
import { createWebStyles } from "./postIndexStyles";

const getNumColumns = (windowWidth: number) => {
  if (windowWidth >= 1280) return 3;
  if (windowWidth >= 768) return 2;
  return 1;
};

const emptyimage = require("../../../assets/login/logoPandora_1024.jpg");

type QuickActionProps = {
  label: string;
  icon: number;
  onPress: () => void;
  primary?: boolean;
  styles: ReturnType<typeof createWebStyles>;
};

function QuickAction({ label, icon, onPress, primary, styles }: QuickActionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.actionBtn, primary && styles.actionBtnPrimary]}
      activeOpacity={0.75}
    >
      <Image source={icon} style={styles.actionIcon} />
      <Text style={[styles.actionLabel, primary && styles.actionLabelPrimary]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function PublishRaw(props: any) {
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(() => createWebStyles(windowWidth), [windowWidth]);
  const numColumns = useMemo(() => getNumColumns(windowWidth), [windowWidth]);
  const isWide = windowWidth >= 640;

  const [equipment, setEquipment] = useState<any>(null);
  const [AIT, setAIT] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showActionModal, setShowActionModal] = useState(false);

  const router = useRouter();
  const { equipmentEvent } = useLocalSearchParams<{ equipmentEvent?: string }>();
  const handledEquipmentEvent = useRef(false);

  const hasProject = Boolean(
    Array.isArray(props.servicesData) && props.servicesData.length > 0,
  );
  const isStandaloneEquipment =
    Boolean(props.actualServiceAIT?.isStandaloneEquipmentEvent) &&
    Boolean(props.actualServiceAIT?.TagEquipo);
  const hasActiveSelection = Boolean(equipment) || isStandaloneEquipment;

  const selectionTitle = equipment
    ? isStandaloneEquipment
      ? `${getTagEquipoLabel(AIT?.TagEquipo)} — ${AIT?.NombreServicio ?? ""}`
      : AIT?.NombreServicio
    : hasProject
      ? "Selecciona un servicio"
      : "Selecciona un equipo";

  const selectionHint = hasActiveSelection
    ? "Listo para adjuntar foto o continuar con el reporte."
    : hasProject
      ? "Elige un servicio de la lista o usa las acciones rápidas."
      : "Busca un equipo abajo para reportar un evento rápidamente.";

  useEffect(() => {
    if (!equipmentEvent || handledEquipmentEvent.current) return;
    const ait = props.actualServiceAIT;
    if (
      !ait?.isStandaloneEquipmentEvent ||
      String(ait.TagEquipo) !== String(equipmentEvent)
    ) {
      return;
    }

    handledEquipmentEvent.current = true;
    setEquipment(getTagEquipoImage(String(ait.TagEquipo)));
    setAIT(ait);
    setShowActionModal(true);
  }, [equipmentEvent, props.actualServiceAIT]);

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
    const result = posts.filter(
      (item: any) =>
        re.test(item.Codigo) ||
        re.test(item.NumeroAIT) ||
        re.test(item.NombreServicio) ||
        re.test(item.companyName) ||
        re.test(item.EmpresaMinera),
    );
    setSearchResults(result);
  }, [searchText, posts]);

  const showSelectionToast = () => {
    Toast.show({
      type: "error",
      text1: hasProject
        ? "Escoge un servicio para continuar"
        : "Escoge un equipo para continuar",
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  };

  const pickImage = async () => {
    if (!hasActiveSelection) {
      showSelectionToast();
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
      { compress: 0.4, format: SaveFormat.JPEG, base64: true },
    );
    props.savePhotoUri(resizedPhoto.uri);
    router.push({ pathname: "/post/Information" });
    setEquipment(null);
  };

  const camera = () => {
    if (!hasActiveSelection) {
      showSelectionToast();
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

  const selectEquipmentForEvent = (item: TagEquipoItem) => {
    const context = buildStandaloneEquipmentContext(item);
    setEquipment(getTagEquipoImage(item.key));
    setAIT(context);
    setShowActionModal(true);
  };

  const selectAsset = (selectedAIT: any) => {
    const area = selectedAIT.AreaServicio;
    const indexareaList = areaLists.findIndex(
      (areaItem) => areaItem.value === area,
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
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>
          {hasProject ? "Nuevo evento" : "Evento por equipo"}
        </Text>
        <Text style={styles.pageSubtitle}>
          {hasProject
            ? "Selecciona el servicio asociado y adjunta la evidencia fotográfica del evento."
            : "Sin proyecto activo — selecciona un equipo para reportar un evento rápidamente."}
        </Text>
      </View>

      {props.firebase_user_name ? (
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.heroImageWrap}>
              <ImageExpo
                source={equipment ?? emptyimage}
                style={[
                  styles.heroImage,
                  !equipment && styles.heroImageEmpty,
                ]}
                cachePolicy="memory-disk"
                contentFit="cover"
              />
            </View>

            <View style={styles.heroBody}>
              <Text style={styles.heroLabel}>
                {hasActiveSelection ? "Selección actual" : "Sin selección"}
              </Text>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {selectionTitle}
              </Text>
              <Text style={styles.heroHint}>{selectionHint}</Text>
              {hasActiveSelection && isStandaloneEquipment && AIT?.TagEquipo ? (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{AIT.TagEquipo}</Text>
                </View>
              ) : null}
              {hasActiveSelection && !isStandaloneEquipment && AIT?.Codigo ? (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{AIT.Codigo}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.actionsRow}>
              <QuickAction
                label="Galería"
                icon={require("../../../assets/pictures/AddImage.png")}
                onPress={pickImage}
                styles={styles}
              />
              <QuickAction
                label="Cámara"
                icon={require("../../../assets/pictures/TakePhoto2.png")}
                onPress={camera}
                styles={styles}
              />
              {hasProject ? (
                <QuickAction
                  label="Nuevo servicio"
                  icon={require("../../../assets/pictures/newService7.png")}
                  onPress={addAIT}
                  primary
                  styles={styles}
                />
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {hasProject ? (
        <View style={styles.searchWrap}>
          <SearchBar
            placeholder="Buscar por código, servicio, OC o minera…"
            value={searchText}
            onChangeText={(text: string) => setSearchText(text)}
            lightTheme
            containerStyle={styles.searchBarContainer}
            inputContainerStyle={styles.searchBarInput}
            inputStyle={styles.searchBarText}
            round
          />
        </View>
      ) : null}

      {!hasProject ? (
        <View style={styles.equipmentWrap}>
          <EquipmentBrowser
            embedded
            nestedScroll
            selectionMode="createEvent"
            onQuickEventSelect={selectEquipmentForEvent}
          />
        </View>
      ) : searchResults.length > 0 ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Servicios del proyecto</Text>
          <Text style={styles.sectionCount}>
            {searchResults.length}{" "}
            {searchResults.length === 1 ? "resultado" : "resultados"}
          </Text>
        </View>
      ) : null}
    </>
  );

  const listEmpty = hasProject ? (
    <View style={styles.emptyState}>
      <Text style={{ fontSize: 32 }}>{searchText ? "🔍" : "📋"}</Text>
      <Text style={styles.emptyTitle}>
        {searchText ? "Sin resultados" : "No hay servicios"}
      </Text>
      <Text style={styles.emptyText}>
        {searchText
          ? `No encontramos servicios que coincidan con “${searchText}”. Prueba con otro término.`
          : "Aún no hay servicios cargados en este proyecto. Puedes crear uno con el botón Nuevo servicio."}
      </Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <View style={styles.page}>
        <FlatList
          key={numColumns}
          data={hasProject ? searchResults : []}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          renderItem={({ item }) => {
            const area = item.AreaServicio;
            const indexareaList = areaLists.findIndex(
              (areaItem) => areaItem.value === area,
            );
            const imageSource =
              areaLists[indexareaList]?.image ||
              require("../../../assets/equipmentplant/poderosa.png");

            return (
              <Pressable
                onPress={() => selectAsset(item)}
                style={styles.cardContainer}
              >
                {({ pressed }) => (
                  <View style={[styles.card, pressed && styles.cardPressed]}>
                    <View style={styles.cardImageContainer}>
                      <ImageExpo
                        source={
                          item.photoServiceURL
                            ? { uri: item.photoServiceURL }
                            : imageSource
                        }
                        style={styles.cardImage}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                      />
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        {item.Codigo ? (
                          <View style={styles.codeBadge}>
                            <Text style={styles.codeBadgeText}>
                              {item.Codigo}
                            </Text>
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
                            <Text style={styles.infoValue}>
                              {item.EmpresaMinera}
                            </Text>
                          </Text>
                        ) : null}

                        {item.NumeroAIT ? (
                          <Text style={styles.infoText} numberOfLines={1}>
                            <Text style={styles.infoLabel}>OC: </Text>
                            <Text style={styles.infoValue}>
                              {item.NumeroAIT}
                            </Text>
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          }}
          keyExtractor={(item, index) =>
            `${index}-${item.fechaPostFormato ?? item.idServiciosAIT ?? item.Codigo}`
          }
        />
      </View>

      <Modal
        visible={showActionModal}
        transparent
        animationType={isWide ? "fade" : "slide"}
        onRequestClose={() => setShowActionModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowActionModal(false)}
          style={styles.modalOverlay}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.modalSheet}>
            {!isWide ? <View style={styles.modalHandle} /> : null}

            <View style={styles.modalHero}>
              <ImageExpo
                source={equipment ?? emptyimage}
                style={styles.modalImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <Text numberOfLines={2} style={styles.modalTitle}>
                {isStandaloneEquipment
                  ? getTagEquipoNombre({
                      key: AIT?.TagEquipo,
                      nombre: AIT?.NombreServicio,
                      value: "",
                      area: AIT?.AreaServicio ?? "",
                    })
                  : AIT?.NombreServicio}
              </Text>
              {isStandaloneEquipment && AIT?.TagEquipo ? (
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>{AIT.TagEquipo}</Text>
                </View>
              ) : AIT?.Codigo ? (
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>{AIT.Codigo}</Text>
                </View>
              ) : AIT?.NumeroAIT ? (
                <Text style={styles.modalMeta}>OC: {AIT.NumeroAIT}</Text>
              ) : null}
            </View>

            <Text style={styles.modalPrompt}>
              ¿Cómo quieres adjuntar la foto?
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowActionModal(false);
                pickImage();
              }}
              style={styles.modalOption}
              activeOpacity={0.75}
            >
              <View
                style={[styles.modalOptionIconWrap, styles.modalOptionIconGallery]}
              >
                <Image
                  source={require("../../../assets/pictures/AddImage.png")}
                  style={{ width: 28, height: 28 }}
                />
              </View>
              <View style={styles.modalOptionBody}>
                <Text style={styles.modalOptionTitle}>Carrete / Galería</Text>
                <Text style={styles.modalOptionDesc}>
                  Buscar foto en tu dispositivo
                </Text>
              </View>
              <Text style={styles.modalChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowActionModal(false);
                camera();
              }}
              style={styles.modalOption}
              activeOpacity={0.75}
            >
              <View
                style={[styles.modalOptionIconWrap, styles.modalOptionIconCamera]}
              >
                <Image
                  source={require("../../../assets/pictures/TakePhoto2.png")}
                  style={{ width: 28, height: 28 }}
                />
              </View>
              <View style={styles.modalOptionBody}>
                <Text style={styles.modalOptionTitle}>Cámara</Text>
                <Text style={styles.modalOptionDesc}>
                  Tomar una nueva foto
                </Text>
              </View>
              <Text style={styles.modalChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowActionModal(false)}
              style={styles.modalCancel}
              activeOpacity={0.6}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
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
  actualServiceAIT: reducers.post.actualServiceAIT,
});

const Publish = connect(mapStateToProps, {
  saveActualServiceAIT,
  savePhotoUri,
})(PublishRaw);

export default Publish;
