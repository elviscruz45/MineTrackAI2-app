import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  where,
  limit,
} from "firebase/firestore";
import styles from "./HeaderScreen.styles";
import { connect } from "react-redux";
import { db } from "@/firebaseConfig";
import { areaLists } from "@/utils/areaList";
import CircularProgress from "./CircularProgress";
import { saveActualAITServicesFirebaseGlobalState } from "@/redux/actions/post";
import { updateAITServicesDATA } from "@/redux/actions/home";
import { saveApprovalListnew } from "@/redux/actions/search";
import { mineraCorreosList } from "@/utils/MineraList";
import { useRouter } from "expo-router";

function HeaderScreenNoRedux(props: any) {
  console.log("HEADER HEADER", props);
  const router = useRouter();

  const [data, setData] = useState();
  //Data about the company belong this event
  function capitalizeFirstLetter(str: string) {
    return str?.charAt(0).toUpperCase() + str?.slice(1);
  }
  // const regex = /@(.+?)\./i;
  useEffect(() => {
    let unsubscribe: any;
    if (props.email && props.idproyecto) {
      // <-- check for idproyecto
      function fetchData() {
        let queryRef;

        queryRef = query(
          collection(db, "ServiciosAIT"),
          where("projectId", "==", props.idproyecto) // <-- use idproyecto here
        );

        unsubscribe = onSnapshot(queryRef, (ItemFirebase) => {
          const lista: any = [];
          ItemFirebase.forEach((doc) => {
            lista.push(doc.data());
          });

          lista.sort((a: any, b: any) => {
            return b.LastEventPosted - a.LastEventPosted;
          });

          setData(lista);
          props.updateAITServicesDATA(lista);
        });
      }
      props.idproyecto && fetchData();
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [props.email, props.idproyecto]);

  const selectAsset = async (item: any) => {
    await router.push({
      pathname: "/search",
      params: {
        Item: item,
      },
    });

    setTimeout(() => {
      router.push({
        pathname: "/search/Item",
        params: {
          Item: item,
        },
      });
    }, 50);
    // router.push({
    //   pathname: "/search/Item",
    //   params: {
    //     Item: item,
    //   },
    // });
  };

  // create an algorithm to reduce the total text of the service description
  const ShortTextComponent = (item: any) => {
    const longText = item;
    const maxLength = 20; // Maximum length of the short text
    let shortText = longText;
    if (longText.length > maxLength) {
      shortText = `${longText.substring(0, maxLength)}...`;
    }

    return <Text style={styles.Texticons}>{shortText}</Text>;
  };

  return (
    <FlatList
      style={[
        {
          backgroundColor: "white",
          paddingTop: 10,
          paddingVertical: 10,
        },
        // styles.AndroidSafeArea,
      ]}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      data={data}
      renderItem={({ item }) => {
        //the algoritm to retrieve the image source to render the icon
        const area = item.AreaServicio;
        const indexareaList = areaLists.findIndex(
          (item) => item.value === area
        );
        const imageSource =
          areaLists[indexareaList]?.image ||
          require("../../../../../assets/equipmentplant/ImageIcons/fhIcon1.jpeg");
        return (
          <TouchableOpacity onPress={() => selectAsset(item.idServiciosAIT)}>
            <View style={styles.textImage}>
              <CircularProgress
                imageSource={imageSource}
                imageStyle={styles.roundImage5}
                avance={item.AvanceEjecucion}
                image={item.photoServiceURL}
              />

              {ShortTextComponent(item.NombreServicio)}
            </View>
          </TouchableOpacity>
        );
      }}
      keyExtractor={(item, index) => `${index}-${item.fechaPostISO}`}
    />
  );
}

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
  };
};

const HeaderScreen = connect(mapStateToProps, {
  // EquipmentListUpper,
  saveActualAITServicesFirebaseGlobalState,
  updateAITServicesDATA,
  saveApprovalListnew,
})(HeaderScreenNoRedux);

export default HeaderScreen;
