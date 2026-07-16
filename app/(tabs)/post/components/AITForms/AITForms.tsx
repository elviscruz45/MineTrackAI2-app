import {
  View,
  Text,
  Platform,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import styles from "./AITForms.styles";
import { Input } from "@rneui/themed";
import { MaterialCommunityIcon } from "@/components/MaterialCommunityIcon";
import { Modal } from "@/components/Modal/Modal";
import { Ionicon as Ionicons } from "@/components/icons/AppIcon";
import ChangeDisplayEmpresaMinera from "../FormsAIT/ChangeEmpresaMinera/ChangeDisplayEmpresaMinera";
import ChangeDisplayArea from "../FormsAIT/ChangeArea/ChangeDisplayArea";
import ChangeDisplayTipoServicio from "../FormsAIT/ChangeTipoServicio/ChangeDisplayTipoServicio";
import ChangeDisplayAdminContracts from "../FormsAIT/ChangeContratos/ChangeDisplayContratos";
import ChangeDisplayAdminContracts2 from "../FormsAIT/ChangeContratos2/ChangeDisplayContratos2";
import ChangeDisplayAdminContracts3 from "../FormsAIT/ChangeContratos3/ChangeDisplayContratos3";
import ChangeDisplayAdminContratista from "../FormsAIT/ChangeContratista/ChangeDisplayContratista";
import ChangeDisplayAdminContratista2 from "../FormsAIT/ChangeContratista2/ChangeDisplayContratista2";
import ChangeDisplayAdminContratista3 from "../FormsAIT/ChangeContratista3/ChangeDisplayContratista3";
import ChangeDisplaynumeroCot from "../FormsAIT/ChangeNumeroCot/ChangeDisplayNumeroCot";
import ChangeDisplayMonto from "../FormsAIT/ChangeNumeroMonto/ChangeDisplayMonto";
import ChangeSupervisorSeguridad from "../FormsAIT/ChangeSupervisorSeguridad/ChangeSupervisorSeguridad";
import ChangeSupervisor from "../FormsAIT/ChangeSupervisor/ChangeSupervisor";
import ChangeTecnicos from "../FormsAIT/ChangeTecnicos/ChangeTecnicos";
import ChangeDisplayMoneda from "../FormsAIT/ChangeMoneda/ChangeDisplayTipoServicio";
import ChangeDisplayFechaFin from "../FormsAIT/ChangeFechaFin/ChangeDisplayFechaFin";
import ChangeDisplayFechaInicio from "../FormsAIT/ChangeFechaInicio/ChangeDisplayFechaInicio";
import ChangeTagEquipo from "../FormsAIT/ChangeTagEquipo/ChangeTagEquipo";

function SectionCard({
  icon,
  title,
  hint,
  children,
}: {
  icon: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons name={icon} size={18} color="#2A3B76" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

function toDatetimeLocalValue(date: Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDatePreview(item: Date | null | undefined) {
  if (!item) return "";
  const date = new Date(item);
  const monthNames = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()} · ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function parseDatetimeLocal(value: string): Date | null {
  if (!value) return null;
  const [dateStr, timeStr] = value.split("T");
  const [year, month, day] = dateStr.split("-");
  const [hours, minutes] = timeStr ? timeStr.split(":") : ["00", "00"];
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes)
  );
}

function computeHorasFromDates(inicio: Date | null, fin: Date | null): string {
  if (!inicio || !fin) return "";
  const diff = new Date(fin).getTime() - new Date(inicio).getTime();
  if (diff <= 0) return "";
  return String(Math.round(diff / 3600000));
}

function AITForms(props: any) {
  const { formik, setTituloserv, setAit, setTiposerv, setArea } = props;
  const noop = () => {};
  const [renderComponent, setRenderComponent] = useState<any>("");
  const [showModal, setShowModal] = useState(false);
  const onCloseOpenModal = () => setShowModal((prev) => !prev);

  const inputContainerStyle = { paddingHorizontal: 0 };
  const inputStyle = { fontSize: 15 };

  const selectComponent = (key: string) => {
    const map: Record<string, React.ReactNode> = {
      EmpresaMinera: (
        <ChangeDisplayEmpresaMinera onClose={onCloseOpenModal} formik={formik} setMinera={() => {}} />
      ),
      AreaServicio: (
        <ChangeDisplayArea
          onClose={onCloseOpenModal}
          formik={formik}
          setAreaservicio={noop}
          setArea={setArea ?? noop}
        />
      ),
      TipoServicio: (
        <ChangeDisplayTipoServicio
          onClose={onCloseOpenModal}
          formik={formik}
          setTiposervicio={noop}
          setTiposerv={setTiposerv ?? noop}
        />
      ),
      ResponsableEmpresaUsuario: (
        <ChangeDisplayAdminContracts onClose={onCloseOpenModal} formik={formik} setResponsableempresausuario={() => {}} />
      ),
      ResponsableEmpresaUsuario2: (
        <ChangeDisplayAdminContracts2 onClose={onCloseOpenModal} formik={formik} setResponsableempresausuario2={() => {}} />
      ),
      ResponsableEmpresaUsuario3: (
        <ChangeDisplayAdminContracts3 onClose={onCloseOpenModal} formik={formik} setResponsableempresausuario3={() => {}} />
      ),
      ResponsableEmpresaContratista: (
        <ChangeDisplayAdminContratista onClose={onCloseOpenModal} formik={formik} setResponsableempresacontratista={() => {}} />
      ),
      ResponsableEmpresaContratista2: (
        <ChangeDisplayAdminContratista2 onClose={onCloseOpenModal} formik={formik} setResponsableempresacontratista2={() => {}} />
      ),
      ResponsableEmpresaContratista3: (
        <ChangeDisplayAdminContratista3 onClose={onCloseOpenModal} formik={formik} setResponsableempresacontratista3={() => {}} />
      ),
      FechaInicio: (
        <ChangeDisplayFechaInicio onClose={onCloseOpenModal} formik={formik} setFechaInicio={() => {}} />
      ),
      FechaFin: (
        <ChangeDisplayFechaFin onClose={onCloseOpenModal} formik={formik} setFechafin={() => {}} />
      ),
      NumeroCotizacion: (
        <ChangeDisplaynumeroCot onClose={onCloseOpenModal} formik={formik} setNumerocotizacion={() => {}} />
      ),
      Moneda: (
        <ChangeDisplayMoneda onClose={onCloseOpenModal} formik={formik} setMoneda={() => {}} />
      ),
      Monto: (
        <ChangeDisplayMonto onClose={onCloseOpenModal} formik={formik} setMonto={() => {}} />
      ),
      SupervisorSeguridad: (
        <ChangeSupervisorSeguridad onClose={onCloseOpenModal} formik={formik} setSupervisorSeguridad={() => {}} />
      ),
      Supervisor: (
        <ChangeSupervisor onClose={onCloseOpenModal} formik={formik} setSupervisor={() => {}} />
      ),
      Tecnicos: (
        <ChangeTecnicos onClose={onCloseOpenModal} formik={formik} setTecnicos={() => {}} />
      ),
      TagEquipo: (
        <ChangeTagEquipo onClose={onCloseOpenModal} formik={formik} setTagequipo={() => {}} />
      ),
    };
    setRenderComponent(map[key] || null);
    onCloseOpenModal();
  };

  const pickerIcon = (key: string) => (
    <MaterialCommunityIcon
      name="arrow-right-circle-outline"
      color="#c2c2c2"
      onPress={() => selectComponent(key)}
    />
  );

  const handleDateChange = (
    field: "FechaInicio" | "FechaFin",
    value: string
  ) => {
    const selected = parseDatetimeLocal(value);
    formik.setFieldValue(field, selected);
    const inicio = field === "FechaInicio" ? selected : formik.values.FechaInicio;
    const fin = field === "FechaFin" ? selected : formik.values.FechaFin;
    if (!formik.values.HorasTotales) {
      const suggested = computeHorasFromDates(inicio, fin);
      if (suggested) formik.setFieldValue("HorasTotales", suggested);
    }
  };

  const renderWebDate = (
    label: string,
    field: "FechaInicio" | "FechaFin",
    error?: string
  ) => (
    <View style={styles.dateWebWrap}>
      <Text style={styles.fieldLabel}>{label} *</Text>
      <input
        type="datetime-local"
        style={styles.dateWebInput}
        value={toDatetimeLocalValue(formik.values[field])}
        onChange={(e: any) => handleDateChange(field, e.target.value)}
      />
      {formik.values[field] ? (
        <Text style={styles.datePreview}>{formatDatePreview(formik.values[field])}</Text>
      ) : null}
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );

  const renderNativeDate = (
    label: string,
    field: "FechaInicio" | "FechaFin",
    error?: string
  ) => (
    <Input
      value={formik.values[field]?.toLocaleString?.() || ""}
      label={`${label} *`}
      editable={false}
      errorMessage={error}
      rightIcon={pickerIcon(field)}
      inputContainerStyle={inputContainerStyle}
      inputStyle={inputStyle}
    />
  );

  return (
    <View style={styles.container}>
      <SectionCard
        icon="barcode-outline"
        title="Identificación · Nivel 4"
        hint="Obligatorio: código WBS, nombre, área y tag. El resto es opcional."
      >
        <Input
          value={formik.values.Codigo}
          label="Código WBS *"
          placeholder="1.1.1.1"
          autoCapitalize="none"
          onChangeText={(text) => formik.setFieldValue("Codigo", text.trim())}
          onBlur={() => formik.setFieldTouched("Codigo", true)}
          errorMessage={formik.touched.Codigo ? formik.errors.Codigo : undefined}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.NombreServicio}
          label="Nombre de la actividad *"
          onChangeText={(text) => {
            formik.setFieldValue("NombreServicio", text);
            setTituloserv?.(text);
          }}
          onBlur={() => formik.setFieldTouched("NombreServicio", true)}
          errorMessage={formik.touched.NombreServicio ? formik.errors.NombreServicio : undefined}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.NumeroAIT}
          label="Nº referencia / Orden de compra"
          placeholder="Opcional — se genera automáticamente"
          onChangeText={(text) => {
            formik.setFieldValue("NumeroAIT", text);
            setAit?.(text);
          }}
          onBlur={() => formik.setFieldTouched("NumeroAIT", true)}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.EmpresaMinera}
          label="Empresa minera"
          onChangeText={(text) => formik.setFieldValue("EmpresaMinera", text)}
          rightIcon={pickerIcon("EmpresaMinera")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.AreaServicio}
          label="Área del servicio *"
          editable={false}
          errorMessage={formik.touched.AreaServicio ? formik.errors.AreaServicio : undefined}
          rightIcon={pickerIcon("AreaServicio")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.TagEquipo}
          label="Tag del equipo *"
          placeholder="Seleccionar de la lista..."
          onChangeText={(text) => formik.setFieldValue("TagEquipo", text)}
          onBlur={() => formik.setFieldTouched("TagEquipo", true)}
          errorMessage={formik.touched.TagEquipo ? formik.errors.TagEquipo : undefined}
          rightIcon={pickerIcon("TagEquipo")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
      </SectionCard>

      <SectionCard
        icon="calendar-outline"
        title="Planificación"
        hint="Obligatorio: fechas y ruta crítica. Horas se calculan desde las fechas si no las ingresa."
      >
        <Input
          value={formik.values.TipoServicio}
          label="Tipo de servicio"
          editable={false}
          rightIcon={pickerIcon("TipoServicio")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />

        <Text style={styles.fieldLabel}>¿Es ruta crítica? *</Text>
        <View style={styles.rutaCriticaRow}>
          {(["Si", "No"] as const).map((opt) => {
            const active = formik.values.esRutaCritica === opt;
            return (
              <Pressable
                key={opt}
                style={[styles.rutaBtn, active && styles.rutaBtnActive]}
                onPress={() => formik.setFieldValue("esRutaCritica", opt)}
              >
                <Text style={[styles.rutaBtnText, active && styles.rutaBtnTextActive]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {formik.touched.esRutaCritica && formik.errors.esRutaCritica ? (
          <Text style={styles.fieldError}>{formik.errors.esRutaCritica}</Text>
        ) : null}

        {Platform.OS === "web"
          ? renderWebDate("Fecha de inicio", "FechaInicio", formik.touched.FechaInicio ? formik.errors.FechaInicio : undefined)
          : renderNativeDate("Fecha de inicio", "FechaInicio", formik.touched.FechaInicio ? formik.errors.FechaInicio : undefined)}

        {Platform.OS === "web"
          ? renderWebDate("Fecha de fin", "FechaFin", formik.touched.FechaFin ? formik.errors.FechaFin : undefined)
          : renderNativeDate("Fecha de fin", "FechaFin", formik.touched.FechaFin ? formik.errors.FechaFin : undefined)}

        <View style={styles.row2}>
          <View style={styles.row2Item}>
            <Input
              value={String(formik.values.HorasTotales ?? "")}
              label="Horas totales programadas"
              keyboardType="numeric"
              placeholder="Opcional — se calcula desde fechas"
              onChangeText={(text) =>
                formik.setFieldValue("HorasTotales", text.replace(/[^0-9.]/g, ""))
              }
              inputContainerStyle={inputContainerStyle}
              inputStyle={inputStyle}
            />
          </View>
          <View style={styles.row2Item}>
            <Input
              value={String(formik.values.HorasHombre ?? "")}
              label="Horas hombre reales (opcional)"
              keyboardType="numeric"
              onChangeText={(text) =>
                formik.setFieldValue("HorasHombre", text.replace(/[^0-9.]/g, ""))
              }
              inputContainerStyle={inputContainerStyle}
              inputStyle={inputStyle}
            />
          </View>
        </View>
        {formik.values.FechaInicio && formik.values.FechaFin ? (
          <TouchableOpacity
            onPress={() => {
              const h = computeHorasFromDates(
                formik.values.FechaInicio,
                formik.values.FechaFin
              );
              if (h) formik.setFieldValue("HorasTotales", h);
            }}
            style={{ marginHorizontal: 10, marginBottom: 8 }}
          >
            <Text style={{ color: "#2A3B76", fontSize: 13, fontWeight: "600" }}>
              Calcular horas desde fechas →{" "}
              {computeHorasFromDates(formik.values.FechaInicio, formik.values.FechaFin) || "—"} h
            </Text>
          </TouchableOpacity>
        ) : null}
      </SectionCard>

      <SectionCard
        icon="people-outline"
        title="Responsables"
        hint="Opcional. Útil para la tabla de trabajos adicionales en reportes."
      >
        <Input
          value={formik.values.ResponsableEmpresaUsuario}
          label="Administrador de contrato"
          editable={false}
          rightIcon={pickerIcon("ResponsableEmpresaUsuario")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.ResponsableEmpresaUsuario2}
          label="Planner"
          editable={false}
          rightIcon={pickerIcon("ResponsableEmpresaUsuario2")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.ResponsableEmpresaUsuario3}
          label="Supervisor mina"
          editable={false}
          rightIcon={pickerIcon("ResponsableEmpresaUsuario3")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.ResponsableEmpresaContratista}
          label="Admin EECC"
          editable={false}
          rightIcon={pickerIcon("ResponsableEmpresaContratista")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.ResponsableEmpresaContratista2}
          label="Planificador EECC"
          editable={false}
          rightIcon={pickerIcon("ResponsableEmpresaContratista2")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <Input
          value={formik.values.ResponsableEmpresaContratista3}
          label="Supervisor EECC"
          editable={false}
          rightIcon={pickerIcon("ResponsableEmpresaContratista3")}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
      </SectionCard>

      <SectionCard
        icon="cash-outline"
        title="Costos y dotación"
        hint="Opcional. No afecta Curva S ni ruta crítica."
      >
        <Input
          value={formik.values.NumeroCotizacion}
          label="Nº cotización"
          onChangeText={(text) => formik.setFieldValue("NumeroCotizacion", text)}
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
        <View style={styles.row2}>
          <View style={styles.row2Item}>
            <Input
              value={formik.values.Moneda}
              label="Moneda"
              editable={false}
              rightIcon={pickerIcon("Moneda")}
              inputContainerStyle={inputContainerStyle}
              inputStyle={inputStyle}
            />
          </View>
          <View style={styles.row2Item}>
            <Input
              value={formik.values.Monto}
              label="Monto total"
              keyboardType="numeric"
              onChangeText={(text) =>
                formik.setFieldValue("Monto", text.replace(/[^0-9.]/g, ""))
              }
              inputContainerStyle={inputContainerStyle}
              inputStyle={inputStyle}
            />
          </View>
        </View>

        <View style={styles.row2}>
          <View style={styles.row2Item}>
            <Input
              value={formik.values.SupervisorSeguridad}
              label="# Sup. seguridad"
              keyboardType="numeric"
              onChangeText={(text) =>
                formik.setFieldValue("SupervisorSeguridad", text.replace(/[^0-9]/g, ""))
              }
              inputContainerStyle={inputContainerStyle}
              inputStyle={inputStyle}
            />
          </View>
          <View style={styles.row2Item}>
            <Input
              value={formik.values.Supervisor}
              label="# Supervisores"
              keyboardType="numeric"
              onChangeText={(text) =>
                formik.setFieldValue("Supervisor", text.replace(/[^0-9]/g, ""))
              }
              inputContainerStyle={inputContainerStyle}
              inputStyle={inputStyle}
            />
          </View>
        </View>

        <View style={styles.row2}>
          <View style={styles.row2Item}>
            <Input
              value={formik.values.Tecnicos}
              label="# Técnicos"
              keyboardType="numeric"
              onChangeText={(text) =>
                formik.setFieldValue("Tecnicos", text.replace(/[^0-9]/g, ""))
              }
              inputContainerStyle={inputContainerStyle}
              inputStyle={inputStyle}
            />
          </View>
          <View style={styles.row2Item}>
            <Input
              value={formik.values.Lider}
              label="# Líder técnico"
              keyboardType="numeric"
              onChangeText={(text) =>
                formik.setFieldValue("Lider", text.replace(/[^0-9]/g, ""))
              }
              inputContainerStyle={inputContainerStyle}
              inputStyle={inputStyle}
            />
          </View>
        </View>

        <Input
          value={formik.values.Soldador}
          label="# Soldadores"
          keyboardType="numeric"
          onChangeText={(text) =>
            formik.setFieldValue("Soldador", text.replace(/[^0-9]/g, ""))
          }
          inputContainerStyle={inputContainerStyle}
          inputStyle={inputStyle}
        />
      </SectionCard>

      <Modal show={showModal} close={onCloseOpenModal}>
        {renderComponent}
      </Modal>
    </View>
  );
}

export default AITForms;
