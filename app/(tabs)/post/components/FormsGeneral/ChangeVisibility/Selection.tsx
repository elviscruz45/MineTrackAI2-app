import { SelectList } from "react-native-dropdown-select-list";
import React, { useState } from "react";
import { visibilityList } from "../../../../../../utils/visibilityList";

 const SelectExample = (props: any) => {
  const [selected, setSelected] = useState("");
  const [list, setList] = useState([]);

  const { setText, formik } = props;

  function saveProperty(itemValue: any) {
    setText(itemValue);
  }

  return (
    <SelectList
      setSelected={(val: any) => setSelected(val)}
      data={visibilityList}
      save="value"
      maxHeight={100}
      onSelect={() => saveProperty(selected)}
    />
  );
};

export default SelectExample;