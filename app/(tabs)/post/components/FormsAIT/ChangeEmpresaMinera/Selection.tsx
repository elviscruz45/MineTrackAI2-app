import { SelectList } from "react-native-dropdown-select-list";
import React, { useState } from "react";
import { tipoServicioList } from "../../../../../../utils/tipoServicioList";
import { mineraList } from "../../../../../../utils/MineraList";

 const SelectExample = (props: any) => {
  const [selected, setSelected] = useState("");
  const [list, setList] = useState([]);

  const { formik, setText } = props;

  function saveProperty(itemValue: any) {
    setText(itemValue);
  }

  return (
    <SelectList
      setSelected={(val: any) => setSelected(val)}
      data={mineraList}
      save="value"
      maxHeight={200}
      onSelect={() => saveProperty(selected)}
    />
  );
};

export default SelectExample;