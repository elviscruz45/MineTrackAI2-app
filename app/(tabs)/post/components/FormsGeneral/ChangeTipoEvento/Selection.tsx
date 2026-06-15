import { SelectList } from "react-native-dropdown-select-list";
import React, { useState } from "react";
import { tipoEventoList } from "../../../../../../utils/tipoEventoList";

const SelectExample = (props: any) => {
  const [selected, setSelected] = useState("");
  const { setText } = props;

  function saveProperty(itemValue: any) {
    setText(itemValue);
  }

  return (
    <SelectList
      setSelected={(val: any) => setSelected(val)}
      data={tipoEventoList}
      save="value"
      maxHeight={200}
      onSelect={() => saveProperty(selected)}
      search={false}
    />
  );
};

export default SelectExample;
