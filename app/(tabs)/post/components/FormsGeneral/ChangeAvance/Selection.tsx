import { SelectList } from "react-native-dropdown-select-list";
import React, { useState } from "react";
import {
  etapaListGeneral,
  etapaListUsuario,
  etapaListContratista,
  etapaListUsuarioSupervision,
  etapaListContratistaPlanificador,
} from "../../../../../../utils/etapaList";
import { avance } from "../../../../../../utils/avance";
import { connect } from "react-redux";

const SelectExampleBare = (props: any) => {
  const [selected, setSelected] = useState("");
  const { setText, formik } = props;

  const regex = /@(.+?)\./i;

  const companyName = props.email?.match(regex)?.[1].toUpperCase() || "Anonimo";

  const userType = props.profile?.userType;

  function saveProperty(itemValue: any) {
    setText(itemValue);
  }
  return (
    <SelectList
      setSelected={(val: any) => setSelected(val)}
      data={avance}
      save="value"
      maxHeight={300}
      onSelect={() => saveProperty(selected)}
    />
  );
};

const mapStateToProps = (reducers: any) => {
  return {
    email: reducers.profile.email,
    profile: reducers.profile.profile,
  };
};

const SelectExample = connect(mapStateToProps, {})(SelectExampleBare);

export default SelectExample;
