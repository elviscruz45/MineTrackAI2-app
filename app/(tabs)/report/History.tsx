import React, { useState, useEffect, useContext } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { connect } from "react-redux";
import styles from "./History.styles";
import DateScreen from "./components/DateScreen/DateScreen";
import ServiceList from "./components/Resources/ServiceList";
import InactiveServiceList from "./components/Resources/InactiveServiceList";
import MontoServiceList from "./components/Resources/MontoServiceList";
import BarInactiveServices from "./components/Resources/BarInactiveServices";
import { getExcelReportData } from "../../../utils/excelData";
import { db } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { Modal } from "@/components/Modal/Modal";
import ChangeDisplayCompany from "./components/ChangeCompany/ChangeCompany";
import HistoryServiceList from "./components/HistoryServiceList";
import HistoryEstadoServiceList from "./components/HistoryEstadoServiceList";
const HistoryScreenNoRedux = (props: any) => {
  const [showModal, setShowModal] = useState(false);
  const [renderComponent, setRenderComponent] = useState<any>(null);
  const [company, setCompany] = useState("TOTAL CONTRATISTAS");
  const [companyList, setCompanyList] = useState<any>();

  const onCloseOpenModal = () => setShowModal((prevState) => !prevState);

  const update_Data = () => {
    setRenderComponent(
      <ChangeDisplayCompany
        onClose={onCloseOpenModal}
        setCompany={setCompany}
        companyList={companyList}
      />
    );
    setShowModal(true);
  };
  //real time updates
  const [data, setData] = useState([]);

  //states of filters
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();
  const [removeFilter, setRemoveFilter] = useState(true);

  //states to view the tables
  const [serviciosActivos, setServiciosActivos] = useState(false);
  const [estadoServicios, setEstadoServicios] = useState(false);
  const [serviciosInactivos, setServiciosInactivos] = useState(false);
  const [montoServicios, setMontoServicios] = useState(false);
  const [historial, setHistorial] = useState(false);
  //Data about the company belong this event
  function capitalizeFirstLetter(str: string) {
    return str?.charAt(0).toUpperCase() + str?.slice(1);
  }
  const regex = /@(.+?)\./i;
  const companyName =
    capitalizeFirstLetter(props.email?.match(regex)?.[1]) || "Anonimo";

  useEffect(() => {
    if (Array.isArray(props.servicesData)) {
      setCompanyList([
        ...new Set(props.servicesData.map((item: any) => item.companyName)),
      ]);
    }
  }, []);

  useEffect(() => {
    if (props.servicesData && company === "TOTAL CONTRATISTAS") {
      setData(props.servicesData);
    }
    if (company !== "TOTAL CONTRATISTAS") {
      setData(
        props.servicesData.filter(
          (item: any) => item.companyName?.toUpperCase() === company
        )
      );
    }
  }, [props.servicesData, removeFilter, company]);

  useEffect(() => {
    let q;
    if (startDate && endDate) {
      async function fetchData() {
        const CompanySelectedHistory = capitalizeFirstLetter(
          company.toLowerCase()
        );
        q = query(
          collection(db, "ServiciosAIT"),
          orderBy("createdAt", "desc"),
          where("createdAt", ">=", startDate),
          where("createdAt", "<=", endDate)
          // where("companyName", "==", CompanySelectedHistory)
        );

        try {
          const querySnapshot = await getDocs(q);
          const lista: any = [];
          querySnapshot.forEach((doc) => {
            lista.push(doc.data());
          });

          setData(lista);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }

      fetchData();
    }
  }, [startDate, endDate]);

  //Changing the value to activate again the filter to rende the posts
  const filter = (start: any, end: any) => {
    setStartDate(start);
    setEndDate(end);
  };
  const quitfilter = () => {
    setRemoveFilter((prev) => !prev);
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <>
      <ScrollView
        style={{ backgroundColor: "white" }} // Add backgroundColor here
        showsVerticalScrollIndicator={false}
      >
        <Text></Text>

        <TouchableOpacity onPress={() => update_Data()}>
          <Image
            source={require("../../../assets/pictures/empresa.png")}
            style={styles.roundImageUpload}
          />
        </TouchableOpacity>

        <Text style={styles.company}>{companyName}</Text>

        <Text> </Text>
        <Text> </Text>

        <DateScreen
          filterButton={filter}
          quitFilterButton={() => quitfilter()}
        />

        <Text> </Text>
        <Text> </Text>

        <Text> </Text>
        <View style={styles.iconMinMax}>
          <View style={styles.container22}>
            <Text style={styles.titleText}>Historial Tipo Servicios </Text>
          </View>
          <TouchableOpacity onPress={() => setServiciosActivos(true)}>
            <Image
              source={require("../../../assets/pictures/plus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setServiciosActivos(false)}>
            <Image
              source={require("../../../assets/pictures/minus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>
        </View>

        {/* <PieChart data={data} /> */}

        {serviciosActivos && <ServiceList data={data} />}
        <Text> </Text>
        <Text> </Text>
        <View style={styles.iconMinMax}>
          <View style={styles.container22}>
            <Text style={styles.titleText}>Fecha Historial Servicios</Text>
          </View>
          <TouchableOpacity onPress={() => setEstadoServicios(true)}>
            <Image
              source={require("../../../assets/pictures/plus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEstadoServicios(false)}>
            <Image
              source={require("../../../assets/pictures/minus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>
        </View>
        {estadoServicios && <HistoryServiceList data={data} />}

        <Text> </Text>
        <Text> </Text>
        <View style={styles.iconMinMax}>
          <View style={styles.container22}>
            <Text style={styles.titleText}>Estado Historial Servicios</Text>
          </View>
          <TouchableOpacity onPress={() => setHistorial(true)}>
            <Image
              source={require("../../../assets/pictures/plus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setHistorial(false)}>
            <Image
              source={require("../../../assets/pictures/minus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>
        </View>
        {historial && <HistoryEstadoServiceList data={data} />}
        <Text> </Text>
        <Text> </Text>
        <View style={styles.iconMinMax}>
          <View style={styles.container22}>
            <Text style={styles.titleText}>Servicios Inactivos</Text>
          </View>
          <TouchableOpacity onPress={() => setServiciosInactivos(true)}>
            <Image
              source={require("../../../assets/pictures/plus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setServiciosInactivos(false)}>
            <Image
              source={require("../../../assets/pictures/minus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>
        </View>
        <Text> </Text>

        {serviciosInactivos && (
          <>
            <Text style={{ margin: 10 }}>
              <BarInactiveServices
                data={data}
                titulo={"Stand by"}
                unidad={"servicios"}
              />
            </Text>
            <Text style={{ marginLeft: 10 }}>
              <BarInactiveServices
                data={data}
                titulo={"Cancelacion"}
                unidad={"servicios"}
              />
            </Text>
            <InactiveServiceList data={data} />
          </>
        )}
        <Text> </Text>

        <View style={styles.iconMinMax}>
          <View style={styles.container22}>
            <Text style={styles.titleText}>Monto Servicios</Text>
          </View>
          <TouchableOpacity onPress={() => setMontoServicios(true)}>
            <Image
              source={require("../../../assets/pictures/plus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMontoServicios(false)}>
            <Image
              source={require("../../../assets/pictures/minus3.png")}
              style={styles.roundImageUploadmas}
            />
          </TouchableOpacity>
        </View>
        {montoServicios && (
          <>
            {/* <BarChartMontoServicios data={data} /> */}
            <MontoServiceList data={data} />
          </>
        )}
        <Text> </Text>
        <Text> </Text>

        <TouchableOpacity
          // style={styles.btnContainer4}
          onPress={() => getExcelReportData(data)}
        >
          <Image
            source={require("../../../assets/pictures/excel2.png")}
            style={styles.roundImageUpload}
          />
        </TouchableOpacity>
      </ScrollView>
      <Modal show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>
    </>
  );
};

const mapStateToProps = (reducers: any) => {
  return {
    servicesData: reducers.home.servicesData,
    email: reducers.profile.email,
  };
};

const HistoryScreen = connect(mapStateToProps, {})(HistoryScreenNoRedux);
export default HistoryScreen;
