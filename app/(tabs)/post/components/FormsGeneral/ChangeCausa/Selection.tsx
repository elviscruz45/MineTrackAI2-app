import { SelectList } from "react-native-dropdown-select-list";
import React, { useState } from "react";
import { causaList } from "../../../../../../utils/causaList";

const SelectExample = (props: any) => {
  const [selected, setSelected] = useState("");
  const { setText } = props;

  function saveProperty(itemValue: any) {
    setText(itemValue);
  }

  return (
    <SelectList
      setSelected={(val: any) => setSelected(val)}
      data={causaList}
      save="value"
      maxHeight={250}
      onSelect={() => saveProperty(selected)}
      search={false}
    />
  );
};

export default SelectExample;
